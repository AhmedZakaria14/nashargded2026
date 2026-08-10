/* النشار جروب partner strip v6 — seed content only; original Unlimited Elements/Owl owns all motion. */
(function(){
  'use strict';
  if(window.__nasharPartnersV6)return;
  window.__nasharPartnersV6=true;

  const ID='uc_logo_carousel_elementor_c98c777';
  const PARTNERS=[
    {key:'meta',name:'Meta',src:'/assets/partners/meta.svg'},
    {key:'snapchat',name:'Snapchat',src:'/assets/partners/snapchat.svg'},
    {key:'tiktok',name:'TikTok',src:'/assets/partners/tiktok.svg'},
    {key:'salla',name:'Salla',src:'/assets/partners/salla.svg'},
    {key:'google',name:'Google',src:'/assets/partners/google.svg'}
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

  function addStaticOverrides(){
    if(document.getElementById('nashar-partners-static-v6'))return;
    const style=document.createElement('style');
    style.id='nashar-partners-static-v6';
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
    addStaticOverrides();
    const root=document.getElementById(ID);
    if(!root)return false;

    /* Critical rule: once Owl has initialized, never touch its DOM, classes, widths, transforms or events. */
    if(root.classList.contains('owl-loaded') || (window.jQuery && window.jQuery(root).data('owl.carousel'))){
      bindFallbacks(root);
      root.dataset.partnerCarousel='original-owl-owner';
      return true;
    }

    root.innerHTML=markup();
    root.dataset.nasharPartnerSet='nashar-partners-five-v6';
    root.dataset.partnerCarousel='seeded-for-original-owl';
    root.classList.remove('owl-hidden','owl-loading');
    bindFallbacks(root);
    return true;
  }

  /* This file must finish before LiteSpeed executes the source site's delayed Unlimited Elements initializer. */
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
