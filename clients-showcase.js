/* النشار جروب — isolated client-logo showcase. Replaces only the homepage client grid. */
(function(){
  'use strict';
  if(window.__nasharClientShowcaseV1)return;
  window.__nasharClientShowcaseV1=true;

  const SECTION_ID='17b40cf';
  const GRID_ID='49884ea';
  const SPRITE='/assets/clients/clients-sprite.webp?v=1';
  const COUNT=17;
  const COLS=4;
  const ROWS=5;
  const IS_EN=/^\/en(?:\/|$)/i.test(location.pathname||'/');

  function addStyles(){
    if(document.getElementById('nashar-client-showcase-v1'))return;
    const style=document.createElement('style');
    style.id='nashar-client-showcase-v1';
    style.textContent=`
      [data-id="${GRID_ID}"]{background:#fff!important;position:relative!important;overflow:hidden!important}
      [data-id="${GRID_ID}"]>.e-con-inner{display:block!important;width:100%!important;max-width:1320px!important;margin:0 auto!important;padding:34px 24px 42px!important}
      .nashar-client-grid{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:18px!important;width:100%!important;align-items:stretch!important}
      .nashar-client-card{display:flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;aspect-ratio:5/4!important;border-radius:14px!important;background:#fff!important;overflow:hidden!important;transition:transform .28s ease,box-shadow .28s ease!important;box-shadow:0 5px 18px rgba(0,0,0,.055)!important}
      .nashar-client-card:hover{transform:translateY(-3px) scale(1.025)!important;box-shadow:0 10px 28px rgba(0,0,0,.10)!important}
      .nashar-client-mark{width:100%!important;height:100%!important;background-image:url("${SPRITE}")!important;background-repeat:no-repeat!important;background-size:400% 500%!important;background-color:transparent!important}
      @media(max-width:1100px){.nashar-client-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}}
      @media(max-width:767px){
        [data-id="${GRID_ID}"]>.e-con-inner{padding:24px 14px 30px!important}
        .nashar-client-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
        .nashar-client-card{border-radius:10px!important;box-shadow:0 3px 12px rgba(0,0,0,.05)!important}
      }
      @media(max-width:390px){.nashar-client-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    `;
    (document.head||document.documentElement).appendChild(style);
  }

  function pos(index){
    const col=index%COLS;
    const row=Math.floor(index/COLS);
    const x=COLS===1?0:(col/(COLS-1))*100;
    const y=ROWS===1?0:(row/(ROWS-1))*100;
    return x+'% '+y+'%';
  }

  function buildGrid(){
    const gridSection=document.querySelector('[data-id="'+GRID_ID+'"]');
    if(!gridSection)return false;
    const inner=gridSection.querySelector(':scope > .e-con-inner')||gridSection;
    if(inner.dataset.nasharClientGrid==='1')return true;

    const grid=document.createElement('div');
    grid.className='nashar-client-grid';
    grid.setAttribute('aria-label',IS_EN?'Clients who trust us':'عملاء يثقون بنا');

    for(let i=0;i<COUNT;i++){
      const card=document.createElement('div');
      card.className='nashar-client-card';
      card.setAttribute('role','img');
      card.setAttribute('aria-label',(IS_EN?'Client logo ':'شعار عميل ')+(i+1));
      const mark=document.createElement('span');
      mark.className='nashar-client-mark';
      mark.style.backgroundPosition=pos(i);
      card.appendChild(mark);
      grid.appendChild(card);
    }

    inner.replaceChildren(grid);
    inner.dataset.nasharClientGrid='1';
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
