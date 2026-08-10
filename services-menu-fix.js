/* Nashar menu runtime v5.
   Desktop: keep the existing Services dropdown repair.
   Mobile/off-canvas: reproduce the SOURCE Axtra/Adsela runtime exactly first:
   $('.offcanvas__menu').meanmenu({meanScreenWidth:'5000',meanMenuContainer:'.offcanvas__menu-wrapper',meanMenuCloseSize:'36px'}).
   If the upstream LiteSpeed bundle does not expose MeanMenu, adapt the ORIGINAL off-canvas DOM in place
   to the same .mean-container/.mean-nav structure. No cloned/duplicate mobile menu is created. */
(function(){
  'use strict';
  if(window.__nasharMenuRuntimeV5)return;
  window.__nasharMenuRuntimeV5=true;

  const MOBILE_MAX=1199;
  let fallbackTimer=0;

  function wrapper(){return document.querySelector('.offcanvas__menu-wrapper')}
  function sourceNav(){
    const w=wrapper();
    return w&&(w.querySelector('.offcanvas__menu')||w.querySelector('.nashar-source-mean-nav'));
  }
  function hasMeanMenu(){
    const w=wrapper();
    if(!w)return false;
    const nav=w.querySelector('.mean-nav');
    return !!(w.classList.contains('mean-container')&&nav&&nav.querySelectorAll('ul li>a').length>=3);
  }

  /* The original Axtra code is only opacity/visibility for open and close.
     Binding the same behavior locally removes dependence on the remote bundled main.js. */
  function bindOriginalOffcanvasCore(){
    const open=document.getElementById('open_offcanvas');
    const close=document.getElementById('close_offcanvas');
    const area=document.querySelector('.offcanvas__area');
    if(!open||!close||!area)return;

    if(open.dataset.nasharOffcanvasCore!=='1'){
      open.dataset.nasharOffcanvasCore='1';
      open.addEventListener('click',()=>{
        area.style.opacity='1';
        area.style.visibility='visible';
        area.setAttribute('aria-hidden','false');
        ensureOriginalMeanMenu(false);
        clearTimeout(fallbackTimer);
        fallbackTimer=setTimeout(()=>ensureOriginalMeanMenu(true),450);
      });
    }
    if(close.dataset.nasharOffcanvasCore!=='1'){
      close.dataset.nasharOffcanvasCore='1';
      close.addEventListener('click',()=>{
        area.style.opacity='0';
        area.style.visibility='hidden';
        area.setAttribute('aria-hidden','true');
      });
    }
  }

  function runRealMeanMenu(){
    if(hasMeanMenu())return true;
    const w=wrapper();
    const nav=w&&w.querySelector('.offcanvas__menu');
    const jq=window.jQuery;
    if(!w||!nav||!jq||!jq.fn||typeof jq.fn.meanmenu!=='function')return false;
    try{
      jq(nav).meanmenu({
        meanScreenWidth:'5000',
        meanMenuContainer:'.offcanvas__menu-wrapper',
        meanMenuCloseSize:'36px'
      });
      return hasMeanMenu();
    }catch(e){
      console.warn('MeanMenu source runtime recovery:',e);
      return false;
    }
  }

  function animateSubmenu(ul,open){
    if(!ul)return;
    ul.style.overflow='hidden';
    ul.style.transition='max-height .28s ease, opacity .22s ease';
    if(open){
      ul.style.display='block';
      ul.style.maxHeight='0px';
      ul.style.opacity='0';
      requestAnimationFrame(()=>{
        ul.style.maxHeight=ul.scrollHeight+'px';
        ul.style.opacity='1';
      });
      setTimeout(()=>{if(ul.dataset.nasharOpen==='1'){ul.style.maxHeight='none';ul.style.overflow='visible'}},300);
    }else{
      if(getComputedStyle(ul).display==='none')return;
      if(ul.style.maxHeight==='none'||!ul.style.maxHeight)ul.style.maxHeight=ul.scrollHeight+'px';
      ul.style.overflow='hidden';
      requestAnimationFrame(()=>{
        ul.style.maxHeight='0px';
        ul.style.opacity='0';
      });
      setTimeout(()=>{if(ul.dataset.nasharOpen!=='1')ul.style.display='none'},300);
    }
  }

  /* Dependency-free source-equivalent fallback. It MUTATES the original nav in place;
     removing .offcanvas__menu also prevents a late remote main.js from double-initializing MeanMenu. */
  function buildSourceMeanFallback(){
    if(hasMeanMenu())return true;
    const w=wrapper();
    const nav=w&&w.querySelector('.offcanvas__menu');
    if(!w||!nav)return false;
    const root=nav.querySelector(':scope>ul');
    if(!root||root.querySelectorAll(':scope>li>a').length<3)return false;

    w.classList.add('mean-container','nashar-mean-fallback');
    nav.classList.remove('offcanvas__menu');
    nav.classList.add('mean-nav','nashar-source-mean-nav');
    root.classList.add('nashar-mean-root');
    root.removeAttribute('style');

    [...root.children].forEach(li=>{
      if(li.nodeType!==1)return;
      const direct=li.querySelector(':scope>a');
      const sub=li.querySelector(':scope>ul');
      if(!direct||!sub)return;

      sub.dataset.nasharOpen='0';
      sub.style.display='none';
      sub.style.maxHeight='0px';
      sub.style.opacity='0';

      let expand=li.querySelector(':scope>a.mean-expand');
      if(!expand){
        expand=document.createElement('a');
        expand.href='#nav';
        expand.className='mean-expand';
        expand.setAttribute('role','button');
        expand.setAttribute('aria-label','فتح القائمة الفرعية');
        expand.setAttribute('aria-expanded','false');
        expand.textContent='+';
        direct.insertAdjacentElement('afterend',expand);
      }
      direct.setAttribute('aria-haspopup','true');
      direct.setAttribute('aria-expanded','false');

      if(expand.dataset.nasharMeanBound!=='1'){
        expand.dataset.nasharMeanBound='1';
        expand.addEventListener('click',e=>{
          e.preventDefault();
          e.stopPropagation();
          const opening=sub.dataset.nasharOpen!=='1';
          sub.dataset.nasharOpen=opening?'1':'0';
          li.classList.toggle('mean-open',opening);
          direct.setAttribute('aria-expanded',opening?'true':'false');
          expand.setAttribute('aria-expanded',opening?'true':'false');
          expand.setAttribute('aria-label',opening?'إغلاق القائمة الفرعية':'فتح القائمة الفرعية');
          expand.textContent=opening?'−':'+';
          animateSubmenu(sub,opening);
        });
      }
    });
    return true;
  }

  function ensureOriginalMeanMenu(allowFallback){
    if(hasMeanMenu())return true;
    if(runRealMeanMenu())return true;
    if(allowFallback)return buildSourceMeanFallback();
    return false;
  }

  function mobileRuntimeInit(){
    bindOriginalOffcanvasCore();
    if(hasMeanMenu())return;
    /* Give LiteSpeed/source bundle first right of refusal. */
    ensureOriginalMeanMenu(false);
  }

  function exactDesktopMenu(){
    if(window.innerWidth<1200)return;
    const li=document.querySelector('.header__nav-2 #menu-item-40652, .header__nav-2 .menu-item-40652');
    if(!li)return;
    const trigger=li.querySelector(':scope>a');
    const menu=li.querySelector(':scope>.main-dropdown');
    if(!trigger||!menu)return;

    const chain=[li,li.parentElement,li.closest('.header__nav-2'),li.closest('.header__inner-2'),li.closest('.header__area-2')].filter(Boolean);
    chain.forEach(el=>el.style.setProperty('overflow','visible','important'));

    const place=open=>{
      if(window.innerWidth<1200)return;
      const r=li.getBoundingClientRect();
      let left=r.left;
      if(left+300>window.innerWidth-8)left=window.innerWidth-308;
      if(left<8)left=8;
      menu.style.setProperty('position','fixed','important');
      menu.style.setProperty('left',left+'px','important');
      menu.style.setProperty('right','auto','important');
      menu.style.setProperty('width','300px','important');
      menu.style.setProperty('min-width','300px','important');
      menu.style.setProperty('max-width','300px','important');
      menu.style.setProperty('top',(r.top+(open?75:85))+'px','important');
      menu.style.setProperty('z-index','100003','important');
      menu.style.setProperty('background','#fff','important');
      menu.style.setProperty('transform','none','important');
    };

    const openMenu=()=>{
      if(window.innerWidth<1200)return;
      li.classList.add('services-dropdown-exact-open');
      trigger.setAttribute('aria-expanded','true');
      place(false);
      menu.style.setProperty('display','block','important');
      menu.style.setProperty('visibility','visible','important');
      menu.style.setProperty('pointer-events','auto','important');
      requestAnimationFrame(()=>{place(true);menu.style.setProperty('opacity','1','important')});
    };

    const closeMenu=()=>{
      if(window.innerWidth<1200)return;
      li.classList.remove('services-dropdown-exact-open');
      trigger.setAttribute('aria-expanded','false');
      place(false);
      menu.style.setProperty('opacity','0','important');
      menu.style.setProperty('visibility','hidden','important');
      menu.style.setProperty('pointer-events','none','important');
    };

    if(li.dataset.exactServicesDesktop==='1'){
      if(li.classList.contains('services-dropdown-exact-open'))place(true);
      return;
    }
    li.dataset.exactServicesDesktop='1';
    trigger.setAttribute('aria-haspopup','true');
    trigger.setAttribute('aria-expanded','false');
    closeMenu();
    li.addEventListener('mouseenter',openMenu);
    li.addEventListener('mouseleave',closeMenu);
    li.addEventListener('focusin',openMenu);
    li.addEventListener('focusout',()=>setTimeout(()=>{if(!li.contains(document.activeElement))closeMenu()},0));
    trigger.addEventListener('click',e=>{
      if(window.innerWidth<1200)return;
      if(window.matchMedia('(hover:none),(pointer:coarse)').matches&&!li.classList.contains('services-dropdown-exact-open')){e.preventDefault();openMenu()}
    });
    document.addEventListener('click',e=>{if(!li.contains(e.target))closeMenu()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();trigger.focus()}});
    window.addEventListener('resize',()=>{if(window.innerWidth>=1200&&li.classList.contains('services-dropdown-exact-open'))place(true)});
    window.addEventListener('scroll',()=>{if(window.innerWidth>=1200&&li.classList.contains('services-dropdown-exact-open'))place(true)},{passive:true});
  }

  function init(){
    mobileRuntimeInit();
    exactDesktopMenu();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  /* Source/LiteSpeed completion is the preferred moment to initialize the real MeanMenu plugin. */
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>{
    setTimeout(()=>ensureOriginalMeanMenu(false),0);
    setTimeout(()=>ensureOriginalMeanMenu(false),80);
    setTimeout(()=>ensureOriginalMeanMenu(true),500);
  });
  window.addEventListener('DOMContentLiteSpeedLoaded',()=>setTimeout(()=>ensureOriginalMeanMenu(false),40));
  window.addEventListener('load',()=>{
    setTimeout(init,80);
    setTimeout(()=>ensureOriginalMeanMenu(false),350);
    setTimeout(()=>ensureOriginalMeanMenu(true),1400);
  },{once:true});

  /* Final deterministic safety net for cached/failed upstream bundles. */
  setTimeout(()=>ensureOriginalMeanMenu(false),450);
  setTimeout(()=>ensureOriginalMeanMenu(true),2200);
})();
