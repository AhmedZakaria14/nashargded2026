/* asset recovery v4: force original media and delayed JS to load on clone */
(function(){
  'use strict';
  const ORIGIN='https://adselams.com/';
  const proxy=(url)=>{
    if(!url||typeof url!=='string') return url;
    if(url.startsWith(ORIGIN)) return '/origin/'+url.slice(ORIGIN.length);
    return url;
  };

  function restoreElement(el){
    if(!el||!el.getAttribute) return;
    const ds=el.getAttribute('data-src');
    const dss=el.getAttribute('data-srcset');
    const dsz=el.getAttribute('data-sizes');
    const dbg=el.getAttribute('data-bg');
    const dbgh=el.getAttribute('data-bg-hidpi');
    const poster=el.getAttribute('data-poster');
    if(ds){
      const value=proxy(ds);
      if(el.tagName==='IMG') el.referrerPolicy='no-referrer';
      el.setAttribute('src',value);
      el.removeAttribute('data-src');
    }
    if(dss){
      el.setAttribute('srcset',dss.split(',').map(x=>{const p=x.trim().split(/\s+/);p[0]=proxy(p[0]);return p.join(' ')}).join(', '));
      el.removeAttribute('data-srcset');
    }
    if(dsz){el.setAttribute('sizes',dsz);el.removeAttribute('data-sizes')}
    if(poster){el.setAttribute('poster',proxy(poster));el.removeAttribute('data-poster')}
    if(dbg){el.style.backgroundImage='url("'+proxy(dbg)+'")';el.removeAttribute('data-bg')}
    if(dbgh && window.devicePixelRatio>1){el.style.backgroundImage='url("'+proxy(dbgh)+'")';el.removeAttribute('data-bg-hidpi')}
    if(el.hasAttribute('data-lazyloaded')) el.removeAttribute('data-lazyloaded');
  }

  function restoreMedia(root){
    (root||document).querySelectorAll('img[data-src],img[data-srcset],source[data-src],source[data-srcset],iframe[data-src],video[data-src],video[data-poster],[data-bg],[data-bg-hidpi]').forEach(restoreElement);
  }

  function rewriteDelayedScriptSources(){
    document.querySelectorAll('script[type="litespeed/javascript"][data-src]').forEach(s=>{
      const u=s.getAttribute('data-src');
      if(u&&u.startsWith(ORIGIN)) s.setAttribute('data-src',proxy(u));
    });
  }

  function forceDelayedScripts(){
    rewriteDelayedScriptSources();
    if(typeof window.litespeed_load_delayed_js_force==='function'){
      try{window.litespeed_load_delayed_js_force()}catch(e){console.warn('LiteSpeed delayed JS restore:',e)}
      return;
    }
    const queue=[...document.querySelectorAll('script[type="litespeed/javascript"]')];
    const run=async()=>{
      for(const old of queue){
        await new Promise(resolve=>{
          const s=document.createElement('script');
          [...old.attributes].forEach(a=>{if(a.name!=='type'&&a.name!=='data-src')s.setAttribute(a.name,a.value)});
          const src=old.getAttribute('data-src');
          if(src){s.src=proxy(src);s.onload=s.onerror=resolve}else{s.textContent=old.textContent;setTimeout(resolve,0)}
          old.after(s);old.remove();
        });
      }
      document.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
      window.dispatchEvent(new Event('DOMContentLiteSpeedLoaded'));
    };
    run();
  }

  function fixBrokenImages(){
    document.querySelectorAll('img').forEach(img=>{
      img.addEventListener('error',function(){
        const original=this.getAttribute('data-original-src')||this.currentSrc||this.src;
        if(original&&original.includes('/origin/')){
          const direct=ORIGIN+original.split('/origin/')[1];
          if(this.src!==direct){this.src=direct;return;}
        }
        this.style.visibility='hidden';
      },{once:false});
    });
  }

  const start=()=>{
    restoreMedia(document);
    rewriteDelayedScriptSources();
    fixBrokenImages();
    setTimeout(forceDelayedScripts,30);
    const mo=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){restoreElement(n);restoreMedia(n)}})));
    mo.observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();