/* ELNASHARGROUP persistent day/night theme controller */
(function(){
  'use strict';
  const KEY='elnashargroup-theme';
  const root=document.documentElement;
  const lang=(root.lang||document.body&&document.body.lang||'ar').toLowerCase();
  const isAr=lang.startsWith('ar');
  const getTheme=()=>root.dataset.theme==='dark'?'dark':'light';
  const icon=(theme)=>theme==='light'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.8A8.3 8.3 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>';
  function labels(theme){
    if(isAr) return theme==='light'?{text:'الوضع الليلي',aria:'التبديل إلى الوضع الليلي'}:{text:'الوضع النهاري',aria:'التبديل إلى الوضع النهاري'};
    return theme==='light'?{text:'Night mode',aria:'Switch to night mode'}:{text:'Day mode',aria:'Switch to day mode'};
  }
  function syncButtons(){
    const theme=getTheme(),l=labels(theme);
    document.querySelectorAll('.theme-toggle').forEach(btn=>{
      if(btn.dataset.themeRendered!==theme){
        btn.innerHTML=icon(theme)+'<span class="theme-toggle-label">'+l.text+'</span>';
        btn.dataset.themeRendered=theme;
      }
      btn.setAttribute('aria-label',l.aria);
      btn.setAttribute('title',l.aria);
      btn.setAttribute('aria-pressed',theme==='dark'?'true':'false');
    });
    const meta=document.querySelector('meta[name="theme-color"]');
    const color=theme==='light'?'#f8fafc':'#07100c';
    if(meta&&meta.getAttribute('content')!==color) meta.setAttribute('content',color);
  }
  function setTheme(theme,save){
    const next=theme==='dark'?'dark':'light';
    if(root.dataset.theme!==next) root.dataset.theme=next;
    if(save!==false){try{localStorage.setItem(KEY,next)}catch(e){}}
    syncButtons();
    window.dispatchEvent(new CustomEvent('elnashar-theme-change',{detail:{theme:next}}));
  }
  function makeButton(){
    const b=document.createElement('button');
    b.type='button';b.className='theme-toggle';
    b.addEventListener('click',()=>setTheme(getTheme()==='light'?'dark':'light',true));
    return b;
  }
  function addOriginalDesktop(){
    const menu=document.querySelector('.header__nav-2 .main-menu');
    if(!menu||menu.querySelector(':scope > .theme-toggle-item')) return false;
    const li=document.createElement('li');li.className='theme-toggle-item menu-item';li.appendChild(makeButton());menu.appendChild(li);return true;
  }
  function addOriginalMobile(){
    const menu=document.querySelector('.offcanvas__menu>ul,.offcanvas__menu .menu-anim');
    if(!menu||menu.querySelector(':scope > .theme-toggle-item')) return false;
    const li=document.createElement('li');li.className='theme-toggle-item menu-item';li.appendChild(makeButton());menu.appendChild(li);return true;
  }
  function addSpaDesktop(){
    const nav=document.querySelector('.desktop-nav');
    if(!nav||nav.querySelector(':scope > .theme-toggle-item')) return false;
    const wrap=document.createElement('span');wrap.className='theme-toggle-item';wrap.appendChild(makeButton());nav.appendChild(wrap);return true;
  }
  function addSpaMobile(){
    const nav=document.querySelector('.mobile-menu nav');
    if(!nav||nav.querySelector(':scope > .theme-toggle-item')) return false;
    const wrap=document.createElement('div');wrap.className='theme-toggle-item';wrap.appendChild(makeButton());nav.appendChild(wrap);return true;
  }
  function mount(){
    addOriginalDesktop();addOriginalMobile();addSpaDesktop();addSpaMobile();syncButtons();
  }
  if(!root.dataset.theme){let saved='light';try{saved=localStorage.getItem(KEY)||'light'}catch(e){}root.dataset.theme=saved==='dark'?'dark':'light'}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
  let scheduled=false;
  const mo=new MutationObserver(()=>{
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;mount()});
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  window.elnasharSetTheme=setTheme;
})();
