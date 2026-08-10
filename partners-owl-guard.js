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
     Source: responsive:{0:{items:2},768:{items:2},980:{items:4}}.
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
          const re=/(responsive\s*:\s*\{\s*0\s*:\s*\{\s*items\s*:\s*)2(\s*\})/;
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
