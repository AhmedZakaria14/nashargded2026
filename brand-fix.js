/* ELNASHARGROUP identity replacement layer. Loaded last so the old Adsela marks cannot reappear after lazy-load/scripts. */
(function(){
  'use strict';
  const BRAND_LOGO='/assets/elnashargroup-logo.webp';
  const BRAND_ICON='/assets/elnashargroup-icon.webp';
  const OLD_LOGO_RE=/(adsela-new-logo2|adsela[-_ ]?logo|logo-adsela|adsela-icon-footer|cropped-fav-icon|logo-png-white-01)/i;

  function isOldBrandImage(img){
    if(!img||!img.getAttribute) return false;
    const hay=[img.getAttribute('src'),img.getAttribute('data-src'),img.getAttribute('srcset'),img.getAttribute('data-srcset'),img.getAttribute('alt')].filter(Boolean).join(' ');
    return OLD_LOGO_RE.test(hay) || /^logo$/i.test((img.getAttribute('alt')||'').trim());
  }

  function useIconFor(img){
    const hay=[img.getAttribute('src'),img.getAttribute('data-src'),img.getAttribute('alt')].filter(Boolean).join(' ');
    return /(icon-footer|cropped-fav|logo-adsela-half|logo-png-white-01)/i.test(hay);
  }

  function replaceBrandImage(img){
    if(!isOldBrandImage(img)) return;
    const isIcon=useIconFor(img);
    const target=isIcon?BRAND_ICON:BRAND_LOGO;
    img.setAttribute('src',target);
    img.removeAttribute('srcset');
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-sizes');
    img.removeAttribute('loading');
    img.setAttribute('alt','ELNASHARGROUP');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center','important');
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');

    if(img.closest('.header__logo-2,.header__area-2,header')){
      img.style.setProperty('height','55px','important');
      img.style.setProperty('width','auto','important');
      img.style.setProperty('max-width','240px','important');
    }
    if(img.closest('footer,.footer__area,.footer__area-2')){
      img.style.setProperty('max-height','72px','important');
      img.style.setProperty('width','auto','important');
      img.style.setProperty('max-width','260px','important');
    }
  }

  function replaceFavicons(){
    document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(l=>l.setAttribute('href',BRAND_ICON));
    if(!document.querySelector('link[data-elnashar-favicon]')){
      const l=document.createElement('link');
      l.rel='icon';l.type='image/webp';l.href=BRAND_ICON;l.dataset.elnasharFavicon='1';
      document.head.appendChild(l);
    }
  }

  function replaceInlineBackgrounds(root){
    (root||document).querySelectorAll('[style]').forEach(el=>{
      const s=el.getAttribute('style')||'';
      if(OLD_LOGO_RE.test(s)){
        el.style.setProperty('background-image','url("'+BRAND_ICON+'")','important');
        el.style.setProperty('background-size','contain','important');
        el.style.setProperty('background-repeat','no-repeat','important');
        el.style.setProperty('background-position','center','important');
      }
    });
  }

  function updateMetaBranding(){
    document.querySelectorAll('meta[property="og:image"],meta[name="twitter:image"]').forEach(m=>{
      if(OLD_LOGO_RE.test(m.content||'')) m.content=location.origin+BRAND_LOGO;
    });
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{
      if(OLD_LOGO_RE.test(s.textContent||'')){
        s.textContent=s.textContent.replace(/https?:\\/\\/adselams\\.com\\/[^\"']*(?:Adsela-Logo|adsela-new-logo|cropped-fav-icon)[^\"']*/gi,location.origin+BRAND_LOGO);
      }
    });
  }

  function applyBranding(root){
    (root||document).querySelectorAll('img').forEach(replaceBrandImage);
    replaceInlineBackgrounds(root||document);
    replaceFavicons();
    updateMetaBranding();
  }

  function start(){
    applyBranding(document);
    setTimeout(()=>applyBranding(document),250);
    setTimeout(()=>applyBranding(document),1200);
    setTimeout(()=>applyBranding(document),3000);
    const mo=new MutationObserver(ms=>{
      ms.forEach(m=>m.addedNodes.forEach(n=>{
        if(n.nodeType!==1) return;
        if(n.matches&&n.matches('img')) replaceBrandImage(n);
        if(n.querySelectorAll) applyBranding(n);
      }));
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
