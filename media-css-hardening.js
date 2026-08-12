/* Media CSS hardening v1 — recover image URLs embedded in style tags/CSS rules without touching motion styles. */
(function(){
  'use strict';
  if(window.__nasharMediaCssHardeningV1)return;
  window.__nasharMediaCssHardeningV1=true;

  const SOURCE='https://adselams.com/';
  const IMAGE_RE=/\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i;
  let scheduled=false;

  function sourceAbsolute(raw){
    if(!raw||typeof raw!=='string')return '';
    const value=raw.trim();
    if(!value||/^(?:data:|blob:|#|javascript:)/i.test(value)||value.startsWith('/api/media?'))return '';

    try{
      if(value.startsWith('/origin/'))return SOURCE+value.slice('/origin/'.length);
      if(value.startsWith('/wp-content/')||value.startsWith('/wp-includes/'))return SOURCE+value.replace(/^\//,'');
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
    const abs=sourceAbsolute(raw);
    if(!abs||!IMAGE_RE.test(abs))return raw;
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
          if(!/(?:background|mask|border-image|list-style|content|(?:^--)\S*(?:image|background))/i.test(prop))return;
          const value=rule.style.getPropertyValue(prop);
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

  function sweep(root){
    const scope=root&&root.querySelectorAll?root:document;
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
    [120,450,1000,2200,5000].forEach(function(ms){setTimeout(function(){sweep(document)},ms)});

    const mo=new MutationObserver(function(records){
      let needed=false;
      records.forEach(function(record){
        record.addedNodes.forEach(function(node){
          if(node.nodeType!==1)return;
          if(node.tagName==='STYLE'||node.tagName==='LINK'||node.querySelector?.('style,link[rel="stylesheet"]'))needed=true;
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
