/* ELNASHARGROUP identity authority — removes visible legacy Adsela/Nashar branding without touching technical origin asset URLs. */
(function(){
  'use strict';
  const BRAND='ELNASHARGROUP';
  const LOGO='/assets/elnashargroup-logo-v3.svg';
  const SITE=location.origin;
  const HOME_TITLE='ELNASHARGROUP | وكالة تسويق رقمي في السعودية والخليج';
  const DEFAULT_DESC='ELNASHARGROUP شريك نمو رقمي متكامل يقدم خدمات التسويق الرقمي، الإعلانات، تحسين محركات البحث، تصميم وتطوير المواقع، التجارة الإلكترونية والهوية الإبداعية في السعودية والخليج.';
  const SKIP=new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','TEXTAREA']);

  function brandText(value){
    if(!value||typeof value!=='string') return value;
    return value
      .replace(/Adsela\s+Marketing\s+Solutions/gi,BRAND)
      .replace(/\bAdsela\b/gi,BRAND)
      .replace(/أدسيلا|ادسيلا/g,BRAND)
      .replace(/نشار\s+ديجيتال/g,BRAND)
      .replace(/Nashar\s+Digital/gi,BRAND);
  }

  function patchText(root){
    if(!root) return;
    if(root.nodeType===3){
      const p=root.parentElement;
      if(!p||SKIP.has(p.tagName)) return;
      const next=brandText(root.nodeValue);
      if(next!==root.nodeValue) root.nodeValue=next;
      return;
    }
    if(root.nodeType!==1 && root.nodeType!==9 && root.nodeType!==11) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const p=node.parentElement;
      return p&&!SKIP.has(p.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    let node;
    while((node=walker.nextNode())){
      const next=brandText(node.nodeValue);
      if(next!==node.nodeValue) node.nodeValue=next;
    }
  }

  function patchAttributes(root){
    const scope=root&&root.querySelectorAll?root:document;
    const els=[];
    if(root&&root.nodeType===1) els.push(root);
    els.push(...scope.querySelectorAll('[alt],[title],[aria-label],[placeholder]'));
    els.forEach(el=>['alt','title','aria-label','placeholder'].forEach(a=>{
      const v=el.getAttribute(a);if(!v)return;
      const n=brandText(v);if(n!==v)el.setAttribute(a,n);
    }));
  }

  function ensureMeta(selector,kind,key,value){
    let el=document.querySelector(selector);
    if(!el){el=document.createElement('meta');el.setAttribute(kind,key);document.head.appendChild(el)}
    if(el.getAttribute('content')!==value)el.setAttribute('content',value);
    return el;
  }

  function patchMeta(){
    let title=brandText(document.title||'').trim();
    if(!title)title=HOME_TITLE;
    if(!/ELNASHARGROUP/i.test(title))title=title+' | '+BRAND;
    document.title=title;

    let desc=document.querySelector('meta[name="description"]')?.getAttribute('content')||DEFAULT_DESC;
    desc=brandText(desc).trim()||DEFAULT_DESC;
    ensureMeta('meta[name="description"]','name','description',desc);
    ensureMeta('meta[property="og:title"]','property','og:title',title);
    ensureMeta('meta[property="og:description"]','property','og:description',desc);
    ensureMeta('meta[property="og:site_name"]','property','og:site_name',BRAND);
    ensureMeta('meta[property="og:url"]','property','og:url',SITE+location.pathname);
    ensureMeta('meta[name="twitter:title"]','name','twitter:title',title);
    ensureMeta('meta[name="twitter:description"]','name','twitter:description',desc);
    ensureMeta('meta[name="application-name"]','name','application-name',BRAND);
    ensureMeta('meta[name="apple-mobile-web-app-title"]','name','apple-mobile-web-app-title',BRAND);
    ensureMeta('meta[property="og:image"]','property','og:image',SITE+LOGO);
    ensureMeta('meta[name="twitter:image"]','name','twitter:image',SITE+LOGO);

    document.querySelectorAll('meta[name="twitter:site"],meta[name="twitter:creator"]').forEach(m=>{
      if(/adsela|adselams/i.test(m.getAttribute('content')||''))m.remove();
    });

    let canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}
    canonical.href=SITE+location.pathname;
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(l=>{
      const href=l.getAttribute('href')||'';
      if(/adselams\.com/i.test(href)){
        const lang=(l.getAttribute('hreflang')||'').toLowerCase();
        l.href=lang==='en'?SITE+'/en/':SITE+'/';
      }
    });
  }

  function patchLegacyLinks(){
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(/^https?:\/\/adselams\.com\//i.test(href)){
        try{const u=new URL(href);a.setAttribute('href',u.pathname+u.search+u.hash)}catch(e){}
        return;
      }
      if(/(?:facebook|instagram|twitter|x|linkedin|tiktok|youtube|snapchat)\.com\/[^"']*adsela/i.test(href)){
        a.setAttribute('href','/');a.removeAttribute('target');a.setAttribute('aria-label',BRAND);
      }
    });
  }

  function patchSchema(){
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{
      const raw=s.textContent||'';
      if(/Adsela|ادسيلا|أدسيلا|adselams\.com/i.test(raw))s.remove();
    });
    let s=document.querySelector('script[data-elnashar-schema]');
    const data={
      '@context':'https://schema.org',
      '@graph':[
        {'@type':'Organization','@id':SITE+'/#organization',name:BRAND,url:SITE+'/',logo:{'@type':'ImageObject',url:SITE+LOGO,contentUrl:SITE+LOGO,caption:BRAND}},
        {'@type':'WebSite','@id':SITE+'/#website',url:SITE+'/',name:BRAND,alternateName:BRAND,publisher:{'@id':SITE+'/#organization'},inLanguage:'ar'},
        {'@type':'WebPage','@id':SITE+location.pathname+'#webpage',url:SITE+location.pathname,name:document.title,isPartOf:{'@id':SITE+'/#website'},about:{'@id':SITE+'/#organization'},inLanguage:'ar'}
      ]
    };
    if(!s){s=document.createElement('script');s.type='application/ld+json';s.dataset.elnasharSchema='1';document.head.appendChild(s)}
    const next=JSON.stringify(data);if(s.textContent!==next)s.textContent=next;
  }

  function patchBrandImages(){
    document.querySelectorAll('.header__logo-2 img,.offcanvas__logo img,.footer__logo img,.footer__logo-2 img,.elnashar-brand img').forEach(img=>{
      if(img.getAttribute('src')!==LOGO)img.setAttribute('src',LOGO);
      img.setAttribute('alt',BRAND);
      ['srcset','data-src','data-srcset','data-lazy-src','data-lazy-srcset'].forEach(a=>img.removeAttribute(a));
    });
  }

  function patch(root){
    patchText(root||document);
    patchAttributes(root||document);
    patchLegacyLinks();
    patchBrandImages();
    patchMeta();
    patchSchema();
  }

  function start(){
    patch(document);
    let scheduled=false;
    const mo=new MutationObserver(ms=>{
      let relevant=false;
      ms.forEach(m=>{if(m.type==='characterData'||m.addedNodes.length)relevant=true});
      if(!relevant||scheduled)return;
      scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;patch(document)});
    });
    mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
    document.addEventListener('DOMContentLiteSpeedLoaded',()=>patch(document));
    window.addEventListener('load',()=>patch(document),{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
