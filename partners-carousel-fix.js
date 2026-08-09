/* ELNASHARGROUP partner carousel v2 — native, touch-first, independent from late Owl/LiteSpeed initialisation. */
(function(){
  'use strict';
  const ID='uc_logo_carousel_elementor_c98c777';
  const GAP=10;
  const AUTOPLAY_MS=3000;
  const RESUME_AFTER_TOUCH=5500;
  let sourceItems=[];
  let repairing=false;
  let timer=null;
  let resumeTimer=null;
  let observer=null;

  const root=()=>document.getElementById(ID);

  function keyFor(node,index){
    const img=node.querySelector&&node.querySelector('img');
    const a=node.querySelector&&node.querySelector('a');
    return [
      img&&(img.getAttribute('data-src')||img.getAttribute('src')||img.getAttribute('data-lazy-src')),
      a&&a.getAttribute('href'),
      node.getAttribute&&node.getAttribute('data-id'),
      index
    ].filter(Boolean).join('|');
  }

  function unwrapItem(node){
    if(!node) return null;
    if(node.classList&&node.classList.contains('owl-item')){
      return node.querySelector('.uc_logo_carousel') || node.firstElementChild;
    }
    return node;
  }

  function collect(el){
    const found=[];
    const stage=el.querySelector('.owl-stage');
    let candidates=[];
    if(stage){
      candidates=[...stage.children].filter(n=>n.nodeType===1 && !n.classList.contains('cloned'));
    }else{
      candidates=[...el.children].filter(n=>{
        if(n.nodeType!==1) return false;
        return !n.classList.contains('owl-stage-outer') && !n.classList.contains('owl-nav') && !n.classList.contains('owl-dots');
      });
    }
    const seen=new Set();
    candidates.forEach((candidate,index)=>{
      const item=unwrapItem(candidate);
      if(!item) return;
      const clone=item.cloneNode(true);
      clone.classList.remove('active','center','cloned');
      clone.classList.add('nashar-partner-item');
      clone.removeAttribute('style');
      const k=keyFor(clone,index);
      if(seen.has(k)) return;
      seen.add(k);
      found.push(clone);
    });
    if(found.length) sourceItems=found;
    return found;
  }

  function destroyOwl(el){
    const $=window.jQuery;
    if($&&$.fn&&typeof $.fn.owlCarousel==='function'&&el.classList.contains('owl-loaded')){
      try{$(el).trigger('destroy.owl.carousel')}catch(e){}
    }
    el.classList.remove('owl-loaded','owl-hidden','owl-refresh','owl-drag');
    el.removeAttribute('style');
  }

  function ensureImages(el){
    el.querySelectorAll('img').forEach(img=>{
      const candidate=img.getAttribute('data-src')||img.getAttribute('data-lazy-src')||img.getAttribute('data-original');
      if(candidate && (!img.getAttribute('src') || /^data:image\//i.test(img.getAttribute('src')))) img.setAttribute('src',candidate);
      img.style.setProperty('display','block','important');
      img.style.setProperty('visibility','visible','important');
      img.style.setProperty('opacity','1','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('object-position','center','important');
    });
  }

  function build(){
    const el=root();
    if(!el||repairing) return false;
    repairing=true;
    try{
      if(!sourceItems.length) collect(el);
      else if(el.querySelector('.owl-stage')) collect(el);
      if(sourceItems.length<2){repairing=false;return false}

      destroyOwl(el);
      el.innerHTML='';
      sourceItems.forEach(item=>el.appendChild(item.cloneNode(true)));
      el.className='nashar-partners-carousel';
      el.dataset.partnerCarousel='native-v2';
      el.setAttribute('role','region');
      el.setAttribute('aria-label','شعارات شركائنا');
      el.setAttribute('tabindex','0');
      ensureImages(el);
      el.scrollLeft=0;
      repairing=false;
      return true;
    }catch(e){
      repairing=false;
      console.warn('Partner carousel rebuild:',e);
      return false;
    }
  }

  function visibleCount(){return window.innerWidth>=980?4:2}
  function stepWidth(el){return (el.clientWidth-GAP*(visibleCount()-1))/visibleCount()+GAP}

  function next(){
    const el=root();
    if(!el||document.hidden||el.dataset.partnerPaused==='1') return;
    const max=Math.max(0,el.scrollWidth-el.clientWidth);
    if(max<4) return;
    const target=el.scrollLeft+stepWidth(el);
    if(target>=max-4) el.scrollTo({left:0,behavior:'smooth'});
    else el.scrollTo({left:target,behavior:'smooth'});
  }

  function startAutoplay(){
    stopAutoplay();
    timer=window.setInterval(next,AUTOPLAY_MS);
  }
  function stopAutoplay(){if(timer){clearInterval(timer);timer=null}}
  function pauseForInteraction(){
    const el=root();if(!el)return;
    el.dataset.partnerPaused='1';
    if(resumeTimer)clearTimeout(resumeTimer);
    resumeTimer=setTimeout(()=>{if(el.isConnected)el.dataset.partnerPaused='0'},RESUME_AFTER_TOUCH);
  }

  function bind(){
    const el=root();if(!el||el.dataset.partnerBound==='1')return;
    el.dataset.partnerBound='1';
    el.addEventListener('pointerdown',pauseForInteraction,{passive:true});
    el.addEventListener('touchstart',pauseForInteraction,{passive:true});
    el.addEventListener('wheel',pauseForInteraction,{passive:true});
    el.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();pauseForInteraction();
      const delta=stepWidth(el)*(e.key==='ArrowRight'?1:-1);
      el.scrollBy({left:delta,behavior:'smooth'});
    });
    el.addEventListener('mouseenter',()=>{el.dataset.partnerPaused='1'});
    el.addEventListener('mouseleave',()=>{el.dataset.partnerPaused='0'});
  }

  function guardAgainstLateOwl(){
    const el=root();if(!el)return;
    if(observer)observer.disconnect();
    let scheduled=false;
    observer=new MutationObserver(()=>{
      if(repairing||scheduled)return;
      if(el.classList.contains('owl-loaded')||el.querySelector('.owl-stage-outer')){
        scheduled=true;
        requestAnimationFrame(()=>{scheduled=false;build();bind()});
      }
    });
    observer.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    /* LiteSpeed may initialise the original Owl several seconds later. Keep enforcing our structure during that window. */
    let checks=0;
    const late=setInterval(()=>{
      checks++;
      const current=root();
      if(current&&(current.classList.contains('owl-loaded')||current.querySelector('.owl-stage-outer'))){build();bind()}
      if(checks>=30)clearInterval(late);
    },500);
  }

  function boot(){
    const el=root();
    if(!el){
      const wait=new MutationObserver(()=>{if(root()){wait.disconnect();boot()}});
      wait.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(()=>wait.disconnect(),12000);
      return;
    }
    collect(el);
    if(build()){
      bind();
      guardAgainstLateOwl();
      startAutoplay();
      window.addEventListener('resize',()=>{const current=root();if(current)current.scrollTo({left:0,behavior:'auto'})},{passive:true});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAutoplay();else startAutoplay()});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
