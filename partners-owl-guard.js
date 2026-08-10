/* النشار جروب partner strip v4 — resilient Owl Carousel with always-visible mobile fallback. */
(function(){
  'use strict';
  if(window.__nasharPartnersV4)return;
  window.__nasharPartnersV4=true;

  const ID='uc_logo_carousel_elementor_c98c777';
  const SET_VERSION='nashar-partners-five-v4';
  const PARTNERS=[
    {key:'meta',name:'Meta',src:'/assets/partners/meta.svg'},
    {key:'snapchat',name:'Snapchat',src:'/assets/partners/snapchat.svg'},
    {key:'tiktok',name:'TikTok',src:'/assets/partners/tiktok.svg'},
    {key:'salla',name:'Salla',src:'/assets/partners/salla.svg'},
    {key:'google',name:'Google',src:'/assets/partners/google.svg'}
  ];

  /* Same responsive geometry and timing feel as the original Unlimited Elements widget,
     while keeping the approved continuous motion requested for the current site. */
  const CONFIG={
    loop:true,
    center:false,
    autoplay:true,
    autoplayTimeout:3000,
    autoplayHoverPause:true,
    autoplaySpeed:1000,
    smartSpeed:1000,
    nav:false,
    navigation:true,
    dots:false,
    margin:10,
    mouseDrag:true,
    touchDrag:true,
    pullDrag:true,
    freeDrag:false,
    responsive:{0:{items:2},768:{items:2},980:{items:4}}
  };

  let rebuilding=false;
  let initializedByGuard=false;
  let repairTimer=0;
  let resizeObserver=null;
  let intersectionObserver=null;
  let mutationObserver=null;
  let healthInterval=0;
  let lastHealthyWidth=0;

  function getEl(){return document.getElementById(ID)}
  function jq(){return window.jQuery}

  function fallbackSvg(name){
    const safe=String(name).replace(/[&<>"']/g,'');
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140"><rect width="320" height="140" fill="none"/><text x="160" y="78" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="white">'+safe+'</text></svg>'
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

  function ensureImages(root){
    if(!root)return;
    root.querySelectorAll('[data-nashar-partner] img').forEach(img=>{
      const item=img.closest('[data-nashar-partner]');
      const p=PARTNERS.find(x=>x.key===item?.getAttribute('data-nashar-partner'));
      if(!p)return;
      if(!img.dataset.partnerBound){
        img.dataset.partnerBound='1';
        img.addEventListener('error',()=>{
          if(img.dataset.partnerFallback==='1')return;
          img.dataset.partnerFallback='1';
          img.src=fallbackSvg(p.name);
        });
        img.addEventListener('load',()=>scheduleRepair(40));
      }
      if(img.dataset.partnerFallback!=='1'&&img.getAttribute('src')!==p.src)img.setAttribute('src',p.src);
      img.alt=p.name;
      img.title=p.name;
      img.loading='eager';
      img.decoding='async';
      img.draggable=false;
      ['srcset','data-src','data-lazy-src','data-original','data-srcset','data-lazy-srcset','data-sizes'].forEach(a=>img.removeAttribute(a));
      img.style.removeProperty('display');
      img.style.removeProperty('visibility');
      img.style.removeProperty('opacity');
      img.style.removeProperty('width');
      img.style.removeProperty('height');
    });
  }

  function directKeys(el){
    return [...el.children]
      .filter(n=>n.nodeType===1&&n.classList.contains('uc_logo_carousel'))
      .map(n=>n.getAttribute('data-nashar-partner'));
  }

  function hasCorrectRawContent(el){
    const keys=directKeys(el);
    return keys.length===PARTNERS.length&&PARTNERS.every((p,i)=>keys[i]===p.key);
  }

  function hasCorrectOwlContent(el){
    const originals=[...el.querySelectorAll('.owl-stage>.owl-item:not(.cloned) [data-nashar-partner]')];
    if(!originals.length)return false;
    const keys=originals.map(n=>n.getAttribute('data-nashar-partner'));
    return PARTNERS.every(p=>keys.includes(p.key));
  }

  function resetToRaw(el,$){
    if(!el)return;
    if($&&$.fn&&typeof $.fn.owlCarousel==='function'){
      try{
        const $el=$(el);
        if($el.data('owl.carousel'))$el.trigger('destroy.owl.carousel');
      }catch(e){}
    }
    el.classList.remove('owl-loaded','owl-loading','owl-hidden','owl-refresh','owl-drag');
    el.removeAttribute('style');
    el.innerHTML=markup();
    el.dataset.nasharPartnerSet=SET_VERSION;
    el.dataset.partnerCarousel='fallback-visible';
    ensureImages(el);
  }

  function seedVisible(){
    const el=getEl();
    if(!el)return false;
    const $=jq();
    const loaded=el.classList.contains('owl-loaded');
    if(!loaded&&!hasCorrectRawContent(el))resetToRaw(el,$);
    else if(loaded&&!hasCorrectOwlContent(el))resetToRaw(el,$);
    ensureImages(el);
    el.classList.remove('owl-hidden','owl-loading');
    return true;
  }

  function applyRequiredOptions(instance){
    if(!instance)return;
    const required={autoplay:true,autoplayTimeout:3000,autoplayHoverPause:true,autoplaySpeed:1000,smartSpeed:1000,mouseDrag:true,touchDrag:true,pullDrag:true};
    if(instance.options)Object.assign(instance.options,required);
    if(instance.settings)Object.assign(instance.settings,required);
  }

  function play($el,instance){
    try{$el.trigger('play.owl.autoplay',[instance?.settings?.autoplayTimeout||3000,instance?.settings?.autoplaySpeed||instance?.settings?.smartSpeed||1000])}catch(e){}
  }

  function refresh($el,instance){
    try{
      if(instance&&typeof instance.invalidate==='function')instance.invalidate('width');
      $el.trigger('refresh.owl.carousel');
    }catch(e){}
    play($el,instance);
  }

  function isHealthy(el,instance){
    if(!el||!instance||!el.classList.contains('owl-loaded'))return false;
    const width=el.getBoundingClientRect().width;
    if(width<2)return false;
    const outer=el.querySelector('.owl-stage-outer');
    const stage=el.querySelector('.owl-stage');
    if(!outer||!stage||outer.getBoundingClientRect().width<2||stage.getBoundingClientRect().width<2)return false;
    const visible=[...el.querySelectorAll('.owl-item:not(.cloned) img')].some(img=>{
      const r=img.getBoundingClientRect();
      return r.width>2&&r.height>2&&getComputedStyle(img).display!=='none'&&getComputedStyle(img).visibility!=='hidden';
    });
    return visible;
  }

  function initOrRepair(forceRebuild){
    const el=getEl();
    if(!el||rebuilding)return false;
    seedVisible();

    const $=jq();
    if(!$||!$.fn||typeof $.fn.owlCarousel!=='function')return false;
    const $el=$(el);
    let instance=$el.data('owl.carousel');

    if(forceRebuild||(!instance&&el.classList.contains('owl-loaded'))||(instance&&!hasCorrectOwlContent(el))){
      rebuilding=true;
      try{
        resetToRaw(el,$);
        instance=null;
      }finally{
        rebuilding=false;
      }
    }

    const width=el.getBoundingClientRect().width;
    if(width<2){
      el.dataset.partnerCarousel='fallback-waiting-width';
      return false;
    }

    if(!instance){
      rebuilding=true;
      try{
        $el.off('.nasharPartnersV4');
        $el.on('initialized.owl.carousel.nasharPartnersV4 refreshed.owl.carousel.nasharPartnersV4 translated.owl.carousel.nasharPartnersV4',function(){
          ensureImages(el);
          el.classList.remove('owl-hidden','owl-loading');
          const i=$el.data('owl.carousel');
          applyRequiredOptions(i);
          play($el,i);
          el.dataset.partnerCarousel='owl-ready';
        });
        $el.on('uc_ajax_refreshed.nasharPartnersV4',()=>setTimeout(()=>initOrRepair(false),120));
        $el.owlCarousel(CONFIG);
        initializedByGuard=true;
        instance=$el.data('owl.carousel');
      }catch(e){
        console.warn('Partner Owl init:',e);
        resetToRaw(el,$);
        return false;
      }finally{
        rebuilding=false;
      }
    }

    applyRequiredOptions(instance);
    el.classList.remove('owl-hidden','owl-loading');
    ensureImages(el);
    refresh($el,instance);
    if(isHealthy(el,instance)){
      lastHealthyWidth=width;
      el.dataset.partnerCarousel='owl-healthy';
      return true;
    }
    el.dataset.partnerCarousel='owl-needs-refresh';
    return false;
  }

  function healthCheck(){
    const el=getEl();
    if(!el)return;
    seedVisible();
    const $=jq();
    if(!$||!$.fn||typeof $.fn.owlCarousel!=='function')return;
    const $el=$(el),instance=$el.data('owl.carousel');
    const width=el.getBoundingClientRect().width;
    if(width<2)return;

    if(!instance){initOrRepair(false);return;}
    applyRequiredOptions(instance);
    el.classList.remove('owl-hidden','owl-loading');
    ensureImages(el);

    if(!isHealthy(el,instance)){
      refresh($el,instance);
      setTimeout(()=>{
        const current=$el.data('owl.carousel');
        if(current&&!isHealthy(el,current))initOrRepair(true);
      },180);
      return;
    }

    if(Math.abs(width-lastHealthyWidth)>1){
      lastHealthyWidth=width;
      refresh($el,instance);
    }else{
      play($el,instance);
    }
    el.dataset.partnerCarousel='owl-healthy';
  }

  function scheduleRepair(delay){
    clearTimeout(repairTimer);
    repairTimer=setTimeout(healthCheck,delay==null?80:delay);
  }

  function observe(){
    const el=getEl();
    if(!el)return;

    if('ResizeObserver' in window&&!resizeObserver){
      resizeObserver=new ResizeObserver(()=>scheduleRepair(90));
      resizeObserver.observe(el);
      if(el.parentElement)resizeObserver.observe(el.parentElement);
    }

    if('IntersectionObserver' in window&&!intersectionObserver){
      intersectionObserver=new IntersectionObserver(entries=>{
        if(entries.some(x=>x.isIntersecting&&x.intersectionRatio>0))scheduleRepair(30);
      },{root:null,rootMargin:'150px 0px',threshold:[0,.01,.25]});
      intersectionObserver.observe(el);
    }

    if(!mutationObserver){
      mutationObserver=new MutationObserver(()=>scheduleRepair(70));
      mutationObserver.observe(el,{childList:true,attributes:true,attributeFilter:['class']});
    }
  }

  function boot(){
    if(!seedVisible()){
      setTimeout(boot,150);
      return;
    }
    observe();
    initOrRepair(false);

    let tries=0;
    const poll=setInterval(()=>{
      tries++;
      healthCheck();
      if((jq()?.fn&&typeof jq().fn.owlCarousel==='function'&&getEl()?.dataset.partnerCarousel==='owl-healthy')||tries>=100)clearInterval(poll);
    },150);

    if(!healthInterval)healthInterval=setInterval(healthCheck,8000);
  }

  window.addEventListener('resize',()=>scheduleRepair(100),{passive:true});
  window.addEventListener('orientationchange',()=>{scheduleRepair(150);setTimeout(healthCheck,500)},{passive:true});
  window.addEventListener('pageshow',()=>scheduleRepair(30));
  window.addEventListener('load',()=>{scheduleRepair(30);setTimeout(healthCheck,350)},{once:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRepair(30)});
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>{scheduleRepair(20);setTimeout(healthCheck,250)});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
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
