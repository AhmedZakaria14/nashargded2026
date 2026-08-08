/* Dedicated Services-menu behavior repair. */
(function(){
  'use strict';

  function exactDesktopMenu(){
    const li=document.querySelector('.header__nav-2 #menu-item-40652, .header__nav-2 .menu-item-40652');
    if(!li) return;
    const trigger=li.querySelector(':scope>a');
    const menu=li.querySelector(':scope>.main-dropdown');
    if(!trigger||!menu) return;

    const chain=[li,li.parentElement,li.closest('.header__nav-2'),li.closest('.header__inner-2'),li.closest('.header__area-2')].filter(Boolean);
    chain.forEach(el=>el.style.setProperty('overflow','visible','important'));

    function place(open){
      if(window.innerWidth<1200) return;
      const r=li.getBoundingClientRect();
      let left=r.left;
      if(left+300>window.innerWidth-8) left=window.innerWidth-308;
      if(left<8) left=8;

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
    }

    function openMenu(){
      if(window.innerWidth<1200) return;
      li.classList.add('services-dropdown-exact-open');
      trigger.setAttribute('aria-expanded','true');
      place(false);
      menu.style.setProperty('display','block','important');
      menu.style.setProperty('visibility','visible','important');
      menu.style.setProperty('pointer-events','auto','important');
      requestAnimationFrame(()=>{
        place(true);
        menu.style.setProperty('opacity','1','important');
      });
    }

    function closeMenu(){
      if(window.innerWidth<1200) return;
      li.classList.remove('services-dropdown-exact-open');
      trigger.setAttribute('aria-expanded','false');
      place(false);
      menu.style.setProperty('opacity','0','important');
      menu.style.setProperty('visibility','hidden','important');
      menu.style.setProperty('pointer-events','none','important');
    }

    if(!li.dataset.exactServicesDesktop){
      li.dataset.exactServicesDesktop='1';
      trigger.setAttribute('aria-haspopup','true');
      trigger.setAttribute('aria-expanded','false');
      li.addEventListener('mouseenter',openMenu);
      li.addEventListener('mouseleave',closeMenu);
      li.addEventListener('focusin',openMenu);
      li.addEventListener('focusout',()=>setTimeout(()=>{if(!li.contains(document.activeElement))closeMenu()},0));
      trigger.addEventListener('click',e=>{
        if(window.innerWidth<1200) return;
        if(window.matchMedia('(hover:none),(pointer:coarse)').matches){
          if(!li.classList.contains('services-dropdown-exact-open')){
            e.preventDefault();
            openMenu();
          }
        }
      });
      document.addEventListener('click',e=>{if(!li.contains(e.target))closeMenu()});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();trigger.focus()}});
      window.addEventListener('resize',()=>{if(li.classList.contains('services-dropdown-exact-open'))place(true)});
      window.addEventListener('scroll',()=>{if(li.classList.contains('services-dropdown-exact-open'))place(true)},{passive:true});
    }
    closeMenu();
  }

  function exactMobileMenu(){
    const li=document.querySelector('.offcanvas__menu .menu-item-40652');
    if(!li) return;
    const trigger=li.querySelector(':scope>a');
    const menu=li.querySelector(':scope>.main-dropdown-menu');
    if(!trigger||!menu) return;

    /* Remove old fallback controls so only one controller exists. */
    li.querySelectorAll(':scope>.nashar-services-toggle,:scope>.services-mobile-exact-toggle').forEach(b=>b.remove());
    li.classList.remove('services-mobile-open');

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='services-mobile-exact-toggle';
    btn.setAttribute('aria-label','فتح قائمة خدماتنا');
    btn.setAttribute('aria-expanded','false');
    li.appendChild(btn);

    trigger.setAttribute('aria-haspopup','true');
    trigger.setAttribute('aria-expanded','false');
    li.classList.remove('services-mobile-exact-open');

    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const open=li.classList.toggle('services-mobile-exact-open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      trigger.setAttribute('aria-expanded',open?'true':'false');
    });
  }

  function init(){
    exactDesktopMenu();
    exactMobileMenu();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,250);
  setTimeout(init,1200);

  const observer=new MutationObserver(()=>init());
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
