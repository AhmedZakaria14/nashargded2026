/* Mobile/off-canvas menu stability + desktop Services dropdown repair.
   Mobile strategy: preserve the source menu when MeanMenu succeeds; if it is missing/empty,
   clone the existing desktop navigation into the source off-canvas container. Never alter desktop content. */
(function(){
  'use strict';
  if(window.__nasharMenuStableV3)return;
  window.__nasharMenuStableV3=true;

  const MOBILE_MAX=1199;
  let mobileObserver=null;
  let mobileQueued=false;

  function exactDesktopMenu(){
    const li=document.querySelector('.header__nav-2 #menu-item-40652, .header__nav-2 .menu-item-40652');
    if(!li) return;
    const trigger=li.querySelector(':scope>a');
    const menu=li.querySelector(':scope>.main-dropdown');
    if(!trigger||!menu) return;

    const chain=[li,li.parentElement,li.closest('.header__nav-2'),li.closest('.header__inner-2'),li.closest('.header__area-2')].filter(Boolean);
    chain.forEach(el=>el.style.setProperty('overflow','visible','important'));

    const place=(open)=>{
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
    };

    const openMenu=()=>{
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
    };

    const closeMenu=()=>{
      if(window.innerWidth<1200) return;
      li.classList.remove('services-dropdown-exact-open');
      trigger.setAttribute('aria-expanded','false');
      place(false);
      menu.style.setProperty('opacity','0','important');
      menu.style.setProperty('visibility','hidden','important');
      menu.style.setProperty('pointer-events','none','important');
    };

    if(li.dataset.exactServicesDesktop==='1'){
      if(li.classList.contains('services-dropdown-exact-open')) place(true);
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
      if(window.innerWidth<1200) return;
      if(window.matchMedia('(hover:none),(pointer:coarse)').matches && !li.classList.contains('services-dropdown-exact-open')){
        e.preventDefault();
        openMenu();
      }
    });
    document.addEventListener('click',e=>{if(!li.contains(e.target))closeMenu()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();trigger.focus()}});
    window.addEventListener('resize',()=>{if(li.classList.contains('services-dropdown-exact-open'))place(true)});
    window.addEventListener('scroll',()=>{if(li.classList.contains('services-dropdown-exact-open'))place(true)},{passive:true});
  }

  function mobileHost(){
    return document.querySelector('.offcanvas__menu-wrapper') || document.querySelector('.offcanvas__menu');
  }

  function usableMenu(root){
    if(!root)return null;
    const candidates=[
      root.querySelector('.mean-nav>ul'),
      root.querySelector('ul.main-menu'),
      root.querySelector(':scope>ul'),
      root.querySelector('nav>ul')
    ].filter(Boolean);
    return candidates.find(ul=>ul.querySelectorAll(':scope>li>a, li>a').length>=3)||null;
  }

  function desktopMenu(){
    return document.querySelector('.header__nav-2 .main-menu') ||
           document.querySelector('.header__nav-2>ul') ||
           document.querySelector('header nav .main-menu');
  }

  function stripDuplicateIds(root){
    root.querySelectorAll('[id]').forEach(el=>{
      if(/^menu-item-/.test(el.id)) el.removeAttribute('id');
      else if(el.id) el.removeAttribute('id');
    });
  }

  function buildFallback(host){
    const source=desktopMenu();
    if(!host||!source)return null;
    let fallback=host.querySelector('.nashar-mobile-menu-fallback');
    if(fallback)return fallback.querySelector('ul');

    const nav=document.createElement('nav');
    nav.className='nashar-mobile-menu-fallback';
    nav.setAttribute('aria-label','القائمة الرئيسية');
    const clone=source.cloneNode(true);
    clone.classList.add('nashar-mobile-menu-list');
    clone.classList.remove('main-menu');
    stripDuplicateIds(clone);
    nav.appendChild(clone);
    host.prepend(nav);
    host.dataset.nasharMobileFallback='1';
    return clone;
  }

  function normalizeMobileTree(ul){
    if(!ul)return;
    ul.classList.add('nashar-mobile-menu-active');
    ul.removeAttribute('style');

    [...ul.children].forEach(li=>{
      if(li.nodeType!==1)return;
      li.style.removeProperty('display');
      li.style.removeProperty('visibility');
      li.style.removeProperty('opacity');
      const directLink=li.querySelector(':scope>a');
      if(directLink){
        directLink.style.removeProperty('display');
        directLink.style.removeProperty('visibility');
        directLink.style.removeProperty('opacity');
      }

      const submenu=li.querySelector(':scope>ul.main-dropdown,:scope>ul.main-dropdown-menu,:scope>ul.sub-menu');
      if(!submenu)return;
      submenu.classList.add('nashar-mobile-submenu');
      submenu.removeAttribute('style');
      li.classList.add('nashar-mobile-has-submenu');

      if(!directLink)return;
      directLink.setAttribute('aria-haspopup','true');
      if(!directLink.hasAttribute('aria-expanded'))directLink.setAttribute('aria-expanded','false');

      let button=li.querySelector(':scope>.nashar-mobile-submenu-toggle');
      if(!button){
        button=document.createElement('button');
        button.type='button';
        button.className='nashar-mobile-submenu-toggle';
        button.setAttribute('aria-label','فتح القائمة الفرعية');
        button.setAttribute('aria-expanded','false');
        li.insertBefore(button,submenu);
      }
      if(button.dataset.bound==='1')return;
      button.dataset.bound='1';
      button.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        const open=li.classList.toggle('nashar-mobile-submenu-open');
        button.setAttribute('aria-expanded',open?'true':'false');
        directLink.setAttribute('aria-expanded',open?'true':'false');
      });
    });
  }

  function ensureMobileMenu(){
    if(window.innerWidth>MOBILE_MAX)return;
    const host=mobileHost();
    if(!host)return;

    host.classList.add('nashar-mobile-menu-host');
    let menu=usableMenu(host);

    /* MeanMenu/source menu wins whenever it exists. Fallback is only for a truly empty off-canvas. */
    const fallback=host.querySelector('.nashar-mobile-menu-fallback');
    const realMenu=[...host.querySelectorAll('.mean-nav>ul, ul.main-menu, :scope>ul, nav:not(.nashar-mobile-menu-fallback)>ul')]
      .find(ul=>ul.querySelectorAll('li>a').length>=3);

    if(realMenu){
      if(fallback)fallback.hidden=true;
      menu=realMenu;
    }else{
      if(fallback)fallback.hidden=false;
      menu=menu||buildFallback(host);
    }

    normalizeMobileTree(menu);

    /* Old one-off Services control must not compete with the generic submenu controller. */
    host.querySelectorAll('.services-mobile-exact-toggle,.nashar-services-toggle').forEach(btn=>{
      btn.hidden=true;
      btn.setAttribute('aria-hidden','true');
    });
  }

  function scheduleMobile(){
    if(mobileQueued)return;
    mobileQueued=true;
    requestAnimationFrame(()=>{
      mobileQueued=false;
      ensureMobileMenu();
    });
  }

  function observeMobile(){
    const host=mobileHost();
    if(!host||mobileObserver)return;
    mobileObserver=new MutationObserver(scheduleMobile);
    mobileObserver.observe(host,{childList:true,subtree:true});
  }

  function init(){
    exactDesktopMenu();
    ensureMobileMenu();
    observeMobile();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  /* Cover LiteSpeed/MeanMenu delayed initialization without tying anything to scroll. */
  [120,400,900,1800].forEach(ms=>setTimeout(init,ms));
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>{setTimeout(init,0);setTimeout(init,250)});
  window.addEventListener('load',()=>setTimeout(init,80),{once:true});
  window.addEventListener('resize',()=>{
    if(window.innerWidth<=MOBILE_MAX)scheduleMobile();
  },{passive:true});
})();
