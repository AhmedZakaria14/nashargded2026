/* النشار جروب — bilingual brand authority + permanent legacy-logo purge, isolated from motion/scroll updates. */
(function(){
  'use strict';
  if(window.__nasharBrandStabilityActiveV2)return;
  window.__nasharBrandStabilityActiveV2=true;
  window.__nasharBrandStabilityRequested=true;

  const IS_EN=/^\/en(?:\/|$)/i.test(location.pathname||'/');
  const AR_BRAND='النشار جروب';
  const EN_BRAND='ELNASHARGROUP';
  const BRAND=IS_EN?EN_BRAND:AR_BRAND;
  const ALT=IS_EN?AR_BRAND:EN_BRAND;
  const LOGO='/assets/elnashargroup-logo-v3.svg';
  const ICON='/assets/elnashargroup-icon-v3.svg';
  const SITE=location.origin;
  const OLD_TEXT=/(Adsela\s+Marketing\s+Solutions|Adsela\s+Digital\s+Marketing\s+Solutions|Adsela|ADSELA|أدسيلا|ادسيلا|Nashar\s+Digital|نشار\s+ديجيتال)/gi;
  const OLD_DOMAIN=/(?:www\.)?(?:adselams\.com|nashar\.digital)/gi;
  const OLD_LOGO=/(?:adsela|adselams)[^?#/]*(?:logo|icon|fav)|(?:logo|icon|fav)[^?#/]*(?:adsela|adsel)|logo[-_ ]?adsela[-_ ]?half|adsela[-_ ]?icon[-_ ]?footer|cropped[-_ ]?fav[-_ ]?icon|logo[-_ ]?png[-_ ]?white[-_ ]?01/i;
  const SKIP=new Set(['SCRIPT','NOSCRIPT','CODE','PRE','TEXTAREA']);
  let observer=null;
  let cssScheduled=false;

  function decodeLoose(v){
    let out=String(v||'');
    for(let i=0;i<2;i++){
      try{const next=decodeURIComponent(out);if(next===out)break;out=next}catch(e){break}
    }
    return out;
  }

  function oldLogoTarget(raw,forceFull){
    const value=decodeLoose(raw);
    if(!OLD_LOGO.test(value))return '';
    if(forceFull)return LOGO;
    return /icon|fav|half|footer/i.test(value)?ICON:LOGO;
  }

  function textBrand(v){
    if(!v||typeof v!=='string')return v;
    let out=v.replace(/[\w.+-]+@(?:adselams\.com|nashar\.digital)/gi,BRAND)
      .replace(OLD_TEXT,BRAND)
      .replace(OLD_DOMAIN,BRAND);
    if(IS_EN)out=out.replace(/النشار\s+جروب/g,EN_BRAND);
    else out=out.replace(/\bELNASHARGROUP\b/gi,AR_BRAND);
    if(IS_EN){
      out=out.replace(/كن على تواصل معنا/g,'Get in touch')
        .replace(/الرياض\s*-\s*الممكلة العربية السعودية/g,'Riyadh - Saudi Arabia')
        .replace(/تواصل مع\s*ELNASHARGROUP/g,'Contact '+EN_BRAND);
    }
    return out;
  }

  function patchTextNode(node){
    if(!node||node.nodeType!==3)return;
    const p=node.parentElement;if(!p||SKIP.has(p.tagName))return;
    const raw=node.nodeValue||'';
    if(!/Adsela|ADSELA|أدسيلا|ادسيلا|Nashar\s+Digital|نشار\s+ديجيتال|ELNASHARGROUP|النشار\s+جروب|adselams\.com|nashar\.digital|كن على تواصل معنا|الممكلة العربية السعودية/i.test(raw))return;
    const next=textBrand(raw);if(next!==raw)node.nodeValue=next;
  }

  function brandSlot(el){
    return !!el?.closest?.('.header__logo-2,.offcanvas__logo,.footer__logo,.footer__logo-2,.elnashar-brand,header .logo,footer .logo,.site-header .brand');
  }

  function patchImg(img){
    if(!img||img.tagName!=='IMG')return;
    const raw=['src','data-src','data-lazy-src','data-original','data-lazyload','srcset','data-srcset','data-lazy-srcset','alt','title']
      .map(a=>img.getAttribute(a)).filter(Boolean).join(' ');
    const slot=brandSlot(img);
    const oldTarget=oldLogoTarget(raw,slot);
    if(!slot&&!oldTarget&&!/elnashargroup-(?:logo|icon)-v3\.svg/i.test(raw))return;
    const target=slot?LOGO:(oldTarget||(/elnashargroup-icon/i.test(raw)?ICON:LOGO));
    if(img.getAttribute('src')!==target)img.setAttribute('src',target);
    if(img.getAttribute('alt')!==BRAND)img.setAttribute('alt',BRAND);
    ['srcset','data-src','data-srcset','data-lazy-src','data-lazy-srcset','data-original','data-lazyload','data-sizes'].forEach(a=>img.removeAttribute(a));
    img.dataset.elnasharBrand=target===ICON?'icon':'logo';
    img.style.setProperty('visibility','visible','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center','important');
    img.style.setProperty('height','auto','important');
  }

  function patchSource(source){
    if(!source||source.tagName!=='SOURCE')return;
    const raw=['src','srcset','data-src','data-srcset','data-lazy-src','data-lazy-srcset'].map(a=>source.getAttribute(a)).filter(Boolean).join(' ');
    const slot=brandSlot(source);
    const target=slot?LOGO:oldLogoTarget(raw,false);
    if(!target)return;
    source.setAttribute('srcset',target);
    ['src','data-src','data-srcset','data-lazy-src','data-lazy-srcset'].forEach(a=>source.removeAttribute(a));
  }

  function patchSvgImage(el){
    if(!el||String(el.tagName).toLowerCase()!=='image')return;
    const href=el.getAttribute('href')||el.getAttribute('xlink:href')||'';
    const target=oldLogoTarget(href,brandSlot(el));
    if(!target)return;
    el.setAttribute('href',target);
    el.removeAttribute('xlink:href');
  }

  function rewriteBrandUrls(value){
    if(!value||typeof value!=='string'||value.indexOf('url(')===-1)return value;
    return value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(all,q,url)=>{
      const target=oldLogoTarget(url,false);
      return target?'url("'+target+'")':all;
    });
  }

  function patchBrandMediaAttrs(el){
    if(!el||!el.getAttribute)return;
    ['data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url','poster','data-poster'].forEach(attr=>{
      const value=el.getAttribute(attr);
      if(!value)return;
      const target=oldLogoTarget(value,false);
      if(target)el.setAttribute(attr,target);
    });
    const style=el.getAttribute('style');
    if(style&&/url\(/i.test(style)){
      const fixed=rewriteBrandUrls(style);
      if(fixed!==style)el.setAttribute('style',fixed);
    }
  }

  function patchStyleElement(style){
    if(!style||style.tagName!=='STYLE')return;
    const text=style.textContent||'';
    if(!/url\(/i.test(text))return;
    const fixed=rewriteBrandUrls(text);
    if(fixed!==text)style.textContent=fixed;
  }

  function patchCssRule(rule){
    if(!rule)return;
    try{
      if(rule.style){
        Array.from(rule.style).forEach(prop=>{
          const value=rule.style.getPropertyValue(prop);
          if(!value||value.indexOf('url(')===-1)return;
          const fixed=rewriteBrandUrls(value);
          if(fixed!==value)rule.style.setProperty(prop,fixed,rule.style.getPropertyPriority(prop));
        });
      }
      if(rule.cssRules)Array.from(rule.cssRules).forEach(patchCssRule);
    }catch(e){}
  }

  function patchBrandCss(){
    document.querySelectorAll('style').forEach(patchStyleElement);
    document.querySelectorAll('[style],[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url]').forEach(patchBrandMediaAttrs);
    Array.from(document.styleSheets||[]).forEach(sheet=>{
      try{Array.from(sheet.cssRules||[]).forEach(patchCssRule)}catch(e){}
    });
  }

  function queueBrandCss(){
    if(cssScheduled)return;
    cssScheduled=true;
    requestAnimationFrame(()=>{cssScheduled=false;patchBrandCss()});
  }

  function isLanguageAnchor(el){
    if(!el||el.tagName!=='A')return false;
    const li=el.closest('li');
    const cls=((el.className||'')+' '+(li?.className||'')).toLowerCase();
    const text=(el.textContent||'').trim().toLowerCase();
    const aria=(el.getAttribute('aria-label')||'').toLowerCase();
    return /wpml-ls|menu-item-wpml/.test(cls)||text==='english'||text==='العربية'||/switch.*english|switch.*arabic|التبديل إلى/.test(aria);
  }

  function patchLanguageAnchor(el){
    if(!isLanguageAnchor(el))return false;
    const target=IS_EN?'/':'/en/';
    const label=IS_EN?'العربية':'English';
    const lang=IS_EN?'ar':'en';
    const aria=IS_EN?'التبديل إلى العربية':'Switch to English';
    if(el.getAttribute('href')!==target)el.setAttribute('href',target);
    if(el.hasAttribute('target'))el.removeAttribute('target');
    if(el.getAttribute('hreflang')!==lang)el.setAttribute('hreflang',lang);
    if(el.getAttribute('lang')!==lang)el.setAttribute('lang',lang);
    if(el.getAttribute('aria-label')!==aria)el.setAttribute('aria-label',aria);
    const native=el.querySelector('.wpml-ls-native');
    if(native){
      if(native.textContent!==label)native.textContent=label;
      if(native.getAttribute('lang')!==lang)native.setAttribute('lang',lang);
    }else if(el.childElementCount===0&&el.textContent!==label)el.textContent=label;
    if(el.dataset.nasharLanguageSwitch!=='1')el.dataset.nasharLanguageSwitch='1';
    return true;
  }

  function patchAttrs(el){
    if(!el||el.nodeType!==1)return;
    ['alt','title','aria-label','placeholder'].forEach(a=>{const v=el.getAttribute(a);if(v){const n=textBrand(v);if(n!==v)el.setAttribute(a,n)}});
    patchBrandMediaAttrs(el);
    if(el.tagName==='IMG')patchImg(el);
    else if(el.tagName==='SOURCE')patchSource(el);
    else if(String(el.tagName).toLowerCase()==='image')patchSvgImage(el);
    else if(el.tagName==='STYLE')patchStyleElement(el);
    if(el.tagName==='A'){
      if(patchLanguageAnchor(el))return;
      const href=el.getAttribute('href')||'';
      if(/^mailto:[^?]*@(adselams\.com|nashar\.digital)/i.test(href)){
        el.setAttribute('href','/contact-us/');el.removeAttribute('target');
        if(el.childElementCount===0)el.textContent=IS_EN?'Contact '+EN_BRAND:'تواصل مع '+AR_BRAND;
      }else if(/^https?:\/\/adselams\.com\//i.test(href)){
        try{const u=new URL(href);el.setAttribute('href',u.pathname+u.search+u.hash)}catch(e){}
      }
    }
  }

  function patchSubtree(root){
    if(!root)return;
    if(root.nodeType===3){patchTextNode(root);return}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1)patchAttrs(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return p&&!SKIP.has(p.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    let n;while((n=walker.nextNode()))patchTextNode(n);
    root.querySelectorAll&&root.querySelectorAll('[alt],[title],[aria-label],[placeholder],img,source,image,a[href],[style],[data-bg],[data-bg-hidpi],[data-background-image],[data-dce-background-image-url],[data-dce-background-overlay-image-url],style').forEach(patchAttrs);
  }

  function meta(selector,kind,key,value){
    if(!document.head)return null;
    let m=document.querySelector(selector);
    if(!m){m=document.createElement('meta');m.setAttribute(kind,key);document.head.appendChild(m)}
    if(m.getAttribute('content')!==value)m.setAttribute('content',value);
    return m;
  }

  function upsertAlternate(lang,href){
    let l=document.querySelector('link[rel="alternate"][hreflang="'+lang+'"]');
    if(!l){l=document.createElement('link');l.rel='alternate';l.setAttribute('hreflang',lang);document.head.appendChild(l)}
    if(l.href!==href)l.href=href;
  }

  function patchHead(){
    if(!document.head)return;
    const path=location.pathname||'/';
    const arHome=path==='/'||path==='/home-v4.html'||path==='/index.html';
    const enHome=path==='/en'||path==='/en/';
    document.documentElement.lang=IS_EN?'en':'ar';
    document.documentElement.dir=IS_EN?'ltr':'rtl';

    let title=textBrand(document.title||'').trim();
    if(IS_EN&&enHome)title='ELNASHARGROUP | Digital Marketing Agency in Saudi Arabia & GCC';
    else if(!IS_EN&&arHome)title='النشار جروب | وكالة تسويق رقمي في السعودية والخليج';
    else if(!title)title=BRAND;
    else if(!title.toLowerCase().includes(BRAND.toLowerCase()))title+=' | '+BRAND;
    document.title=title;

    const fallbackDesc=IS_EN
      ?'ELNASHARGROUP is an integrated digital growth partner providing digital marketing, paid advertising, SEO, website development, e-commerce and creative services across Saudi Arabia and the GCC.'
      :'النشار جروب شريك نمو رقمي متكامل يقدم خدمات التسويق الرقمي والإعلانات وتحسين محركات البحث وتصميم المواقع في السعودية والخليج.';
    const desc=textBrand(document.querySelector('meta[name="description"]')?.getAttribute('content')||fallbackDesc);
    meta('meta[name="description"]','name','description',desc);
    meta('meta[property="og:title"]','property','og:title',title);
    meta('meta[property="og:description"]','property','og:description',desc);
    meta('meta[property="og:site_name"]','property','og:site_name',BRAND);
    meta('meta[property="og:url"]','property','og:url',SITE+path);
    meta('meta[property="og:locale"]','property','og:locale',IS_EN?'en_US':'ar_AR');
    meta('meta[name="twitter:title"]','name','twitter:title',title);
    meta('meta[name="twitter:description"]','name','twitter:description',desc);
    meta('meta[name="application-name"]','name','application-name',BRAND);
    meta('meta[name="apple-mobile-web-app-title"]','name','apple-mobile-web-app-title',BRAND);
    meta('meta[property="og:image"]','property','og:image',SITE+LOGO);
    meta('meta[name="twitter:image"]','name','twitter:image',SITE+LOGO);
    document.querySelectorAll('meta[name="twitter:site"],meta[name="twitter:creator"]').forEach(m=>{if(/adsela|adselams/i.test(m.getAttribute('content')||''))m.remove()});

    let c=document.querySelector('link[rel="canonical"]');
    if(!c){c=document.createElement('link');c.rel='canonical';document.head.appendChild(c)}
    c.href=SITE+path;
    upsertAlternate('ar',SITE+'/');
    upsertAlternate('en',SITE+'/en/');
    upsertAlternate('x-default',SITE+'/');

    document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]').forEach(l=>{l.href=ICON;l.type='image/svg+xml'});
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{if(!s.dataset.nasharSchema&&/Adsela|ادسيلا|أدسيلا|adselams\.com|nashar\.digital/i.test(s.textContent||''))s.remove()});
    let schema=document.querySelector('script[data-nashar-schema]');
    if(!schema){schema=document.createElement('script');schema.type='application/ld+json';schema.dataset.nasharSchema='1';document.head.appendChild(schema)}
    schema.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':SITE+'/#organization',name:IS_EN?EN_BRAND:AR_BRAND,alternateName:IS_EN?AR_BRAND:EN_BRAND,url:SITE+'/',logo:{'@type':'ImageObject',url:SITE+LOGO,contentUrl:SITE+LOGO,caption:BRAND}},{'@type':'WebSite','@id':SITE+'/#website',url:SITE+'/',name:IS_EN?EN_BRAND:AR_BRAND,alternateName:IS_EN?AR_BRAND:EN_BRAND,publisher:{'@id':SITE+'/#organization'},inLanguage:IS_EN?'en':'ar'},{'@type':'WebPage','@id':SITE+path+'#webpage',url:SITE+path,name:title,isPartOf:{'@id':SITE+'/#website'},about:{'@id':SITE+'/#organization'},inLanguage:IS_EN?'en':'ar'}]});
    patchBrandCss();
  }

  function enforceLanguageLinks(){
    document.querySelectorAll('a[href],a.wpml-ls-link').forEach(a=>patchLanguageAnchor(a));
  }

  function observe(target){
    if(observer||!target)return;
    observer=new MutationObserver(records=>{
      let cssNeeded=false;
      for(const r of records){
        if(r.type==='attributes'){
          patchAttrs(r.target);
          continue;
        }
        r.addedNodes.forEach(node=>{
          patchSubtree(node);
          if(node.nodeType===1&&(node.tagName==='STYLE'||node.tagName==='LINK'||node.querySelector?.('style,link[rel="stylesheet"],[data-bg],[data-background-image]')))cssNeeded=true;
        });
      }
      if(cssNeeded)queueBrandCss();
    });
    observer.observe(target,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-src','data-lazy-src','data-original','data-lazyload','srcset','data-srcset','data-lazy-srcset','alt','href','data-bg','data-bg-hidpi','data-background-image','data-dce-background-image-url','data-dce-background-overlay-image-url']});
  }

  function start(){
    patchHead();
    if(document.body){patchSubtree(document.body);enforceLanguageLinks();observe(document.body)}
    else{
      observe(document.documentElement);
      document.addEventListener('DOMContentLoaded',()=>{patchSubtree(document.body);enforceLanguageLinks();patchHead()},{once:true});
    }
    [100,500,1500,4000,9000].forEach(ms=>setTimeout(()=>{patchBrandCss();patchSubtree(document.body)},ms));
    window.addEventListener('load',()=>{patchHead();enforceLanguageLinks();patchBrandCss()},{once:true});
    document.addEventListener('DOMContentLiteSpeedLoaded',()=>{patchHead();enforceLanguageLinks();patchSubtree(document.body);patchBrandCss()});
  }

  start();
})();
