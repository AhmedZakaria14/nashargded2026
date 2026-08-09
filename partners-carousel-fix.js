/* Partner logos carousel — restores the original Owl behavior with reliable autoplay fallback. */
(function(){
  'use strict';
  const ID='uc_logo_carousel_elementor_c98c777';
  const INTERVAL=3000;
  const SPEED=1000;
  let attempts=0;
  let fallbackStarted=false;

  function root(){return document.getElementById(ID)}

  function initOwl(){
    const el=root();
    const $=window.jQuery;
    if(!el||!$||!$.fn||typeof $.fn.owlCarousel!=='function') return false;
    const $el=$(el);
    try{
      if($el.hasClass('owl-loaded')) $el.trigger('destroy.owl.carousel');
      $el.removeClass('partner-native-carousel');
      $el.find('.partner-native-clone').remove();
      el.style.removeProperty('transform');
      el.style.removeProperty('transition');
      $el.owlCarousel({
        loop:true,
        center:false,
        autoplay:true,
        autoplayTimeout:INTERVAL,
        autoplayHoverPause:true,
        autoplaySpeed:SPEED,
        smartSpeed:SPEED,
        nav:false,
        dots:false,
        navigation:true,
        margin:10,
        mouseDrag:true,
        touchDrag:true,
        pullDrag:true,
        freeDrag:false,
        responsive:{
          0:{items:2},
          768:{items:2},
          980:{items:4}
        }
      });
      el.dataset.partnerCarousel='owl';
      return true;
    }catch(e){
      console.warn('Partner carousel Owl restore:',e);
      return false;
    }
  }

  function nativeFallback(){
    if(fallbackStarted) return;
    const el=root();
    if(!el) return;
    const items=[...el.children].filter(n=>n.nodeType===1 && !n.classList.contains('owl-stage-outer'));
    if(items.length<2) return;
    fallbackStarted=true;
    el.classList.add('partner-native-carousel');
    el.dataset.partnerCarousel='native';

    let busy=false, paused=false, timer=null;
    const visible=()=>window.innerWidth>=980?4:2;
    const step=()=>{
      if(paused||busy||!el.isConnected) return;
      const first=el.firstElementChild;
      if(!first) return;
      const gap=10;
      const width=(el.clientWidth-gap*(visible()-1))/visible();
      busy=true;
      el.style.transition='transform '+SPEED+'ms ease';
      el.style.transform='translate3d(-'+(width+gap)+'px,0,0)';
      window.setTimeout(()=>{
        el.style.transition='none';
        el.appendChild(first);
        el.style.transform='translate3d(0,0,0)';
        void el.offsetWidth;
        busy=false;
      },SPEED+30);
    };
    const start=()=>{stop();timer=window.setInterval(step,INTERVAL)};
    const stop=()=>{if(timer){clearInterval(timer);timer=null}};
    el.addEventListener('mouseenter',()=>{paused=true});
    el.addEventListener('mouseleave',()=>{paused=false});
    el.addEventListener('touchstart',()=>{paused=true},{passive:true});
    el.addEventListener('touchend',()=>{paused=false},{passive:true});
    document.addEventListener('visibilitychange',()=>{paused=document.hidden});
    start();
  }

  function boot(){
    if(initOwl()) return;
    attempts++;
    if(attempts<24){window.setTimeout(boot,200);return;}
    nativeFallback();
    /* If Owl arrives later, prefer the original engine and replace fallback. */
    let late=0;
    const lateTimer=window.setInterval(()=>{
      late++;
      if(initOwl()||late>20) clearInterval(lateTimer);
    },500);
  }

  function start(){
    if(!root()){
      const mo=new MutationObserver(()=>{if(root()){mo.disconnect();boot()}});
      mo.observe(document.documentElement,{childList:true,subtree:true});
      window.setTimeout(()=>mo.disconnect(),10000);
      return;
    }
    boot();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
