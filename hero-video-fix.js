/* ELNASHARGROUP hero background video — preserve the original Elementor hero layout and responsive behavior. */
(function(){
  'use strict';
  if(window.__elnasharHeroVideoActive)return;
  window.__elnasharHeroVideoActive=true;

  const DESKTOP='https://res.cloudinary.com/dxvjqrb9l/video/upload/c_fill,g_center,h_1080,w_1920/f_mp4/q_auto/v1786352386/elnashargroup/hero-source-v2.mp4';
  const MOBILE='https://res.cloudinary.com/dxvjqrb9l/video/upload/c_fill,g_center,h_1920,w_1080/f_mp4/q_auto/v1786352386/elnashargroup/hero-source-v2.mp4';
  const TARGETS=[
    {id:'d9e9523',url:DESKTOP},
    {id:'ff703a9',url:MOBILE}
  ];
  let observer=null;
  let scheduled=false;

  function patchSettings(section,url){
    const raw=section.getAttribute('data-settings');
    if(!raw)return;
    try{
      const data=JSON.parse(raw);
      if(data.background_video_link!==url||data.background_video_start!==0||data.background_play_on_mobile!=='yes'){
        data.background_background='video';
        data.background_video_link=url;
        data.background_video_start=0;
        data.background_play_on_mobile='yes';
        section.setAttribute('data-settings',JSON.stringify(data));
      }
    }catch(e){}
  }

  function configureVideo(video,url){
    if(!video)return;
    video.autoplay=true;
    video.muted=true;
    video.defaultMuted=true;
    video.loop=true;
    video.playsInline=true;
    video.setAttribute('autoplay','');
    video.setAttribute('muted','');
    video.setAttribute('loop','');
    video.setAttribute('playsinline','');
    video.setAttribute('preload','auto');
    video.removeAttribute('controls');
    video.style.setProperty('position','absolute','important');
    video.style.setProperty('left','50%','important');
    video.style.setProperty('top','50%','important');
    video.style.setProperty('width','100%','important');
    video.style.setProperty('height','100%','important');
    video.style.setProperty('max-width','none','important');
    video.style.setProperty('object-fit','cover','important');
    video.style.setProperty('object-position','center center','important');
    video.style.setProperty('transform','translate(-50%,-50%)','important');
    if(video.getAttribute('src')!==url){
      video.querySelectorAll('source').forEach(s=>s.remove());
      video.setAttribute('src',url);
      try{video.load()}catch(e){}
    }
    const play=()=>{try{const p=video.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(e){}};
    if(video.readyState>=2)play();else video.addEventListener('canplay',play,{once:true});
  }

  function patchSection(id,url){
    const section=document.querySelector('.elementor-element-'+id+', [data-id="'+id+'"]');
    if(!section)return false;
    patchSettings(section,url);
    let container=section.querySelector('.elementor-background-video-container');
    if(!container){
      container=document.createElement('div');
      container.className='elementor-background-video-container';
      section.prepend(container);
    }
    container.style.setProperty('position','absolute','important');
    container.style.setProperty('inset','0','important');
    container.style.setProperty('overflow','hidden','important');
    container.style.setProperty('z-index','0','important');
    let video=container.querySelector('video');
    if(!video){
      video=document.createElement('video');
      video.className='elementor-background-video-hosted';
      container.appendChild(video);
    }
    configureVideo(video,url);
    section.dataset.elnasharHeroVideo='1';
    return true;
  }

  function sync(){
    TARGETS.forEach(t=>patchSection(t.id,t.url));
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;sync()});
  }

  function observe(){
    if(observer||!document.documentElement)return;
    observer=new MutationObserver(records=>{
      for(const r of records){
        const el=r.target&&r.target.nodeType===1?r.target:r.target?.parentElement;
        if(el&&(el.closest?.('[data-id="d9e9523"],[data-id="ff703a9"],.elementor-element-d9e9523,.elementor-element-ff703a9')||[...r.addedNodes||[]].some(n=>n.nodeType===1&&n.matches?.('[data-id="d9e9523"],[data-id="ff703a9"],.elementor-element-d9e9523,.elementor-element-ff703a9')))){
          schedule();
          break;
        }
      }
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data-settings','class']});
  }

  function start(){
    sync();
    observe();
    [100,350,900,1800,3500].forEach(t=>setTimeout(sync,t));
  }

  document.addEventListener('DOMContentLiteSpeedLoaded',sync);
  window.addEventListener('load',sync,{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
