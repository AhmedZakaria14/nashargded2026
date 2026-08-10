/* النشار جروب partner strip v5 — one stable Owl instance; never rebuild on scroll. */
(function(){
  'use strict';
  if(window.__nasharPartnersV5)return;
  window.__nasharPartnersV5=true;

  const ID='uc_logo_carousel_elementor_c98c777';
  const SET_VERSION='nashar-partners-five-v5';
  const PARTNERS=[
    {key:'meta',name:'Meta',src:'/assets/partners/meta.svg'},
    {key:'snapchat',name:'Snapchat',src:'/assets/partners/snapchat.svg'},
    {key:'tiktok',name:'TikTok',src:'/assets/partners/tiktok.svg'},
    {key:'salla',name:'Salla',src:'/assets/partners/salla.svg'},
    {key:'google',name:'Google',src:'/assets/partners/google.svg'}
  ];
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

  let initialized=false;
  let initInProgress=false;
  let lastWidth=0;
  let resizeTimer=0;
  let resizeObserver=null;

  function el(){return document.getElementById(ID)}
  function jq(){return window.jQuery}

  function fallbackSvg(name){
    const safe=String(name).replace(/[&<>"']/g,'');
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 140"><text x="160" y="78" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="white">'+safe+'</text></svg>'
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
      const holder=img.closest('[data-nashar-partner]');
      const p=PARTNERS.find(x=>x.key===holder?.dataset.nasharPartner);
      if(!p)return;
      if(!img.dataset.partnerErrorBound){
        img.dataset.partnerErrorBound='1';
        img.addEventListener('error',()=>{
          if(img.dataset.partnerFallback==='1')return;
          img.dataset.partnerFallback='1';
          img.src=fallbackSvg(p.name);
        });
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
    });
  }

  function seedRaw(){
    const root=el();
    if(!root)return false;
    if(root.classList.contains('owl-loaded')){ensureImages(root);return true;}
    const keys=[...root.children]
      .filter(n=>n.nodeType===1&&n.classList.contains('uc_logo_carousel'))
      .map(n=>n.dataset.nasharPartner||'');
    const correct=keys.length===PARTNERS.length&&PARTNERS.every((p,i)=>keys[i]===p.key);
    if(!correct){
      root.innerHTML=markup();
      root.dataset.nasharPartnerSet=SET_VERSION;
    }
    root.classList.remove('owl-hidden','owl-loading');
    root.dataset.partnerCarousel='visible-preinit';
    ensureImages(root);
    return true;
  }

  function tune(instance){
    if(!instance)return;
    const req={autoplay:true,autoplayTimeout:3000,autoplayHoverPause:true,autoplaySpeed:1000,smartSpeed:1000,mouseDrag:true,touchDrag:true,pullDrag:true};
    if(instance.options)Object.assign(instance.options,req);
    if(instance.settings)Object.assign(instance.settings,req);
  }

  function play(root,$root,instance){
    root.classList.remove('owl-hidden','owl-loading');
    ensureImages(root);
    tune(instance);
    try{$root.trigger('play.owl.autoplay',[3000,1000])}catch(e){}
    root.dataset.partnerCarousel='owl-stable';
  }

  function refreshOnly(){
    if(!initialized)return;
    const root=el(),$=jq();
    if(!root||!$||!$.fn||typeof $.fn.owlCarousel!=='function')return;
    const $root=$(root),instance=$root.data('owl.carousel');
    if(!instance)return;
    const width=root.getBoundingClientRect().width;
    if(width<2)return;
    tune(instance);
    ensureImages(root);
    root.classList.remove('owl-hidden','owl-loading');
    try{
      if(typeof instance.invalidate==='function')instance.invalidate('width');
      $root.trigger('refresh.owl.carousel');
    }catch(e){}
    play(root,$root,instance);
    lastWidth=width;
  }

  function initializeOnce(){
    if(initInProgress)return false;
    const root=el();
    if(!root)return false;
    seedRaw();

    const $=jq();
    if(!$||!$.fn||typeof $.fn.owlCarousel!=='function')return false;
    const width=root.getBoundingClientRect().width;
    if(width<2)return false;

    const $root=$(root);
    let instance=$root.data('owl.carousel');

    /* If Unlimited Elements initialized first, keep that exact instance. Never destroy it. */
    if(instance&&root.classList.contains('owl-loaded')){
      initialized=true;
      lastWidth=width;
      play(root,$root,instance);
      return true;
    }

    if(initialized)return true;
    initInProgress=true;
    try{
      $root.off('.nasharPartnersV5');
      $root.on('initialized.owl.carousel.nasharPartnersV5 refreshed.owl.carousel.nasharPartnersV5 translated.owl.carousel.nasharPartnersV5',()=>{
        const current=$root.data('owl.carousel');
        if(current){
          initialized=true;
          lastWidth=root.getBoundingClientRect().width||lastWidth;
          play(root,$root,current);
        }
      });
      $root.on('uc_ajax_refreshed.nasharPartnersV5',()=>setTimeout(()=>{
        const current=$root.data('owl.carousel');
        if(current){initialized=true;play(root,$root,current);refreshOnly();}
      },100));
      $root.owlCarousel(CONFIG);
      instance=$root.data('owl.carousel');
      if(instance){
        initialized=true;
        lastWidth=width;
        play(root,$root,instance);
      }
    }catch(e){
      console.warn('Partner Owl stable init:',e);
      root.classList.remove('owl-hidden','owl-loading');
      root.dataset.partnerCarousel='visible-fallback';
      initialized=false;
    }finally{
      initInProgress=false;
    }
    return initialized;
  }

  function scheduleWidthRefresh(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      const root=el();
      if(!root)return;
      const width=root.getBoundingClientRect().width;
      if(width<2)return;
      if(!initialized){initializeOnce();return;}
      if(Math.abs(width-lastWidth)>1)refreshOnly();
    },120);
  }

  function boot(){
    if(!seedRaw()){setTimeout(boot,120);return;}
    let tries=0;
    const wait=setInterval(()=>{
      tries++;
      if(initializeOnce()||tries>=80)clearInterval(wait);
    },100);

    const root=el();
    if(root&&'ResizeObserver' in window){
      resizeObserver=new ResizeObserver(scheduleWidthRefresh);
      resizeObserver.observe(root);
    }
  }

  /* Deliberately no scroll, IntersectionObserver, MutationObserver or periodic rebuild health checks. */
  window.addEventListener('resize',scheduleWidthRefresh,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(refreshOnly,250),{passive:true});
  window.addEventListener('pageshow',()=>setTimeout(()=>{if(!initializeOnce())refreshOnly()},60));
  window.addEventListener('load',()=>setTimeout(()=>{initializeOnce();refreshOnly()},250),{once:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{initializeOnce();refreshOnly()},80)});
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>setTimeout(()=>{initializeOnce();refreshOnly()},160));

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
