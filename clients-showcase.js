/* النشار جروب — isolated client-logo showcase v2. Replaces only the homepage client grid. */
(function(){
  'use strict';
  if(window.__nasharClientShowcaseV2)return;
  window.__nasharClientShowcaseV2=true;

  const SECTION_ID='17b40cf';
  const GRID_ID='49884ea';
  const IS_EN=/^\/en(?:\/|$)/i.test(location.pathname||'/');
  const ASSET_BASE='/assets/clients/';
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
    {file:'client-16.png',name:'شعار تعقيب'},
    {file:'client-17.png',name:'حداد كريتال جدة'},
    {file:'client-18.png',name:'سلام 5G'}
  ].map(item=>({primary:ASSET_BASE+item.file,fallback:ASSET_BASE+item.file,name:item.name}));

  function addStyles(){
    if(document.getElementById('nashar-client-showcase-v2'))return;
    const style=document.createElement('style');
    style.id='nashar-client-showcase-v2';
    style.textContent=`
      [data-id="${GRID_ID}"]{background:#fff!important;position:relative!important;overflow:hidden!important}
      [data-id="${GRID_ID}"]>.e-con-inner{display:block!important;width:100%!important;max-width:1320px!important;margin:0 auto!important;padding:34px 24px 42px!important}
      .nashar-client-grid{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:18px!important;width:100%!important;align-items:stretch!important}
      .nashar-client-card{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;aspect-ratio:5/4!important;border:1px solid rgba(0,0,0,.055)!important;border-radius:14px!important;background:#f7f7f7!important;overflow:hidden!important;transition:transform .28s ease,box-shadow .28s ease!important;box-shadow:0 5px 18px rgba(0,0,0,.055)!important;padding:12px!important}
      .nashar-client-card:hover{transform:translateY(-3px) scale(1.025)!important;box-shadow:0 10px 28px rgba(0,0,0,.10)!important}
      .nashar-client-logo{display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important;margin:auto!important}
      .nashar-client-fallback{display:none!important;font-size:13px!important;font-weight:700!important;color:#555!important;text-align:center!important;padding:12px!important}
      .nashar-client-card.is-failed .nashar-client-logo{display:none!important}
      .nashar-client-card.is-failed .nashar-client-fallback{display:block!important}
      @media(max-width:1100px){.nashar-client-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
      @media(max-width:767px){
        [data-id="${GRID_ID}"]>.e-con-inner{padding:24px 14px 30px!important}
        .nashar-client-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
        .nashar-client-card{border-radius:10px!important;padding:8px!important;box-shadow:0 3px 12px rgba(0,0,0,.05)!important}
      }
      @media(max-width:390px){.nashar-client-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    `;
    (document.head||document.documentElement).appendChild(style);
  }

  function makeLogo(item,index){
    const card=document.createElement('div');
    card.className='nashar-client-card';

    const img=document.createElement('img');
    img.className='nashar-client-logo';
    img.src=item.primary;
    img.alt=(IS_EN?'Client logo ':'شعار عميل ')+(index+1);
    img.loading=index<8?'eager':'lazy';
    img.decoding='async';
    img.draggable=false;
    img.dataset.fallback=item.fallback;
    img.dataset.try='0';
    img.addEventListener('error',function(){
      if(this.dataset.try==='0'){
        this.dataset.try='1';
        this.src=this.dataset.fallback;
        return;
      }
      card.classList.add('is-failed');
    });
    img.addEventListener('load',function(){
      card.classList.remove('is-failed');
      this.style.setProperty('visibility','visible','important');
      this.style.setProperty('opacity','1','important');
    });

    const fallback=document.createElement('span');
    fallback.className='nashar-client-fallback';
    fallback.textContent=IS_EN?'Client '+(index+1):'شعار العميل '+(index+1);

    card.append(img,fallback);
    return card;
  }

  function buildGrid(){
    const gridSection=document.querySelector('[data-id="'+GRID_ID+'"]');
    if(!gridSection)return false;
    const inner=gridSection.querySelector(':scope > .e-con-inner')||gridSection;
    if(inner.dataset.nasharClientGrid==='2')return true;

    const grid=document.createElement('div');
    grid.className='nashar-client-grid';
    grid.setAttribute('aria-label',IS_EN?'Clients who trust us':'عملاء يثقون بنا');
    LOGOS.forEach((item,index)=>grid.appendChild(makeLogo(item,index)));

    inner.replaceChildren(grid);
    inner.dataset.nasharClientGrid='2';
    return true;
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

  function apply(){
    addStyles();
    patchHeading();
    buildGrid();
  }

  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  document.addEventListener('DOMContentLiteSpeedLoaded',apply);
  window.addEventListener('load',apply,{once:true});
  [100,500,1500].forEach(ms=>setTimeout(apply,ms));
})();
