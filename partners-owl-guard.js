/* النشار جروب partner strip v3 — seed the new five-logo content, then let the original Owl Carousel own motion/drag exactly once. */
(function(){
  'use strict';
  if(window.__nasharPartnersV3)return;
  window.__nasharPartnersV3=true;

  const ID='uc_logo_carousel_elementor_c98c777';
  const SET_VERSION='nashar-partners-five-v3';
  const PARTNERS=[
    {key:'meta',name:'Meta',src:'/assets/partners/meta.svg'},
    {key:'snapchat',name:'Snapchat',src:'/assets/partners/snapchat.svg'},
    {key:'tiktok',name:'TikTok',src:'/assets/partners/tiktok.svg'},
    {key:'salla',name:'Salla',src:'/assets/partners/salla.svg'},
    {key:'google',name:'Google',src:'/assets/partners/google.svg'}
  ];
  const FALLBACK={
    loop:true,
    center:false,
    autoplay:true,
    autoplayTimeout:3000,
    autoplayHoverPause:false,
    autoplaySpeed:1000,
    smartSpeed:1000,
    nav:false,
    dots:false,
    margin:10,
    mouseDrag:true,
    touchDrag:true,
    pullDrag:true,
    freeDrag:false,
    responsive:{0:{items:2},768:{items:2},980:{items:4}}
  };

  let seeded=false;
  let fallbackStarted=false;
  let pollCount=0;

  function getEl(){return document.getElementById(ID)}
  function jq(){return window.jQuery}

  function markup(){
    return PARTNERS.map(p=>
      '<div class="uc_logo_carousel" data-nashar-partner="'+p.key+'">'+
        '<div class="uc_logo_carousel_holder">'+
          '<img src="'+p.src+'" alt="'+p.name+'" title="'+p.name+'" loading="eager" decoding="async" draggable="false">'+
        '</div>'+
      '</div>'
    ).join('');
  }

  function ensureImages(root){
    if(!root)return;
    root.querySelectorAll('[data-nashar-partner] img').forEach(img=>{
      const item=img.closest('[data-nashar-partner]');
      const p=PARTNERS.find(x=>x.key===item?.getAttribute('data-nashar-partner'));
      if(!p)return;
      if(img.getAttribute('src')!==p.src)img.setAttribute('src',p.src);
      img.setAttribute('alt',p.name);
      img.setAttribute('title',p.name);
      img.setAttribute('draggable','false');
      ['srcset','data-src','data-lazy-src','data-original','data-srcset','data-lazy-srcset','data-sizes'].forEach(a=>img.removeAttribute(a));
      img.style.removeProperty('visibility');
      img.style.removeProperty('opacity');
      img.style.removeProperty('width');
      img.style.removeProperty('height');
    });
  }

  function seed(){
    const el=getEl();
    if(!el)return false;

    /* The guard normally runs before LiteSpeed executes the original Owl initializer.
       Replace content only in that raw state; never fight Owl while it is building clones/stage. */
    if(!el.classList.contains('owl-loaded')){
      const direct=[...el.children].filter(n=>n.nodeType===1&&n.classList.contains('uc_logo_carousel'));
      const keys=direct.map(n=>n.getAttribute('data-nashar-partner'));
      const correct=el.dataset.nasharPartnerSet===SET_VERSION&&keys.length===PARTNERS.length&&PARTNERS.every((p,i)=>keys[i]===p.key);
      if(!correct){
        el.innerHTML=markup();
        el.dataset.nasharPartnerSet=SET_VERSION;
      }
      el.dataset.partnerCarousel='owl-original';
      ensureImages(el);
      seeded=true;
      return true;
    }

    /* If Owl somehow initialized first, do not destroy it. Only preserve any already-seeded local images. */
    ensureImages(el);
    return false;
  }

  function wakeExisting(){
    const el=getEl(),$=jq();
    if(!el||!$||!$.fn||typeof $.fn.owlCarousel!=='function')return false;
    const $el=$(el);
    const instance=$el.data('owl.carousel');
    if(!instance||!el.classList.contains('owl-loaded'))return false;

    /* Keep the original instance/settings. Only guarantee the capabilities that are visibly required. */
    if(instance.options){instance.options.autoplay=true;instance.options.mouseDrag=true;instance.options.touchDrag=true;instance.options.pullDrag=true}
    if(instance.settings){instance.settings.autoplay=true;instance.settings.mouseDrag=true;instance.settings.touchDrag=true;instance.settings.pullDrag=true}
    el.classList.add('owl-drag');
    el.dataset.partnerCarousel='owl-original-ready';
    ensureImages(el);
    try{$el.trigger('play.owl.autoplay',[instance.settings?.autoplayTimeout||3000,instance.settings?.autoplaySpeed||instance.settings?.smartSpeed||1000])}catch(e){}
    return true;
  }

  function fallbackInit(){
    if(fallbackStarted||wakeExisting())return;
    const el=getEl(),$=jq();
    if(!el||!$||!$.fn||typeof $.fn.owlCarousel!=='function')return;
    fallbackStarted=true;
    seed();
    try{
      const $el=$(el);
      $el.owlCarousel(FALLBACK);
      el.dataset.partnerCarousel='owl-fallback-ready';
      ensureImages(el);
      try{$el.trigger('play.owl.autoplay',[FALLBACK.autoplayTimeout,FALLBACK.autoplaySpeed])}catch(e){}
    }catch(e){
      fallbackStarted=false;
      console.warn('Partner Owl fallback:',e);
    }
  }

  function poll(){
    seed();
    if(wakeExisting())return;
    pollCount++;
    if(pollCount<30)setTimeout(poll,150);
  }

  function start(){
    seed();
    poll();
  }

  /* Wait until all original LiteSpeed listeners for this event have run before using the fallback. */
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>{
    setTimeout(()=>{
      seed();
      if(!wakeExisting())fallbackInit();
    },300);
  },{once:true});

  window.addEventListener('load',()=>{
    setTimeout(()=>{
      seed();
      if(!wakeExisting())fallbackInit();
    },900);
  },{once:true});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
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
