/* asset recovery v16: resilient media loading for saved Adsela homepage without fighting branding/menu controllers */
(function(){
  'use strict';
  const ORIGIN='https://adselams.com/';
  const ORIGIN_HOST='adselams.com';
  const OLD_BRAND_RE=/(adsela(?:[-_ ]?new)?[-_ ]?logo\d*|adsela[-_ ]?logo|logo[-_ ]?adsela|adsela-icon-footer|cropped-fav-icon|logo-png-white-01|elnashargroup-(?:logo|icon))/i;
  let delayedStarted=false;
  let mutationScheduled=false;

  const isPlaceholder=(u)=>!u || /^data:image\/(?:svg\+xml|gif)/i.test(u) || /^about:blank$/i.test(u);
  const isSpecial=(u)=>/^(?:data:|blob:|javascript:|#)/i.test((u||'').trim());

  function proxy(url){
    if(!url||typeof url!=='string') return url;
    const u=url.trim();
    if(!u||isSpecial(u)) return u;
    if(u.startsWith('//'+ORIGIN_HOST+'/')) return '/origin/'+u.slice(ORIGIN_HOST.length+3);
    if(u.startsWith(ORIGIN)) return '/origin/'+u.slice(ORIGIN.length);
    return u;
  }

  function direct(url){
    if(!url||typeof url!=='string') return url;
    const u=url.trim();
    if(u.startsWith('/origin/')) return ORIGIN+u.slice('/origin/'.length);
    return u;
  }

  function srcset(value,mode){
    if(!value) return value;
    const fn=mode==='direct'?direct:proxy;
    return value.split(',').map(part=>{
      const bits=part.trim().split(/\s+/);
      if(bits[0]) bits[0]=fn(bits[0]);
      return bits.join(' ');
    }).join(', ');
  }

  function isBrandImage(el){
    if(!el||el.tagName!=='IMG') return false;
    const hay=['src','data-src','data-lazy-src','data-original','srcset','data-srcset','data-lazy-srcset','alt']
      .map(a=>el.getAttribute(a)).filter(Boolean).join(' ');
    const alt=(el.getAttribute('alt')||'').trim();
    return OLD_BRAND_RE.test(hay)||/^logo$/i.test(alt)||/^ELNASHARGROUP$/i.test(alt);
  }

  function remember(el,url){
    if(!el||!url||isPlaceholder(url)) return;
    if(!el.dataset.nasharOriginalSrc) el.dataset.nasharOriginalSrc=url;
  }

  function markReady(el){
    if(!el||el.nodeType!==1) return;
    el.dataset.nasharMediaReady='1';
    delete el.dataset.nasharMediaError;
    delete el.dataset.nasharAllowDirect;
    el.style.removeProperty('visibility');
    el.style.removeProperty('opacity');
  }

  function restoreBackground(el){
    if(!el||!el.getAttribute) return;
    const bgAttrs=['data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url'];
    for(const attr of bgAttrs){
      const val=el.getAttribute(attr);
      if(!val) continue;
      const chosen=(attr==='data-bg-hidpi'&&window.devicePixelRatio<=1)?null:proxy(val);
      if(chosen){
        if(attr.includes('overlay')) el.style.setProperty('--nashar-overlay-image','url("'+chosen+'")');
        else el.style.backgroundImage='url("'+chosen+'")';
      }
      if(attr==='data-bg'||attr==='data-bg-hidpi'||attr==='data-background-image') el.removeAttribute(attr);
    }
    const style=el.getAttribute('style');
    if(style&&/https?:\/\/adselams\.com\//i.test(style)){
      el.setAttribute('style',style.replace(/https?:\/\/adselams\.com\//gi,'/origin/'));
    }
  }

  function restoreElement(el){
    if(!el||!el.getAttribute) return;
    restoreBackground(el);

    const tag=el.tagName;
    if(tag!=='IMG'&&tag!=='SOURCE'&&tag!=='IFRAME'&&tag!=='VIDEO') return;
    if(tag==='IMG'&&isBrandImage(el)) return;

    const lazySrc=el.getAttribute('data-src')||el.getAttribute('data-lazy-src')||el.getAttribute('data-original')||el.getAttribute('data-lazyload');
    const current=el.getAttribute('src');
    if(lazySrc){
      remember(el,lazySrc);
      if(isPlaceholder(current)||current!==proxy(lazySrc)) el.setAttribute('src',proxy(lazySrc));
      ['data-src','data-lazy-src','data-original','data-lazyload'].forEach(a=>el.removeAttribute(a));
    }else if(current&&/^https?:\/\/adselams\.com\//i.test(current)&&el.dataset.nasharAllowDirect!=='1'){
      remember(el,current);
      el.setAttribute('src',proxy(current));
    }else if(current&&!isPlaceholder(current)){
      remember(el,current);
    }

    const lazySet=el.getAttribute('data-srcset')||el.getAttribute('data-lazy-srcset');
    const currentSet=el.getAttribute('srcset');
    if(lazySet){
      el.setAttribute('srcset',srcset(lazySet,'proxy'));
      el.removeAttribute('data-srcset');el.removeAttribute('data-lazy-srcset');
    }else if(currentSet&&/https?:\/\/adselams\.com\//i.test(currentSet)&&el.dataset.nasharAllowDirect!=='1'){
      el.setAttribute('srcset',srcset(currentSet,'proxy'));
    }

    const sizes=el.getAttribute('data-sizes');
    if(sizes){el.setAttribute('sizes',sizes);el.removeAttribute('data-sizes')}

    const poster=el.getAttribute('data-poster');
    if(poster){el.setAttribute('poster',proxy(poster));el.removeAttribute('data-poster')}
    else if(el.getAttribute('poster')&&/^https?:\/\/adselams\.com\//i.test(el.getAttribute('poster'))) el.setAttribute('poster',proxy(el.getAttribute('poster')));

    if(el.hasAttribute('data-lazyloaded')) el.removeAttribute('data-lazyloaded');
    if(tag==='IMG'){
      el.referrerPolicy='no-referrer';
      el.decoding='async';
      el.dataset.nasharMediaManaged='1';
      if(el.complete&&el.naturalWidth>0) markReady(el);
    }
  }

  function restoreMedia(root){
    const scope=root||document;
    if(scope.matches&&scope.matches('img,source,iframe,video,[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url],[style]')) restoreElement(scope);
    if(scope.querySelectorAll) scope.querySelectorAll('img,source,iframe,video,[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url],[style]').forEach(restoreElement);
  }

  function candidateList(img){
    const list=[];
    const add=u=>{if(u&&!isPlaceholder(u)&&!list.includes(u)) list.push(u)};
    const cur=img.currentSrc||img.getAttribute('src')||'';
    const original=img.dataset.nasharOriginalSrc||'';
    add(cur.startsWith('/origin/')?direct(cur):proxy(cur));
    add(cur.startsWith('/origin/')?cur:direct(cur));
    add(proxy(original));add(direct(original));
    const set=img.getAttribute('srcset')||'';
    set.split(',').forEach(p=>{const u=p.trim().split(/\s+/)[0];add(proxy(u));add(direct(u))});
    [...list].forEach(u=>{
      if(/\.webp(?:\?.*)?$/i.test(u)) add(u.replace(/\.webp(\?.*)?$/i,'$1'));
      if(/\?.+/.test(u)) add(u.split('?')[0]);
    });
    return list;
  }

  function recoverBrokenImage(img){
    if(!img||isBrandImage(img)) return;
    img.dataset.nasharMediaError='1';
    const candidates=candidateList(img);
    let tried=[];
    try{tried=JSON.parse(img.dataset.nasharTried||'[]')}catch(e){}
    const next=candidates.find(u=>!tried.includes(u));
    if(next){
      tried.push(next);img.dataset.nasharTried=JSON.stringify(tried.slice(-12));
      if(/^https?:\/\/adselams\.com\//i.test(next)) img.dataset.nasharAllowDirect='1'; else delete img.dataset.nasharAllowDirect;
      img.removeAttribute('srcset');
      img.setAttribute('src',next);
      img.style.removeProperty('visibility');img.style.removeProperty('opacity');
      return;
    }
    /* Never hide a failed image. Keep its box visible so layout does not collapse. */
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');
  }

  function stabilizeReferenceAreas(){
    const partner=document.getElementById('uc_logo_carousel_elementor_c98c777');
    if(partner){
      partner.querySelectorAll('img').forEach(img=>{
        if(isBrandImage(img)) return;
        restoreElement(img);
        img.style.setProperty('object-fit','contain','important');
        img.style.setProperty('object-position','center','important');
        if(img.complete&&img.naturalWidth>0) markReady(img);
      });
    }
  }

  function rewriteDelayedScriptSources(){
    document.querySelectorAll('script[type="litespeed/javascript"][data-src]').forEach(s=>{
      const u=s.getAttribute('data-src');
      if(u) s.setAttribute('data-src',proxy(u));
    });
  }

  function forceDelayedScripts(){
    if(delayedStarted) return;
    delayedStarted=true;
    rewriteDelayedScriptSources();
    if(typeof window.litespeed_load_delayed_js_force==='function'){
      try{window.litespeed_load_delayed_js_force()}catch(e){console.warn('LiteSpeed delayed JS restore:',e)}
      setTimeout(()=>{restoreMedia(document);stabilizeReferenceAreas()},250);
      return;
    }
    const queue=[...document.querySelectorAll('script[type="litespeed/javascript"]:not([data-nashar-executed])')];
    const run=async()=>{
      for(const old of queue){
        old.dataset.nasharExecuted='1';
        await new Promise(resolve=>{
          const s=document.createElement('script');
          [...old.attributes].forEach(a=>{if(!['type','data-src','data-nashar-executed'].includes(a.name))s.setAttribute(a.name,a.value)});
          const src=old.getAttribute('data-src');
          if(src){s.src=proxy(src);s.onload=s.onerror=resolve}else{s.textContent=old.textContent;setTimeout(resolve,0)}
          old.after(s);
        });
      }
      document.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
      window.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
      restoreMedia(document);stabilizeReferenceAreas();
    };
    run();
  }

  function sweep(){restoreMedia(document);stabilizeReferenceAreas()}

  function start(){
    document.addEventListener('load',e=>{if(e.target&&e.target.tagName==='IMG')markReady(e.target)},true);
    document.addEventListener('error',e=>{if(e.target&&e.target.tagName==='IMG')recoverBrokenImage(e.target)},true);
    sweep();
    rewriteDelayedScriptSources();
    setTimeout(forceDelayedScripts,80);
    [250,900,1800,4000].forEach(t=>setTimeout(sweep,t));

    const mo=new MutationObserver(ms=>{
      if(mutationScheduled) return;
      mutationScheduled=true;
      requestAnimationFrame(()=>{
        mutationScheduled=false;
        for(const m of ms){
          if(m.type==='attributes') restoreElement(m.target);
          else m.addedNodes.forEach(n=>{if(n.nodeType===1)restoreMedia(n)});
        }
        stabilizeReferenceAreas();
      });
    });
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset','data-src','data-lazy-src','data-original','data-srcset','data-lazy-srcset','data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url','poster','data-poster','style']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
