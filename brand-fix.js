/* ELNASHARGROUP identity layer: one stable source and responsive, non-clipping sizing for every brand mark. */
(function(){
  'use strict';
  const BRAND_LOGO='/assets/elnashargroup-logo.svg';
  const BRAND_ICON='/assets/elnashargroup-icon.svg';
  const OLD_LOGO_RE=/(adsela-new-logo2|adsela[-_ ]?logo|logo-adsela|adsela-icon-footer|cropped-fav-icon|logo-png-white-01)/i;

  function sourceText(img){
    return [img.getAttribute('src'),img.getAttribute('data-src'),img.getAttribute('srcset'),img.getAttribute('data-srcset'),img.getAttribute('alt')].filter(Boolean).join(' ');
  }
  function isOldBrandImage(img){
    if(!img||img.tagName!=='IMG') return false;
    return OLD_LOGO_RE.test(sourceText(img)) || /^logo$/i.test((img.getAttribute('alt')||'').trim()) || /^ELNASHARGROUP$/i.test((img.getAttribute('alt')||'').trim());
  }
  function useIconFor(img){
    return /(icon-footer|cropped-fav|logo-adsela-half|logo-png-white-01)/i.test(sourceText(img));
  }

  function openBrandContainers(img){
    const containers=[
      img.parentElement,
      img.closest('.header__logo-2'),
      img.closest('.offcanvas__logo'),
      img.closest('.footer__logo'),
      img.closest('.footer__logo-2'),
      img.closest('.elnashar-brand')
    ].filter(Boolean);
    containers.forEach(el=>{
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('min-width','0','important');
      el.style.setProperty('flex-shrink','0','important');
    });
    const anchor=img.closest('a');
    if(anchor){
      anchor.style.setProperty('display','flex','important');
      anchor.style.setProperty('align-items','center','important');
      anchor.style.setProperty('overflow','visible','important');
      anchor.style.setProperty('flex-shrink','0','important');
    }
  }

  function sizeBrand(img,isIcon){
    img.classList.add('elnashar-brand-image');
    img.removeAttribute('width');
    img.removeAttribute('height');
    img.style.setProperty('display','block','important');
    img.style.setProperty('height','auto','important');
    img.style.setProperty('max-height','none','important');
    img.style.setProperty('max-width','none','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center','important');
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('clip-path','none','important');
    img.style.setProperty('transform','none','important');

    const inHeader=!!img.closest('.header__logo-2,.header__area-2,header');
    const inOffcanvas=!!img.closest('.offcanvas__area,.offcanvas__menu,.offcanvas__logo');
    const inFooter=!!img.closest('footer,.footer__area,.footer__area-2,.footer__logo,.footer__logo-2');

    if(isIcon){
      if(inHeader) img.style.setProperty('width','48px','important');
      else if(inOffcanvas) img.style.setProperty('width','56px','important');
      else img.style.setProperty('width','64px','important');
    }else if(inHeader){
      /* 230px desktop; automatically shrinks on narrow phones while preserving the full aspect ratio. */
      img.style.setProperty('width','min(230px,52vw)','important');
    }else if(inOffcanvas){
      img.style.setProperty('width','min(240px,72vw)','important');
    }else if(inFooter){
      img.style.setProperty('width','min(285px,82vw)','important');
    }else{
      img.style.setProperty('width','min(245px,75vw)','important');
    }
    openBrandContainers(img);
  }

  function replaceBrandImage(img){
    if(!isOldBrandImage(img)) return;
    const isIcon=useIconFor(img);
    const target=isIcon?BRAND_ICON:BRAND_LOGO;
    if(img.getAttribute('src')!==target) img.setAttribute('src',target);
    img.removeAttribute('srcset');
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-sizes');
    img.removeAttribute('loading');
    img.setAttribute('alt','ELNASHARGROUP');
    img.dataset.elnasharBrand=isIcon?'icon':'logo';
    sizeBrand(img,isIcon);
  }

  function replaceFavicons(){
    document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(l=>{
      l.setAttribute('href',BRAND_ICON);
      if(l.hasAttribute('type')) l.setAttribute('type','image/svg+xml');
    });
    if(!document.querySelector('link[data-elnashar-favicon]')){
      const l=document.createElement('link');
      l.rel='icon';l.type='image/svg+xml';l.href=BRAND_ICON;l.dataset.elnasharFavicon='1';
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
  }

  function applyBranding(root){
    const scope=root||document;
    if(scope.matches&&scope.matches('img')) replaceBrandImage(scope);
    if(scope.querySelectorAll) scope.querySelectorAll('img').forEach(replaceBrandImage);
    replaceInlineBackgrounds(scope);
    replaceFavicons();
    updateMetaBranding();
  }

  function start(){
    applyBranding(document);
    const mo=new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==='attributes' && m.target.tagName==='IMG'){
          replaceBrandImage(m.target);
          continue;
        }
        m.addedNodes.forEach(n=>{if(n.nodeType===1) applyBranding(n)});
      }
    });
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-src','srcset','data-srcset','style']});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
