/* النشار جروب partner strip — keep the existing Owl Carousel movement, but use only five stable local logos. */
(function(){
  'use strict';
  const ID='uc_logo_carousel_elementor_c98c777';
  const SET_VERSION='nashar-partners-five-v1';
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
  let syncing=false;

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

  function currentKeys(el){
    let nodes=[];
    if(el.classList.contains('owl-loaded')){
      nodes=[...el.querySelectorAll('.owl-item:not(.cloned) > .uc_logo_carousel[data-nashar-partner]')];
    }else{
      nodes=[...el.children].filter(n=>n.nodeType===1&&n.matches('.uc_logo_carousel[data-nashar-partner]'));
    }
    return nodes.map(n=>n.getAttribute('data-nashar-partner'));
  }

  function partnerSetIsCorrect(el){
    const keys=currentKeys(el);
    return el.dataset.nasharPartnerSet===SET_VERSION &&
      keys.length===PARTNERS.length &&
      PARTNERS.every((p,i)=>keys[i]===p.key);
  }

  function ensureImages(el){
    el.querySelectorAll('[data-nashar-partner] img').forEach(img=>{
      const item=img.closest('[data-nashar-partner]');
      const p=PARTNERS.find(x=>x.key===item?.getAttribute('data-nashar-partner'));
      if(p&&img.getAttribute('src')!==p.src) img.setAttribute('src',p.src);
      if(p){img.setAttribute('alt',p.name);img.setAttribute('title',p.name)}
      ['srcset','data-src','data-lazy-src','data-original','data-srcset','data-lazy-srcset'].forEach(a=>img.removeAttribute(a));
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('display','block','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
    });
  }

  function installPartnerSet(el,$){
    if(partnerSetIsCorrect(el)){
      ensureImages(el);
      return false;
    }
    syncing=true;
    try{
      const $el=$?$(el):null;
      if($el&&el.classList.contains('owl-loaded')&&$el.data('owl.carousel')){
        try{$el.trigger('stop.owl.autoplay')}catch(e){}
        try{$el.trigger('destroy.owl.carousel')}catch(e){}
      }
      lastInstance=null;
      el.classList.remove('owl-loaded','owl-drag','owl-hidden','owl-refresh');
      el.innerHTML=markup();
      el.dataset.nasharPartnerSet=SET_VERSION;
      el.dataset.partnerCarousel='owl-original';
      ensureImages(el);
      return true;
    }finally{
      syncing=false;
    }
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

  function sync(){
    if(syncing) return;
    const el=getEl();
    if(!el) return;
    const $=jq();
    const changed=installPartnerSet(el,$);
    if(changed&&$&&$.fn&&typeof $.fn.owlCarousel==='function'){
      ensureOwl(true);
      return;
    }
    if(el.classList.contains('owl-loaded')) ensureOwl(false);
  }

  function watch(){
    const el=getEl();
    if(!el||observer) return;
    let scheduled=false;
    observer=new MutationObserver(()=>{
      if(syncing||scheduled) return;
      scheduled=true;
      requestAnimationFrame(()=>{
        scheduled=false;
        sync();
      });
    });
    observer.observe(el,{attributes:true,attributeFilter:['class'],childList:true});
  }

  function boot(){
    const el=getEl();
    if(!el){
      if(++tries<50) setTimeout(boot,200);
      return;
    }
    const $=jq();
    const changed=installPartnerSet(el,$);
    watch();

    /* If Owl is already available, initialise/reinitialise immediately with the clean five-logo set. */
    if(changed&&$&&$.fn&&typeof $.fn.owlCarousel==='function'){
      ensureOwl(true);
      return;
    }

    /* Otherwise let the original delayed Unlimited Elements initialiser use our five items. */
    if(ensureOwl(false)) return;
    if(++tries<25){setTimeout(boot,200);return;}

    /* Fallback still uses Owl only; no second carousel engine is introduced. */
    if(!ensureOwl(true)&&tries<50) setTimeout(boot,250);
  }

  document.addEventListener('DOMContentLiteSpeedLoaded',()=>{tries=0;setTimeout(boot,0)});
  window.addEventListener('load',()=>{tries=0;setTimeout(boot,50)},{once:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

/* Load the isolated hero-video controller without changing the carousel or page structure. */
(function(){
  if(window.__elnasharHeroVideoLoader)return;
  window.__elnasharHeroVideoLoader=true;
  const s=document.createElement('script');
  s.src='/hero-video-fix.js?v=1';
  s.async=false;
  (document.head||document.documentElement).appendChild(s);
})();
