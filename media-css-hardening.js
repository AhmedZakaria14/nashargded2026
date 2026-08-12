/* Media CSS hardening v3 — recover source images while permanently replacing every legacy Adsela brand mark. */
(function(){
  'use strict';
  if(window.__nasharMediaCssHardeningV3)return;
  window.__nasharMediaCssHardeningV3=true;

  const SOURCE='https://adselams.com/';
  const LOGO='/assets/elnashargroup-logo-v3.svg';
  const ICON='/assets/elnashargroup-icon-v3.svg';
  const IMAGE_RE=/\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i;
  const OLD_BRAND_ASSET=/(?:adsela|adselams)[^?#/]*(?:logo|icon|fav)|(?:logo|icon|fav)[^?#/]*(?:adsela|adsel)|logo[-_ ]?adsela[-_ ]?half|adsela[-_ ]?icon[-_ ]?footer|cropped[-_ ]?fav[-_ ]?icon|logo[-_ ]?png[-_ ]?white[-_ ]?01/i;
  let scheduled=false;

  function decoded(value){
    let out=String(value||'');
    for(let i=0;i<2;i++){
      try{const next=decodeURIComponent(out);if(next===out)break;out=next}catch(e){break}
    }
    return out;
  }

  function brandAsset(raw){
    const value=decoded(raw);
    if(!OLD_BRAND_ASSET.test(value))return '';
    return /icon|fav|half|footer/i.test(value)?ICON:LOGO;
  }

  function sourceAbsolute(raw){
    if(!raw||typeof raw!=='string')return '';
    const value=raw.trim();
    if(!value||/^(?:data:|blob:|#|javascript:)/i.test(value))return '';

    try{
      if(value.startsWith('/api/media?')){
        const u=new URL(value,location.origin);
        const direct=u.searchParams.get('u');
        if(direct)return direct;
        const path=u.searchParams.get('path');
        if(path)return SOURCE+path.replace(/^\/+/, '');
        return '';
      }
      if(value.startsWith('/origin/'))return SOURCE+value.slice('/origin/'.length);
      if(/^\/?(?:wp-content|wp-includes)\//i.test(value))return SOURCE+value.replace(/^\//,'');
      if(value.startsWith('//adselams.com/'))return 'https:'+value;
      if(/^https?:\/\/(?:www\.)?adselams\.com\//i.test(value))return value.replace(/^http:/i,'https:');

      if(value.startsWith(location.origin+'/origin/')){
        const u=new URL(value);
        return SOURCE+u.pathname.slice('/origin/'.length)+u.search;
      }
      if(value.startsWith(location.origin+'/wp-content/')||value.startsWith(location.origin+'/wp-includes/')){
        const u=new URL(value);
        return SOURCE+u.pathname.replace(/^\//,'')+u.search;
      }
    }catch(e){}
    return '';
  }

  function mediaUrl(raw){
    const branded=brandAsset(raw);
    if(branded)return branded;
    const abs=sourceAbsolute(raw);
    if(!abs||!IMAGE_RE.test(abs))return raw;
    const sourceBrand=brandAsset(abs);
    if(sourceBrand)return sourceBrand;
    return '/api/media?u='+encodeURIComponent(abs);
  }

  function rewriteUrls(value){
    if(!value||typeof value!=='string'||value.indexOf('url(')===-1)return value;
    return value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,function(all,q,url){
      const next=mediaUrl(url);
      return next===url?all:'url("'+next+'")';
    });
  }

  function patchStyleElement(style){
    if(!style||style.tagName!=='STYLE')return;
    const text=style.textContent||'';
    if(!/url\(/i.test(text))return;
    const next=rewriteUrls(text);
    if(next!==text)style.textContent=next;
  }

  function patchRule(rule){
    if(!rule)return;
    try{
      if(rule.style){
        Array.from(rule.style).forEach(function(prop){
          const value=rule.style.getPropertyValue(prop);
          if(!value||value.indexOf('url(')===-1)return;
          const next=rewriteUrls(value);
          if(next!==value)rule.style.setProperty(prop,next,rule.style.getPropertyPriority(prop));
        });
      }
      if(rule.cssRules)Array.from(rule.cssRules).forEach(patchRule);
    }catch(e){}
  }

  function patchStylesheets(){
    Array.from(document.styleSheets||[]).forEach(function(sheet){
      try{Array.from(sheet.cssRules||[]).forEach(patchRule)}catch(e){}
    });
  }

  function patchInlineBackgrounds(root){
    const scope=root&&root.querySelectorAll?root:document;
    const patch=function(el){
      if(!el||!el.getAttribute)return;
      const style=el.getAttribute('style');
      if(style&&/url\(/i.test(style)){
        const next=rewriteUrls(style);
        if(next!==style)el.setAttribute('style',next);
      }
      ['data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url'].forEach(function(attr){
        const value=el.getAttribute(attr);
        if(!value)return;
        const branded=brandAsset(value);
        if(branded)el.setAttribute(attr,branded);
      });
    };
    if(root&&root.nodeType===1)patch(root);
    scope.querySelectorAll&&scope.querySelectorAll('[style],[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url]').forEach(patch);
  }

  /* Source critical CSS hides backgrounds until Elementor marks parent containers loaded. */
  function releaseElementorBackgrounds(root){
    const scope=root&&root.querySelectorAll?root:document;
    if(root&&root.matches&&root.matches('.e-con.e-parent')&&!root.classList.contains('e-lazyloaded'))root.classList.add('e-lazyloaded');
    scope.querySelectorAll&&scope.querySelectorAll('.e-con.e-parent:not(.e-lazyloaded)').forEach(function(el){
      el.classList.add('e-lazyloaded');
    });
  }

  function sweep(root){
    const scope=root&&root.querySelectorAll?root:document;
    releaseElementorBackgrounds(root||document);
    patchInlineBackgrounds(root||document);
    if(root&&root.tagName==='STYLE')patchStyleElement(root);
    scope.querySelectorAll&&scope.querySelectorAll('style').forEach(patchStyleElement);
    patchStylesheets();
  }

  function queueSweep(root){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){
      scheduled=false;
      sweep(root||document);
    });
  }

  function start(){
    sweep(document);
    [80,220,500,1000,2200,5000,9000].forEach(function(ms){setTimeout(function(){sweep(document)},ms)});

    const mo=new MutationObserver(function(records){
      let needed=false;
      records.forEach(function(record){
        record.addedNodes.forEach(function(node){
          if(node.nodeType!==1)return;
          releaseElementorBackgrounds(node);
          patchInlineBackgrounds(node);
          if(node.tagName==='STYLE'||node.tagName==='LINK'||node.matches?.('.e-con.e-parent')||node.querySelector?.('style,link[rel="stylesheet"],.e-con.e-parent,[data-bg],[data-background-image]'))needed=true;
        });
      });
      if(needed)queueSweep(document);
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  document.addEventListener('DOMContentLiteSpeedLoaded',function(){queueSweep(document)});
  window.addEventListener('load',function(){queueSweep(document)},{once:true});
})();
