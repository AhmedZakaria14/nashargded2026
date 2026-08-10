/* النشار جروب — lightweight brand authority. The cloned DOM is branded before first paint; this file only protects late mutations. */
(function(){
  'use strict';
  const BRAND='النشار جروب';
  const ALT='ELNASHARGROUP';
  const LOGO='/assets/elnashargroup-logo-v3.svg';
  const ICON='/assets/elnashargroup-icon-v3.svg';
  const SITE=location.origin;
  const OLD_TEXT=/(Adsela\s+Marketing\s+Solutions|Adsela|أدسيلا|ادسيلا|Nashar\s+Digital|نشار\s+ديجيتال)/gi;
  const OLD_DOMAIN=/(?:www\.)?(?:adselams\.com|nashar\.digital)/gi;
  const OLD_LOGO=/(adsela(?:[-_ ]?new)?[-_ ]?logo\d*|adsela[-_ ]?logo|logo[-_ ]?adsela|adsela-icon-footer\d*|cropped-fav-icon|logo-png-white-01)/i;
  const SKIP=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA']);

  function textBrand(v){
    if(!v||typeof v!=='string')return v;
    return v.replace(/[\w.+-]+@(?:adselams\.com|nashar\.digital)/gi,BRAND)
      .replace(OLD_TEXT,BRAND)
      .replace(/\bELNASHARGROUP\b/gi,BRAND)
      .replace(OLD_DOMAIN,BRAND);
  }
  function patchTextNode(node){
    if(!node||node.nodeType!==3)return;
    const p=node.parentElement;if(!p||SKIP.has(p.tagName))return;
    const next=textBrand(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;
  }
  function patchImg(img){
    if(!img||img.tagName!=='IMG')return;
    const raw=[img.getAttribute('src'),img.getAttribute('data-src'),img.getAttribute('srcset'),img.getAttribute('data-srcset'),img.getAttribute('alt')].filter(Boolean).join(' ');
    const slot=img.closest('.header__logo-2,.offcanvas__logo,.footer__logo,.footer__logo-2,.elnashar-brand,header .logo,footer .logo');
    if(!slot&&!OLD_LOGO.test(raw)&&!/elnashargroup-(?:logo|icon)-v3\.svg/i.test(raw))return;
    const icon=!slot&&/(icon-footer|cropped-fav|logo-adsela-half|elnashargroup-icon)/i.test(raw);
    img.src=icon?ICON:LOGO;
    img.alt=BRAND;
    ['srcset','data-src','data-srcset','data-lazy-src','data-lazy-srcset','data-original','data-sizes'].forEach(a=>img.removeAttribute(a));
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('height','auto','important');
  }
  function patchAttrs(el){
    if(!el||el.nodeType!==1)return;
    ['alt','title','aria-label','placeholder'].forEach(a=>{const v=el.getAttribute(a);if(v){const n=textBrand(v);if(n!==v)el.setAttribute(a,n)}});
    if(el.tagName==='IMG')patchImg(el);
    if(el.tagName==='A'){
      const href=el.getAttribute('href')||'';
      if(/^mailto:[^?]*@(adselams\.com|nashar\.digital)/i.test(href)){el.href='/contact-us/';el.removeAttribute('target');if(el.childElementCount===0)el.textContent='تواصل مع '+BRAND}
      else if(/^https?:\/\/adselams\.com\//i.test(href)){try{const u=new URL(href);el.setAttribute('href',u.pathname+u.search+u.hash)}catch(e){}}
    }
  }
  function patchSubtree(root){
    if(!root)return;
    if(root.nodeType===3){patchTextNode(root);return}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1)patchAttrs(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return p&&!SKIP.has(p.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    let n;while((n=walker.nextNode()))patchTextNode(n);
    root.querySelectorAll&&root.querySelectorAll('[alt],[title],[aria-label],[placeholder],img,a[href]').forEach(patchAttrs);
  }
  function meta(selector,kind,key,value){
    let m=document.querySelector(selector);if(!m){m=document.createElement('meta');m.setAttribute(kind,key);document.head.appendChild(m)}m.content=value;
  }
  function patchHead(){
    const path=location.pathname||'/';
    const home=path==='/'||path==='/home-v4.html'||path==='/index.html';
    let title=textBrand(document.title||'').trim();
    if(home||!title)title='النشار جروب | وكالة تسويق رقمي في السعودية والخليج';
    else if(!title.includes(BRAND))title+=' | '+BRAND;
    document.title=title;
    const desc=textBrand(document.querySelector('meta[name="description"]')?.content||'النشار جروب شريك نمو رقمي متكامل يقدم خدمات التسويق الرقمي والإعلانات وتحسين محركات البحث وتصميم المواقع في السعودية والخليج.');
    meta('meta[name="description"]','name','description',desc);
    meta('meta[property="og:title"]','property','og:title',title);
    meta('meta[property="og:description"]','property','og:description',desc);
    meta('meta[property="og:site_name"]','property','og:site_name',BRAND);
    meta('meta[property="og:url"]','property','og:url',SITE+path);
    meta('meta[name="twitter:title"]','name','twitter:title',title);
    meta('meta[name="twitter:description"]','name','twitter:description',desc);
    meta('meta[name="application-name"]','name','application-name',BRAND);
    meta('meta[name="apple-mobile-web-app-title"]','name','apple-mobile-web-app-title',BRAND);
    meta('meta[property="og:image"]','property','og:image',SITE+LOGO);
    meta('meta[name="twitter:image"]','name','twitter:image',SITE+LOGO);
    document.querySelectorAll('meta[name="twitter:site"],meta[name="twitter:creator"]').forEach(m=>{if(/adsela|adselams/i.test(m.content||''))m.remove()});
    let c=document.querySelector('link[rel="canonical"]');if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c)}c.href=SITE+path;
    document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(l=>{l.href=ICON;l.type='image/svg+xml'});
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{if(/Adsela|ادسيلا|أدسيلا|adselams\.com|nashar\.digital/i.test(s.textContent||''))s.remove()});
    let schema=document.querySelector('script[data-nashar-schema]');if(!schema){schema=document.createElement('script');schema.type='application/ld+json';schema.dataset.nasharSchema='1';document.head.appendChild(schema)}
    schema.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':SITE+'/#organization',name:BRAND,alternateName:ALT,url:SITE+'/',logo:{'@type':'ImageObject',url:SITE+LOGO}},{'@type':'WebSite','@id':SITE+'/#website',url:SITE+'/',name:BRAND,alternateName:ALT,publisher:{'@id':SITE+'/#organization'},inLanguage:'ar'},{'@type':'WebPage','@id':SITE+path+'#webpage',url:SITE+path,name:title,isPartOf:{'@id':SITE+'/#website'},about:{'@id':SITE+'/#organization'},inLanguage:'ar'}]});
  }
  function start(){
    patchSubtree(document.body);patchHead();
    const mo=new MutationObserver(records=>{
      for(const r of records){
        if(r.type==='characterData'){patchTextNode(r.target);continue}
        if(r.type==='attributes'){if(r.target.tagName==='IMG')patchImg(r.target);continue}
        r.addedNodes.forEach(patchSubtree);
      }
    });
    mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['src','data-src','srcset','data-srcset','alt']});
    window.addEventListener('load',patchHead,{once:true});
    document.addEventListener('DOMContentLiteSpeedLoaded',patchHead,{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
