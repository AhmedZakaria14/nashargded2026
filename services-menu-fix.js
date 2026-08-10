/* Desktop Services dropdown repair only.
   Mobile/off-canvas navigation is intentionally untouched so the cloned Axtra/Adsela theme owns its exact original UX. */
(function(){
  'use strict';
  if(window.__nasharDesktopServicesOnlyV4)return;
  window.__nasharDesktopServicesOnlyV4=true;

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
      requestAnimationFrame(()=>{
        place(true);
        menu.style.setProperty('opacity','1','important');
      });
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
      if(window.matchMedia('(hover:none),(pointer:coarse)').matches&&!li.classList.contains('services-dropdown-exact-open')){
        e.preventDefault();
        openMenu();
      }
    });
    document.addEventListener('click',e=>{if(!li.contains(e.target))closeMenu()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();trigger.focus()}});
    window.addEventListener('resize',()=>{if(window.innerWidth>=1200&&li.classList.contains('services-dropdown-exact-open'))place(true)});
    window.addEventListener('scroll',()=>{if(window.innerWidth>=1200&&li.classList.contains('services-dropdown-exact-open'))place(true)},{passive:true});
  }

  function init(){if(window.innerWidth>=1200)exactDesktopMenu()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  setTimeout(init,250);
  setTimeout(init,1200);
})();
