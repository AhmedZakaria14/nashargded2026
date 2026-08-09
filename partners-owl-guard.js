/* ELNASHARGROUP partner logos — keep the original Owl Carousel as the single carousel engine. */
(function(){
  'use strict';
  const ID='uc_logo_carousel_elementor_c98c777';
  const CONFIG={
    loop:true,
    center:false,
    autoplay:true,
    autoplayTimeout:3000,
    autoplayHoverPause:true,
    autoplaySpeed:1000,
    smartSpeed:1000,
    nav:false,
    dots:false,
    navigation:true,
    margin:10,
    mouseDrag:true,
    touchDrag:true,
    pullDrag:true,
    freeDrag:false,
    responsive:{0:{items:2},768:{items:2},980:{items:4}}
  };
  let tries=0;
  let observer=null;
  let lastInstance=null;

  function getEl(){return document.getElementById(ID)}
  function jq(){return window.jQuery}

  function ensureImages(el){
    el.querySelectorAll('img').forEach(img=>{
      const src=img.getAttribute('data-src')||img.getAttribute('data-lazy-src')||img.getAttribute('data-original');
      if(src&&(!img.getAttribute('src')||/^data:image\//i.test(img.getAttribute('src')))) img.setAttribute('src',src);
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('display','block','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
    });
  }

  function hardenLoaded($el,el){
    const instance=$el.data('owl.carousel');
    const isNewInstance=!!instance&&instance!==lastInstance;
    if(instance){
      Object.assign(instance.options,CONFIG);
      Object.assign(instance.settings,CONFIG);
      if(isNewInstance){
        lastInstance=instance;
        try{instance.invalidate('settings')}catch(e){}
      }
    }
    ensureImages(el);
    el.dataset.partnerCarousel='owl-original';
    el.style.removeProperty('transform');
    el.style.removeProperty('overflow');
    if(isNewInstance){
      try{$el.trigger('refresh.owl.carousel')}catch(e){}
    }
    try{$el.trigger('play.owl.autoplay',[CONFIG.autoplayTimeout,CONFIG.autoplaySpeed])}catch(e){}
  }

  function ensureOwl(forceInit){
    const el=getEl(),$=jq();
    if(!el||!$||!$.fn||typeof $.fn.owlCarousel!=='function') return false;
    const $el=$(el);
    if(el.classList.contains('owl-loaded')&&$el.data('owl.carousel')){
      hardenLoaded($el,el);
      return true;
    }
    if(!forceInit) return false;
    try{
      $el.off('.elnasharPartners');
      $el.on('initialized.owl.carousel.elnasharPartners refreshed.owl.carousel.elnasharPartners',function(){
        ensureImages(el);
        try{$el.trigger('play.owl.autoplay',[CONFIG.autoplayTimeout,CONFIG.autoplaySpeed])}catch(e){}
      });
      $el.owlCarousel(CONFIG);
      hardenLoaded($el,el);
      return true;
    }catch(e){
      console.warn('Partner Owl guard:',e);
      return false;
    }
  }

  function watch(){
    const el=getEl();
    if(!el||observer) return;
    let scheduled=false;
    observer=new MutationObserver(()=>{
      if(scheduled) return;
      scheduled=true;
      requestAnimationFrame(()=>{
        scheduled=false;
        if(el.classList.contains('owl-loaded')) ensureOwl(false);
      });
    });
    observer.observe(el,{attributes:true,attributeFilter:['class']});
  }

  function boot(){
    const el=getEl();
    if(!el){
      if(++tries<50) setTimeout(boot,200);
      return;
    }
    watch();
    /* Give the original delayed Unlimited Elements script first chance to initialise Owl. */
    if(ensureOwl(false)) return;
    if(++tries<25){setTimeout(boot,200);return;}
    /* Fallback only if the original initialiser never ran. This still uses Owl, never another engine. */
    if(!ensureOwl(true)&&tries<50) setTimeout(boot,250);
  }

  document.addEventListener('DOMContentLiteSpeedLoaded',()=>{tries=0;setTimeout(boot,0)});
  window.addEventListener('load',()=>{tries=0;setTimeout(boot,50)},{once:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
