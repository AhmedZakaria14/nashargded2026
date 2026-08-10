/* Legacy compatibility shim. Branding is now owned exclusively by /brand-stability.js. */
(function(){
  'use strict';
  if(window.__nasharBrandStabilityRequested)return;
  if(document.querySelector('script[src^="/brand-stability.js"]')){window.__nasharBrandStabilityRequested=true;return}
  window.__nasharBrandStabilityRequested=true;
  const s=document.createElement('script');
  s.src='/brand-stability.js?v=1';
  s.defer=true;
  (document.head||document.documentElement).appendChild(s);
})();
