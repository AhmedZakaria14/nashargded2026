/* النشار جروب partner strip v8 — seed content only; original Unlimited Elements/Owl owns all motion. */
(function(){
  'use strict';
  if(window.__nasharPartnersV8)return;
  window.__nasharPartnersV8=true;

  const ID='uc_logo_carousel_elementor_c98c777';
  const PARTNERS=[
    {key:'meta',name:'Meta',src:'/assets/partners/meta.svg'},
    {key:'snapchat',name:'Snapchat',src:'/assets/partners/snapchat.svg'},
    {key:'google',name:'Google',src:'/assets/partners/google.svg'},
    {key:'tiktok',name:'TikTok',src:'/assets/partners/tiktok.svg'},
    {key:'salla',name:'Salla',src:'/assets/partners/salla.svg'}
  ];

  function fallbackSvg(name){
    const safe=String(name).replace(/[&<>"']/g,'');
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140"><text x="160" y="80" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="white">'+safe+'</text></svg>'
    );
  }

  function markup(){
    return PARTNERS.map(p=>
      '<div class="uc_logo_carousel" data-nashar-partner="'+p.key+'">'+
        '<div class="uc_logo_carousel_holder ue-item">'+
          '<img src="'+p.src+'" alt="'+p.name+'" title="'+p.name+'" loading="eager" decoding="async" draggable="false">'+
        '</div>'+
      '</div>'
    ).join('');
  }

  /* Patch ONLY the source carousel initializer before LiteSpeed executes it.
     Source: responsive:{0:{items:2,},768:{items:2,},980:{items:4,}}.
     Phone breakpoint alone becomes items:5 so all approved logos fit in one mobile viewport.
     Owl still owns widths, transforms, autoplay and lifecycle; desktop/tablet are untouched. */
  function patchLiteSpeedCarouselInitializer(){
    if(window.__nasharPartnersLiteSpeedPatched)return;
    const original=window.litespeed_load_one;
    if(typeof original!=='function')return;
    window.__nasharPartnersLiteSpeedPatched=true;
    window.litespeed_load_one=function(node,done){
      try{
        if(node && node.textContent && node.textContent.indexOf(ID)!==-1 && node.textContent.indexOf('owlCarousel')!==-1){
          const re=/(responsive\s*:\s*\{\s*0\s*:\s*\{\s*items\s*:\s*)2(\s*,?\s*\})/;
          node.textContent=node.textContent.replace(re,function(match,before,after){
            return before+'5'+after;
          });
        }
      }catch(e){
        console.warn('Partner mobile responsive patch skipped:',e);
      }
      return original.call(this,node,done);
    };
  }

  function addStaticOverrides(){
    if(document.getElementById('nashar-partners-static-v8'))return;
    const style=document.createElement('style');
    style.id='nashar-partners-static-v8';
    style.textContent=`
      html #${ID},html #${ID} .owl-stage-outer,html #${ID} .owl-stage,html #${ID} .owl-item{visibility:visible!important;opacity:1!important}
      html #${ID} [data-nashar-partner] img{filter:none!important;visibility:visible!important;opacity:1!important}
    `;
    (document.head||document.documentElement).appendChild(style);
  }

  function bindFallbacks(root){
    root.querySelectorAll('[data-nashar-partner] img').forEach(img=>{
      if(img.dataset.partnerFallbackBound==='1')return;
      img.dataset.partnerFallbackBound='1';
      const item=img.closest('[data-nashar-partner]');
      const p=PARTNERS.find(x=>x.key===item?.dataset.nasharPartner);
      if(!p)return;
      img.addEventListener('error',()=>{
        if(img.dataset.partnerFallback==='1')return;
        img.dataset.partnerFallback='1';
        img.src=fallbackSvg(p.name);
      },{once:false});
    });
  }

  function seed(){
    patchLiteSpeedCarouselInitializer();
    addStaticOverrides();
    const root=document.getElementById(ID);
    if(!root)return false;

    /* Once Owl has initialized, never touch its DOM, classes, widths, transforms or events. */
    if(root.classList.contains('owl-loaded') || (window.jQuery && window.jQuery(root).data('owl.carousel'))){
      bindFallbacks(root);
      root.dataset.partnerCarousel='original-owl-owner';
      return true;
    }

    root.innerHTML=markup();
    root.dataset.nasharPartnerSet='nashar-partners-five-v8';
    root.dataset.partnerCarousel='seeded-for-original-owl';
    root.classList.remove('owl-hidden','owl-loading');
    bindFallbacks(root);
    return true;
  }

  patchLiteSpeedCarouselInitializer();

  /* Must finish before LiteSpeed executes the source Unlimited Elements initializer. */
  if(!seed()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',seed,{once:true});
    else setTimeout(seed,0);
  }
})();

/* Keep the approved replacement hero video isolated from the carousel runtime. */
(function(){
  if(window.__elnasharHeroVideoLoader)return;
  window.__elnasharHeroVideoLoader=true;
  const s=document.createElement('script');
  s.src='/hero-video-fix.js?v=1';
  s.async=false;
  (document.head||document.documentElement).appendChild(s);
})();

/* Recover source images and permanently purge legacy brand marks embedded in CSS. */
(function(){
  if(window.__nasharMediaCssHardeningLoader)return;
  window.__nasharMediaCssHardeningLoader=true;
  const s=document.createElement('script');
  s.src='/media-css-hardening.js?v=3';
  s.async=false;
  (document.head||document.documentElement).appendChild(s);
})();

/* The source off-canvas menu also contains a legacy brand emblem at
   wp-content/themes/axtra/assets/images/shape/111222.png. It is not a generic decoration:
   purge it anywhere it is injected and use the approved Nashar icon instead. */
(function(){
  'use strict';
  if(window.__nasharLegacyMenuEmblemV1)return;
  window.__nasharLegacyMenuEmblemV1=true;

  const ICON='/assets/elnashargroup-icon-v3.svg';
  const LEGACY=/\/(?:origin\/)?wp-content\/themes\/[^/]+\/assets\/images\/shape\/111222\.png(?:\.webp)?(?:[?#]|$)|(?:^|\/)111222\.png(?:\.webp)?(?:[?#]|$)/i;

  function isLegacy(img){
    if(!img||img.tagName!=='IMG')return false;
    return ['src','data-src','data-lazy-src','data-original','srcset','data-srcset','data-lazy-srcset']
      .some(attr=>LEGACY.test(img.getAttribute(attr)||''));
  }

  function replace(img){
    if(!isLegacy(img)&&!img.matches?.('.offcanvas__right .shape-1[data-nashar-legacy-emblem]'))return;
    img.setAttribute('src',ICON);
    img.setAttribute('alt','النشار جروب');
    ['srcset','data-src','data-lazy-src','data-original','data-lazyload','data-srcset','data-lazy-srcset','data-sizes'].forEach(attr=>img.removeAttribute(attr));
    img.dataset.elnasharBrand='icon';
    img.dataset.nasharLegacyEmblem='replaced';
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center','important');
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');
  }

  function sweep(root){
    const scope=root&&root.querySelectorAll?root:document;
    if(root&&root.tagName==='IMG'&&(isLegacy(root)||root.matches?.('.offcanvas__right .shape-1')))replace(root);
    scope.querySelectorAll&&scope.querySelectorAll('.offcanvas__right img.shape-1,img[src*="111222.png"],img[data-src*="111222.png"],img[data-lazy-src*="111222.png"],img[data-original*="111222.png"]').forEach(img=>{
      if(img.matches('.offcanvas__right .shape-1'))img.dataset.nasharLegacyEmblem='1';
      replace(img);
    });
  }

  function start(){
    sweep(document);
    [0,120,450,1200,3000].forEach(ms=>setTimeout(()=>sweep(document),ms));
    const mo=new MutationObserver(records=>{
      records.forEach(record=>{
        if(record.type==='attributes')replace(record.target);
        else record.addedNodes.forEach(node=>{if(node.nodeType===1)sweep(node)});
      });
    });
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-src','data-lazy-src','data-original','srcset','data-srcset','data-lazy-srcset']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>sweep(document));
  window.addEventListener('load',()=>sweep(document),{once:true});
})();
