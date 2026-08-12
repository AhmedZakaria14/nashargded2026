/* النشار جروب — legacy Adsela link firewall v2.
   Keeps cloned internal paths on this site and blocks all old Adsela/social outbound destinations. */
(function(){
  'use strict';
  if(window.__nasharLegacyLinkFirewallV2)return;
  window.__nasharLegacyLinkFirewallV2=true;

  const IS_EN=/^\/en(?:\/|$)/i.test(location.pathname||'/');
  const MESSAGE=IS_EN?'This page is not available yet':'الصفحة غير موجودة بعد';
  const OLD_EMAIL='info@adselams.com';
  const NEW_EMAIL='info@elnashargroup.com';
  const OLD_SITE=/^https?:\/\/(?:www\.)?adselams\.com(?:\/|$)/i;

  const SOCIAL_HOSTS=new Set([
    'facebook.com','www.facebook.com','instagram.com','www.instagram.com',
    'twitter.com','www.twitter.com','x.com','www.x.com',
    'linkedin.com','www.linkedin.com','youtube.com','www.youtube.com',
    'snapchat.com','www.snapchat.com'
  ]);

  function isAdselaSocialUrl(raw){
    if(!raw)return false;
    let u;
    try{u=new URL(raw,location.href)}catch(e){return false}
    const host=u.hostname.toLowerCase();
    const path=(u.pathname+u.search).toLowerCase();
    if(!SOCIAL_HOSTS.has(host))return false;
    return /adselams|67474127|uc1fkrvdblke-pa64zorefig/.test(path);
  }

  function isCopiedSocialSlot(a){
    return !!a.closest('.offcanvas__social,.elementor-social-icons-wrapper,footer .elementor-widget-social-icons,.footer__social');
  }

  function localizeOldSite(raw){
    try{const u=new URL(raw);return (u.pathname||'/')+u.search+u.hash}catch(e){return null}
  }

  function showUnavailable(){
    let toast=document.getElementById('nashar-unavailable-toast');
    if(!toast){
      toast=document.createElement('div');
      toast.id='nashar-unavailable-toast';
      toast.setAttribute('role','status');
      toast.setAttribute('aria-live','polite');
      toast.style.cssText='position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);z-index:2147483647;background:#171717;color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:12px 20px;font:600 14px/1.5 Arial,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.32);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;text-align:center;max-width:calc(100vw - 32px)';
      document.body.appendChild(toast);
    }
    toast.textContent=MESSAGE;
    toast.style.opacity='1';
    toast.style.transform='translate(-50%,0)';
    clearTimeout(window.__nasharUnavailableToastTimer);
    window.__nasharUnavailableToastTimer=setTimeout(()=>{
      toast.style.opacity='0';toast.style.transform='translate(-50%,20px)';
    },2200);
  }

  function disableAnchor(a){
    if(!a||a.tagName!=='A')return;
    a.setAttribute('href','#');
    a.removeAttribute('target');
    a.removeAttribute('rel');
    a.removeAttribute('data-scroll');
    a.removeAttribute('data-options');
    a.dataset.nasharUnavailable='1';
    a.setAttribute('aria-disabled','true');
  }

  function sanitizeAnchor(a){
    if(!a||a.tagName!=='A')return;
    const href=a.getAttribute('href')||'';
    if(!href)return;

    if(/^mailto:info@adselams\.com(?:\?|$)/i.test(href)){
      a.setAttribute('href','mailto:'+NEW_EMAIL);
      if((a.textContent||'').trim().toLowerCase()===OLD_EMAIL)a.textContent=NEW_EMAIL;
      a.removeAttribute('target');
      return;
    }

    if(OLD_SITE.test(href)){
      const local=localizeOldSite(href);
      if(local){
        a.setAttribute('href',local);
        a.removeAttribute('target');
        a.removeAttribute('rel');
        a.removeAttribute('data-scroll');
        a.removeAttribute('data-options');
      }else disableAnchor(a);
      return;
    }

    if(isAdselaSocialUrl(href)||isCopiedSocialSlot(a))disableAnchor(a);
  }

  function sanitizeForm(form){
    const action=form.getAttribute('action')||'';
    if(OLD_SITE.test(action)){
      const local=localizeOldSite(action);
      if(local)form.setAttribute('action',local);
      else{form.setAttribute('action','#');form.dataset.nasharUnavailable='1'}
    }
  }

  function sanitizeDataUrl(el,attr){
    const raw=el.getAttribute(attr)||'';
    if(!raw)return;
    if(OLD_SITE.test(raw)){
      const local=localizeOldSite(raw);
      if(local)el.setAttribute(attr,local);else el.removeAttribute(attr);
    }else if(isAdselaSocialUrl(raw))el.removeAttribute(attr);
  }

  function sanitizeHead(){
    if(!document.head)return;
    document.head.querySelectorAll('base[href]').forEach(b=>{if(/adselams\.com/i.test(b.getAttribute('href')||''))b.remove()});
    document.head.querySelectorAll('link[href]').forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(!OLD_SITE.test(href))return;
      const rel=(link.getAttribute('rel')||'').toLowerCase();
      if(rel.includes('stylesheet')||rel.includes('preload')||rel.includes('icon')){
        try{const u=new URL(href);link.setAttribute('href','/origin/'+u.pathname.replace(/^\//,'')+u.search)}catch(e){link.remove()}
        return;
      }
      if(rel.includes('alternate')&&link.hasAttribute('hreflang')){
        const lang=(link.getAttribute('hreflang')||'').toLowerCase();
        link.setAttribute('href',lang==='en'?location.origin+'/en/':location.origin+'/');
        return;
      }
      /* Old RSS, oEmbed and other discovery links must not advertise Adsela endpoints. */
      link.remove();
    });
    document.head.querySelectorAll('meta[content]').forEach(meta=>{
      const c=meta.getAttribute('content')||'';
      if(/facebook\.com\/adselams|instagram\.com\/adselams|twitter\.com\/adselams|x\.com\/.*adselams|linkedin\.com\/company\/67474127|youtube\.com\/channel\/UC1FkRVDblKE-pA64zOrEFIg/i.test(c))meta.remove();
    });
  }

  function sanitizeRoot(root){
    if(!root)return;
    const scope=root.querySelectorAll?root:document;
    scope.querySelectorAll('a[href]').forEach(sanitizeAnchor);
    scope.querySelectorAll('form[action]').forEach(sanitizeForm);
    scope.querySelectorAll('[data-url],[data-href]').forEach(el=>{
      if(el.hasAttribute('data-url'))sanitizeDataUrl(el,'data-url');
      if(el.hasAttribute('data-href'))sanitizeDataUrl(el,'data-href');
    });
    sanitizeHead();
  }

  document.addEventListener('click',function(e){
    const a=e.target&&e.target.closest?e.target.closest('a'):null;
    if(!a)return;
    const href=a.getAttribute('href')||'';
    if(a.dataset.nasharUnavailable==='1'||isAdselaSocialUrl(href)||isCopiedSocialSlot(a)){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showUnavailable();return;
    }
    if(OLD_SITE.test(href)){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const local=localizeOldSite(href);
      if(local)location.href=local;else showUnavailable();
    }
  },true);

  document.addEventListener('submit',function(e){
    const form=e.target;
    if(form&&form.dataset&&form.dataset.nasharUnavailable==='1'){
      e.preventDefault();e.stopPropagation();showUnavailable();
    }
  },true);

  function apply(){sanitizeRoot(document)}
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  document.addEventListener('DOMContentLiteSpeedLoaded',apply);
  window.addEventListener('load',apply,{once:true});
  [100,500,1500,3000].forEach(ms=>setTimeout(apply,ms));
})();
