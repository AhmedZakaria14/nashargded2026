/* ELNASHARGROUP identity controller: old Adsela marks can never win in visible brand slots. */
(function(){
  'use strict';
  const BRAND_LOGO='/assets/elnashargroup-logo.svg';
  const BRAND_ICON='/assets/elnashargroup-icon.svg';
  const OLD_LOGO_RE=/(adsela(?:[-_ ]?new)?[-_ ]?logo\d*|adsela[-_ ]?logo|logo[-_ ]?adsela|adsela-icon-footer|cropped-fav-icon|logo-png-white-01)/i;
  const FULL_SLOT='.header__logo-2,.offcanvas__logo,.footer__logo,.footer__logo-2,.elnashar-brand,header,.site-header';

  function text(img){return [img.getAttribute('src'),img.getAttribute('data-src'),img.getAttribute('srcset'),img.getAttribute('data-srcset'),img.getAttribute('alt')].filter(Boolean).join(' ')}
  function isBrand(img){
    if(!img||img.tagName!=='IMG') return false;
    const s=text(img),alt=(img.getAttribute('alt')||'').trim();
    return OLD_LOGO_RE.test(s)||/elnashargroup-(?:logo|icon)\.svg/i.test(s)||/^logo$/i.test(alt)||/^ELNASHARGROUP$/i.test(alt);
  }
  function fullSlot(img){return !!img.closest(FULL_SLOT)}
  function iconOnly(img){
    if(fullSlot(img)) return false;
    return /(icon-footer|cropped-fav|logo-adsela-half|elnashargroup-icon)/i.test(text(img));
  }

  function openContainers(img){
    [img.parentElement,img.closest('.header__logo-2'),img.closest('.offcanvas__logo'),img.closest('.footer__logo'),img.closest('.footer__logo-2'),img.closest('.elnashar-brand')].filter(Boolean).forEach(el=>{
      el.style.setProperty('overflow','visible','important');
      el.style.setProperty('min-width','0','important');
      el.style.setProperty('flex-shrink','0','important');
    });
    const a=img.closest('a');
    if(a){a.style.setProperty('display','flex','important');a.style.setProperty('align-items','center','important');a.style.setProperty('overflow','visible','important');a.style.setProperty('flex-shrink','0','important')}
  }

  function size(img,isIcon){
    img.classList.add('elnashar-brand-image');
    ['width','height'].forEach(a=>img.removeAttribute(a));
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
    const header=!!img.closest('.header__logo-2,.header__area-2,header,.site-header');
    const off=!!img.closest('.offcanvas__area,.offcanvas__menu,.offcanvas__logo');
    const foot=!!img.closest('footer,.footer__area,.footer__area-2,.footer__logo,.footer__logo-2');
    if(isIcon) img.style.setProperty('width',header?'48px':off?'56px':'64px','important');
    else if(header) img.style.setProperty('width','min(230px,52vw)','important');
    else if(off) img.style.setProperty('width','min(240px,72vw)','important');
    else if(foot) img.style.setProperty('width','min(285px,82vw)','important');
    else img.style.setProperty('width','min(245px,75vw)','important');
    openContainers(img);
  }

  function replace(img){
    if(!isBrand(img)) return;
    const icon=iconOnly(img),target=icon?BRAND_ICON:BRAND_LOGO;
    if(img.getAttribute('src')!==target) img.setAttribute('src',target);
    ['srcset','data-src','data-srcset','data-sizes','loading'].forEach(a=>img.removeAttribute(a));
    img.setAttribute('alt','ELNASHARGROUP');
    img.dataset.elnasharBrand=icon?'icon':'logo';
    size(img,icon);
  }

  function favicons(){
    document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(l=>{l.href=BRAND_ICON;l.type='image/svg+xml'});
    if(!document.querySelector('link[data-elnashar-favicon]')){const l=document.createElement('link');l.rel='icon';l.type='image/svg+xml';l.href=BRAND_ICON;l.dataset.elnasharFavicon='1';document.head.appendChild(l)}
  }

  function backgrounds(root){
    (root||document).querySelectorAll('[style]').forEach(el=>{if(OLD_LOGO_RE.test(el.getAttribute('style')||'')){el.style.setProperty('background-image','url("'+BRAND_ICON+'")','important');el.style.setProperty('background-size','contain','important');el.style.setProperty('background-repeat','no-repeat','important');el.style.setProperty('background-position','center','important')}})
  }

  function apply(root){
    const s=root||document;
    if(s.matches&&s.matches('img')) replace(s);
    if(s.querySelectorAll) s.querySelectorAll('img').forEach(replace);
    backgrounds(s);favicons();
  }

  function start(){
    apply(document);
    const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes'&&m.target.tagName==='IMG'){replace(m.target);continue}m.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)})}});
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-src','srcset','data-srcset','style']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
