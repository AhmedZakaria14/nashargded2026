/* النشار جروب — client-logo showcase v4. Restores the full approved local client set only. */
(function(){
  'use strict';
  if(window.__nasharClientShowcaseV4)return;
  window.__nasharClientShowcaseV4=true;
  /* Prevent any not-yet-executed legacy V2 copy from taking ownership. */
  window.__nasharClientShowcaseV2=true;

  const SECTION_ID='17b40cf';
  const GRID_ID='49884ea';
  const IS_EN=/^\/en(?:\/|$)/i.test(location.pathname||'/');
  const ASSET_BASE='/assets/clients/';
  const VERSION='4';
  const LOGOS=[
    {file:'client-01.webp',name:'شعار عميل 1'},
    {file:'client-02.avif',name:'شعار عميل 2'},
    {file:'client-03.png',name:'شعار عميل 3'},
    {file:'client-04.png',name:'شعار عميل 4'},
    {file:'client-05.png',name:'شعار عميل 5'},
    {file:'client-06.webp',name:'شعار عميل 6'},
    {file:'client-07.jfif',name:'شعار عميل 7'},
    {file:'client-08.jfif',name:'شعار عميل 8'},
    {file:'client-09.jfif',name:'شعار عميل 9'},
    {file:'client-10.png',name:'معلم مطابخ'},
    {file:'client-11.png',name:'مؤسسة العازل الحديث'},
    {file:'client-12.png',name:'روائع الجي ار سي'},
    {file:'client-13.png',name:'فني كهرباء دبي'},
    {file:'client-14.png',name:'نجار دبي'},
    {file:'client-15.png',name:'صيانة جدة'},
    {file:'client-16.png',name:'مكتب تعقيب'},
    {file:'client-17.png',name:'حداد كريتال جدة'},
    {file:'client-18.png',name:'سلام 5G'}
  ];
  let gridObserver=null;

  function asset(file,retry){
    return ASSET_BASE+file+'?clients=v'+VERSION+(retry?'&retry='+retry:'');
  }

  function addStyles(){
    ['nashar-client-showcase-v1','nashar-client-showcase-v2','nashar-client-showcase-v3'].forEach(id=>document.getElementById(id)?.remove());
    if(document.getElementById('nashar-client-showcase-v4'))return;
    const style=document.createElement('style');
    style.id='nashar-client-showcase-v4';
    style.textContent=`
      [data-id="${GRID_ID}"]{background:#fff!important;position:relative!important;overflow:hidden!important}
      [data-id="${GRID_ID}"]>.e-con-inner{display:block!important;width:100%!important;max-width:1320px!important;margin:0 auto!important;padding:34px 24px 42px!important}
      .nashar-client-grid-v4{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:18px!important;width:100%!important;align-items:stretch!important}
      .nashar-client-card-v4{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;aspect-ratio:5/4!important;border:1px solid rgba(0,0,0,.06)!important;border-radius:14px!important;background:#f7f7f8!important;overflow:hidden!important;padding:12px!important;box-shadow:0 5px 18px rgba(0,0,0,.05)!important;transition:transform .25s ease,box-shadow .25s ease!important}
      .nashar-client-card-v4:hover{transform:translateY(-3px)!important;box-shadow:0 10px 28px rgba(0,0,0,.09)!important}
      .nashar-client-logo-v4{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important;margin:auto!important}
      .nashar-client-card-v4[data-load-state="error"]{background:#f3f3f4!important}
      .nashar-client-card-v4[data-load-state="error"]:after{content:attr(data-client-name);display:block;color:#666;font-size:12px;font-weight:700;text-align:center;padding:8px}
      .nashar-client-card-v4[data-load-state="error"] .nashar-client-logo-v4{display:none!important}
      @media(max-width:1100px){.nashar-client-grid-v4{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
      @media(max-width:767px){
        [data-id="${GRID_ID}"]>.e-con-inner{padding:24px 14px 30px!important}
        .nashar-client-grid-v4{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
        .nashar-client-card-v4{border-radius:10px!important;padding:8px!important}
      }
      @media(max-width:390px){.nashar-client-grid-v4{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    `;
    (document.head||document.documentElement).appendChild(style);
  }

  function makeLogo(item,index){
    const card=document.createElement('div');
    card.className='nashar-client-card-v4';
    card.dataset.clientIndex=String(index+1);
    card.dataset.clientName=item.name;
    card.dataset.loadState='loading';

    const img=document.createElement('img');
    img.className='nashar-client-logo-v4';
    img.src=asset(item.file,0);
    img.alt=IS_EN?'Client logo '+(index+1):item.name;
    img.title=img.alt;
    img.loading='eager';
    img.decoding='async';
    img.draggable=false;
    img.dataset.retry='0';
    img.addEventListener('load',()=>{card.dataset.loadState='loaded'});
    img.addEventListener('error',function(){
      const n=Number(this.dataset.retry||0);
      if(n<2){
        this.dataset.retry=String(n+1);
        setTimeout(()=>{this.src=asset(item.file,n+1)},120*(n+1));
        return;
      }
      card.dataset.loadState='error';
    });
    card.appendChild(img);
    return card;
  }

  function patchHeading(){
    const section=document.querySelector('[data-id="'+SECTION_ID+'"]');
    if(!section)return false;
    const title=section.querySelector('[data-id="4b742c6"] .sec-title')||section.querySelector('.sec-title');
    if(!title)return false;
    const text=IS_EN?'Proud to serve clients who trust us':'فخورين بخدمة عملاءنا الذين يثقون بنا';
    if(title.textContent.trim()!==text)title.textContent=text;
    return true;
  }

  function buildGrid(force){
    const gridSection=document.querySelector('[data-id="'+GRID_ID+'"]');
    if(!gridSection)return false;
    const inner=gridSection.querySelector(':scope > .e-con-inner')||gridSection;
    const valid=inner.dataset.nasharClientGrid==='4'&&inner.querySelectorAll(':scope .nashar-client-card-v4').length===LOGOS.length;
    if(valid&&!force){observeGrid(inner);return true}

    const grid=document.createElement('div');
    grid.className='nashar-client-grid-v4';
    grid.dataset.clientCount=String(LOGOS.length);
    grid.setAttribute('aria-label',IS_EN?'Clients who trust us':'عملاء يثقون بنا');
    LOGOS.forEach((item,index)=>grid.appendChild(makeLogo(item,index)));
    inner.replaceChildren(grid);
    inner.dataset.nasharClientGrid='4';
    observeGrid(inner);
    return true;
  }

  function observeGrid(inner){
    if(gridObserver||!inner)return;
    gridObserver=new MutationObserver(()=>{
      const count=inner.querySelectorAll('.nashar-client-card-v4').length;
      if(inner.dataset.nasharClientGrid!=='4'||count!==LOGOS.length){
        queueMicrotask(()=>buildGrid(true));
      }
    });
    /* Deliberately scoped to the client grid only; no style/attribute observation. */
    gridObserver.observe(inner,{childList:true,subtree:false});
  }

  function apply(force){
    addStyles();
    patchHeading();
    buildGrid(!!force);
  }

  apply(true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(true),{once:true});
  document.addEventListener('DOMContentLiteSpeedLoaded',()=>apply(true));
  window.addEventListener('load',()=>apply(true),{once:true});
  [80,250,700,1600,2400,3600].forEach(ms=>setTimeout(()=>apply(false),ms));
})();
