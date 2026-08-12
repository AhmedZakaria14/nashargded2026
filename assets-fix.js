/* asset recovery v19: resilient cloned-media recovery with server fallback, without competing with Elementor/Owl motion. */
(function(){
  'use strict';
  if(window.__nasharAssetsV19)return;
  window.__nasharAssetsV19=true;

  const ORIGIN='https://adselams.com/';
  const ORIGIN_HOST='adselams.com';
  const OLD_BRAND_RE=/(adsela(?:[-_ ]?new)?[-_ ]?logo\d*|adsela[-_ ]?logo|logo[-_ ]?adsela|adsela-icon-footer|cropped-fav-icon|logo-png-white-01|elnashargroup-(?:logo|icon))/i;
  let delayedStarted=false;
  let mutationScheduled=false;
  let litespeedEventSent=false;

  const isPlaceholder=u=>!u||/^data:image\/(?:svg\+xml|gif)/i.test(u)||/^about:blank$/i.test(u);
  const isSpecial=u=>/^(?:data:|blob:|javascript:|#)/i.test((u||'').trim());

  function originAbsolute(url){
    if(!url||typeof url!=='string')return '';
    const u=url.trim();
    if(!u||isSpecial(u))return '';
    if(u.startsWith('/api/media?')){
      try{return new URL(u,location.origin).searchParams.get('u')||''}catch(e){return ''}
    }
    if(u.startsWith('/origin/'))return ORIGIN+u.slice('/origin/'.length);
    if(u.startsWith('//'+ORIGIN_HOST+'/'))return 'https:'+u;
    if(/^https?:\/\/(?:www\.)?adselams\.com\//i.test(u))return u.replace(/^http:/i,'https:');
    if(/^\/?(?:wp-content|wp-includes)\//i.test(u))return ORIGIN+u.replace(/^\//,'');
    return '';
  }

  function mediaProxy(url){
    const abs=originAbsolute(url);
    return abs?'/api/media?u='+encodeURIComponent(abs):url;
  }

  function proxy(url){
    if(!url||typeof url!=='string')return url;
    const u=url.trim();
    if(!u||isSpecial(u))return u;
    if(u.startsWith('//'+ORIGIN_HOST+'/'))return '/origin/'+u.slice(ORIGIN_HOST.length+3);
    if(u.startsWith(ORIGIN))return '/origin/'+u.slice(ORIGIN.length);
    if(u.startsWith('http://'+ORIGIN_HOST+'/'))return '/origin/'+u.slice(('http://'+ORIGIN_HOST+'/').length);
    return u;
  }

  function direct(url){
    if(!url||typeof url!=='string')return url;
    const u=url.trim();
    if(u.startsWith('/origin/'))return ORIGIN+u.slice('/origin/'.length);
    const abs=originAbsolute(u);
    return abs||u;
  }

  function srcset(value,mode){
    if(!value)return value;
    const fn=mode==='direct'?direct:mode==='server'?mediaProxy:proxy;
    return value.split(',').map(part=>{
      const bits=part.trim().split(/\s+/);
      if(bits[0])bits[0]=fn(bits[0]);
      return bits.join(' ');
    }).join(', ');
  }

  function isBrandImage(el){
    if(!el||el.tagName!=='IMG')return false;
    const hay=['src','data-src','data-lazy-src','data-original','srcset','data-srcset','data-lazy-srcset','alt']
      .map(a=>el.getAttribute(a)).filter(Boolean).join(' ');
    const alt=(el.getAttribute('alt')||'').trim();
    return OLD_BRAND_RE.test(hay)||/^logo$/i.test(alt)||/^ELNASHARGROUP$/i.test(alt)||/^النشار جروب$/i.test(alt);
  }

  function remember(el,url){
    if(!el||!url||isPlaceholder(url))return;
    const abs=originAbsolute(url)||url;
    if(!el.dataset.nasharOriginalSrc)el.dataset.nasharOriginalSrc=abs;
  }

  function markReady(el){
    if(!el||el.nodeType!==1)return;
    el.dataset.nasharMediaReady='1';
    delete el.dataset.nasharMediaError;
    delete el.dataset.nasharAllowDirect;
    el.style.removeProperty('visibility');
    el.style.removeProperty('opacity');
  }

  function rewriteStyleUrls(style){
    if(!style||typeof style!=='string')return style;
    return style.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi,(all,q,url)=>{
      const abs=originAbsolute(url);
      if(!abs)return all;
      return 'url("'+mediaProxy(abs)+'")';
    });
  }

  function restoreBackground(el){
    if(!el||!el.getAttribute)return;
    const bgAttrs=['data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url'];
    for(const attr of bgAttrs){
      const val=el.getAttribute(attr);
      if(!val)continue;
      const chosen=(attr==='data-bg-hidpi'&&window.devicePixelRatio<=1)?null:mediaProxy(val);
      if(chosen){
        if(attr.includes('overlay'))el.style.setProperty('--nashar-overlay-image','url("'+chosen+'")');
        else el.style.backgroundImage='url("'+chosen+'")';
      }
      if(attr==='data-bg'||attr==='data-bg-hidpi'||attr==='data-background-image')el.removeAttribute(attr);
    }
    const style=el.getAttribute('style');
    const fixed=rewriteStyleUrls(style);
    if(fixed&&fixed!==style)el.setAttribute('style',fixed);
  }

  function restoreElement(el){
    if(!el||!el.getAttribute)return;
    restoreBackground(el);

    const tag=el.tagName;
    if(tag!=='IMG'&&tag!=='SOURCE'&&tag!=='IFRAME'&&tag!=='VIDEO')return;
    if(tag==='IMG'&&isBrandImage(el))return;

    const lazySrc=el.getAttribute('data-src')||el.getAttribute('data-lazy-src')||el.getAttribute('data-original')||el.getAttribute('data-lazyload');
    const current=el.getAttribute('src');
    if(lazySrc){
      remember(el,lazySrc);
      if(isPlaceholder(current)||current!==proxy(lazySrc))el.setAttribute('src',proxy(lazySrc));
      ['data-src','data-lazy-src','data-original','data-lazyload'].forEach(a=>el.removeAttribute(a));
    }else if(current&&/^https?:\/\/(?:www\.)?adselams\.com\//i.test(current)&&el.dataset.nasharAllowDirect!=='1'){
      remember(el,current);
      el.setAttribute('src',proxy(current));
    }else if(current&&!isPlaceholder(current))remember(el,current);

    const lazySet=el.getAttribute('data-srcset')||el.getAttribute('data-lazy-srcset');
    const currentSet=el.getAttribute('srcset');
    if(lazySet){
      el.setAttribute('srcset',srcset(lazySet,'proxy'));
      el.removeAttribute('data-srcset');
      el.removeAttribute('data-lazy-srcset');
    }else if(currentSet&&/https?:\/\/(?:www\.)?adselams\.com\//i.test(currentSet)&&el.dataset.nasharAllowDirect!=='1'){
      el.setAttribute('srcset',srcset(currentSet,'proxy'));
    }

    const sizes=el.getAttribute('data-sizes');
    if(sizes){el.setAttribute('sizes',sizes);el.removeAttribute('data-sizes')}

    const poster=el.getAttribute('data-poster');
    if(poster){el.setAttribute('poster',mediaProxy(poster));el.removeAttribute('data-poster')}
    else if(el.getAttribute('poster')&&originAbsolute(el.getAttribute('poster')))el.setAttribute('poster',mediaProxy(el.getAttribute('poster')));

    if(el.hasAttribute('data-lazyloaded'))el.removeAttribute('data-lazyloaded');
    if(tag==='IMG'){
      el.referrerPolicy='no-referrer';
      el.decoding='async';
      el.dataset.nasharMediaManaged='1';
      if(el.complete&&el.naturalWidth>0)markReady(el);
    }
  }

  function restoreMedia(root){
    const scope=root||document;
    if(scope.matches&&scope.matches('img,source,iframe,video,[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url],[style]'))restoreElement(scope);
    if(scope.querySelectorAll)scope.querySelectorAll('img,source,iframe,video,[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url],[style]').forEach(restoreElement);
  }

  function disableBrokenPictureSources(img){
    const picture=img&&img.closest?img.closest('picture'):null;
    if(!picture)return;
    picture.querySelectorAll('source').forEach(source=>{
      ['srcset','data-srcset','data-lazy-srcset','data-src','data-lazy-src'].forEach(attr=>{
        const value=source.getAttribute(attr);
        if(value&&!source.dataset['nasharSaved'+attr.replace(/[^a-z]/gi,'')])source.dataset['nasharSaved'+attr.replace(/[^a-z]/gi,'')]=value;
        source.removeAttribute(attr);
      });
    });
  }

  function candidateList(img){
    const list=[];
    const add=u=>{if(u&&!isPlaceholder(u)&&!list.includes(u))list.push(u)};
    const cur=img.currentSrc||img.getAttribute('src')||'';
    const original=img.dataset.nasharOriginalSrc||'';
    const primary=original||originAbsolute(cur)||cur;

    add(mediaProxy(primary));
    add(proxy(primary));
    add(direct(primary));
    add(mediaProxy(cur));
    add(proxy(cur));
    add(direct(cur));

    const set=img.getAttribute('srcset')||'';
    set.split(',').forEach(p=>{
      const u=p.trim().split(/\s+/)[0];
      add(mediaProxy(u));add(proxy(u));add(direct(u));
    });

    [...list].forEach(u=>{
      if(/\.webp(?:\?.*)?$/i.test(u)){
        const noWebp=u.replace(/\.webp(\?.*)?$/i,'$1');
        add(noWebp);add(mediaProxy(noWebp));
      }
      if(/\?.+/.test(u)){
        const noQuery=u.split('?')[0];
        add(noQuery);add(mediaProxy(noQuery));
      }
    });
    return list;
  }

  function recoverBrokenImage(img){
    if(!img||isBrandImage(img)||img.dataset.nasharRecoveryBusy==='1')return;
    img.dataset.nasharMediaError='1';
    img.dataset.nasharRecoveryBusy='1';
    disableBrokenPictureSources(img);

    const candidates=candidateList(img);
    let tried=[];
    try{tried=JSON.parse(img.dataset.nasharTried||'[]')}catch(e){}
    const current=img.getAttribute('src')||'';
    const next=candidates.find(u=>u&&u!==current&&!tried.includes(u));
    if(next){
      tried.push(next);
      img.dataset.nasharTried=JSON.stringify(tried.slice(-20));
      if(/^https?:\/\/(?:www\.)?adselams\.com\//i.test(next))img.dataset.nasharAllowDirect='1';else delete img.dataset.nasharAllowDirect;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.setAttribute('src',next);
      img.style.removeProperty('visibility');
      img.style.removeProperty('opacity');
      setTimeout(()=>{delete img.dataset.nasharRecoveryBusy},0);
      return;
    }

    delete img.dataset.nasharRecoveryBusy;
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');
  }

  function healthCheck(root){
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('img').forEach(img=>{
      if(isBrandImage(img))return;
      restoreElement(img);
      const src=img.getAttribute('src')||'';
      if(img.complete&&src&&!isPlaceholder(src)){
        if(img.naturalWidth>0)markReady(img);
        else recoverBrokenImage(img);
      }
    });
  }

  function stabilizeReferenceAreas(){
    const partner=document.getElementById('uc_logo_carousel_elementor_c98c777');
    if(!partner)return;
    partner.querySelectorAll('img').forEach(img=>{
      if(isBrandImage(img))return;
      restoreElement(img);
      if(img.complete&&img.naturalWidth>0)markReady(img);
    });
  }

  function rewriteDelayedScriptSources(){
    document.querySelectorAll('script[type="litespeed/javascript"][data-src]').forEach(s=>{
      const u=s.getAttribute('data-src');
      if(u)s.setAttribute('data-src',proxy(u));
    });
  }

  function refreshMotionGeometry(){
    requestAnimationFrame(()=>{
      try{window.dispatchEvent(new Event('resize'))}catch(e){}
      try{window.dispatchEvent(new Event('scroll'))}catch(e){}
    });
  }

  function emitLiteSpeedReady(){
    if(litespeedEventSent)return;
    litespeedEventSent=true;
    document.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
  }

  async function manualDelayedScripts(){
    const queue=[...document.querySelectorAll('script[type="litespeed/javascript"]')];
    for(const old of queue){
      await new Promise(resolve=>{
        const s=document.createElement('script');
        s.async=false;
        [...old.attributes].forEach(a=>{
          if(!['type','data-src'].includes(a.name))s.setAttribute(a.name,a.value);
        });
        const src=old.getAttribute('data-src');
        if(src){
          s.src=proxy(src);
          s.onload=s.onerror=resolve;
        }else{
          s.textContent=old.textContent;
        }
        old.replaceWith(s);
        if(!src)queueMicrotask(resolve);
      });
    }
    emitLiteSpeedReady();
    restoreMedia(document);
    healthCheck(document);
    stabilizeReferenceAreas();
    [100,450,1200].forEach(t=>setTimeout(refreshMotionGeometry,t));
  }

  function forceDelayedScripts(){
    if(delayedStarted)return;
    delayedStarted=true;
    rewriteDelayedScriptSources();

    if(typeof window.litespeed_load_delayed_js_force==='function'){
      try{
        window.litespeed_load_delayed_js_force();
        setTimeout(()=>{restoreMedia(document);healthCheck(document);stabilizeReferenceAreas();refreshMotionGeometry()},300);
        setTimeout(refreshMotionGeometry,1100);
        return;
      }catch(e){console.warn('LiteSpeed delayed JS restore:',e)}
    }

    manualDelayedScripts().catch(e=>console.warn('Manual delayed JS restore:',e));
  }

  function sweep(){restoreMedia(document);healthCheck(document);stabilizeReferenceAreas()}

  function start(){
    document.addEventListener('load',e=>{
      if(e.target&&e.target.tagName==='IMG')markReady(e.target);
    },true);
    document.addEventListener('error',e=>{
      if(e.target&&e.target.tagName==='IMG')recoverBrokenImage(e.target);
    },true);
    document.addEventListener('DOMContentLiteSpeedLoaded',()=>{
      [0,250,700,1500].forEach(t=>setTimeout(()=>{healthCheck(document);refreshMotionGeometry()},t));
    },{once:true});
    window.addEventListener('load',()=>setTimeout(()=>{healthCheck(document);refreshMotionGeometry()},100),{once:true});

    sweep();
    rewriteDelayedScriptSources();
    setTimeout(forceDelayedScripts,100);
    [250,700,1500,3000,6000,10000].forEach(t=>setTimeout(sweep,t));

    /* Never observe style: Elementor/GSAP/Waypoints mutate it every animation frame. */
    const mo=new MutationObserver(ms=>{
      if(mutationScheduled)return;
      mutationScheduled=true;
      requestAnimationFrame(()=>{
        mutationScheduled=false;
        for(const m of ms){
          if(m.type==='attributes')restoreElement(m.target);
          else m.addedNodes.forEach(n=>{if(n.nodeType===1){restoreMedia(n);healthCheck(n)}});
        }
        stabilizeReferenceAreas();
      });
    });
    mo.observe(document.documentElement,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['src','srcset','data-src','data-lazy-src','data-original','data-srcset','data-lazy-srcset','data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url','poster','data-poster']
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

/* Language switch hardening v1 — keep WPML visual markup, but own navigation locally. */
(function(){
  'use strict';
  if(window.__nasharLanguageSwitchHardeningV1)return;
  window.__nasharLanguageSwitchHardeningV1=true;

  const IS_EN=/^\/en(?:\/|$)/i.test(location.pathname||'/');
  const TARGET=IS_EN?'/':'/en/';
  const LABEL=IS_EN?'العربية':'English';
  const LANG=IS_EN?'ar':'en';

  function isLanguageLink(a){
    if(!a||a.tagName!=='A')return false;
    const li=a.closest('li');
    const cls=((a.className||'')+' '+(li?.className||'')).toLowerCase();
    const text=(a.textContent||'').trim().toLowerCase();
    const aria=(a.getAttribute('aria-label')||'').toLowerCase();
    const href=(a.getAttribute('href')||'').toLowerCase();
    return /wpml-ls|menu-item-wpml/.test(cls)||text==='english'||text==='العربية'||/switch.*english|switch.*arabic|التبديل إلى/.test(aria)||/adselams\.com\/en\/?$/.test(href);
  }

  function patch(a){
    if(!isLanguageLink(a))return false;
    if(a.getAttribute('href')!==TARGET)a.setAttribute('href',TARGET);
    a.removeAttribute('target');
    a.removeAttribute('data-scroll');
    a.removeAttribute('data-options');
    a.setAttribute('hreflang',LANG);
    a.setAttribute('lang',LANG);
    a.setAttribute('aria-label',IS_EN?'التبديل إلى العربية':'Switch to English');
    a.dataset.nasharLanguageSwitch='1';
    const native=a.querySelector('.wpml-ls-native');
    if(native){native.textContent=LABEL;native.setAttribute('lang',LANG)}
    else if(a.childElementCount===0)a.textContent=LABEL;
    return true;
  }

  function sweep(root){
    const scope=root&&root.querySelectorAll?root:document;
    if(root&&root.matches&&root.matches('a'))patch(root);
    scope.querySelectorAll('a[href],a.wpml-ls-link').forEach(patch);
  }

  document.addEventListener('click',function(e){
    const a=e.target&&e.target.closest?e.target.closest('a'):null;
    if(!patch(a))return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
    window.location.assign(TARGET);
  },true);

  const start=()=>{
    sweep(document);
    [50,250,700,1600].forEach(t=>setTimeout(()=>sweep(document),t));
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>sweep(document));
  window.addEventListener('load',()=>sweep(document),{once:true});
})();
