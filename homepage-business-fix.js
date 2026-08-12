/* النشار جروب — isolated homepage business updates v2.
   Scope: portfolio, off-canvas/footer contacts, Learn With Us thumbnails, menu logo, and the former PDF lead section only. */
(function(){
  'use strict';
  if(window.__nasharHomepageBusinessFixV2)return;
  window.__nasharHomepageBusinessFixV2=true;

  const PHONE_DISPLAY='+20 10 10742430';
  const PHONE_TEL='+201010742430';
  const WHATSAPP='201010742430';
  const FOOTER_EMAIL='info@elnashargroup.com';
  const PORTFOLIO_IMAGE='/assets/portfolio/elnashargroup-mandoubzain-mockup.png';
  const PDF_SECTION_ID='c0be706';
  const LEARN_TITLES=new Set([
    'لوحة مؤشرات الأداء: كيف تتابع جميع بيانات التسويق في مكان واحد؟',
    'ما هو التسويق عن طريق محركات البحث؟',
    '15 فكرة من افكار تسويقية لجذب العملاء الجدد'
  ]);
  let stylesReady=false;

  function addStyles(){
    if(stylesReady||document.getElementById('nashar-home-business-v2'))return;
    stylesReady=true;
    const style=document.createElement('style');
    style.id='nashar-home-business-v2';
    style.textContent=`
      /* Portfolio: keep the source composition but make the single retained project fill its available area. */
      .portfolio__list-1[data-nashar-single-work="1"] .portfolio__item{margin-left:auto!important;margin-right:auto!important}
      .portfolio__list-1[data-nashar-single-work="1"] .portfolio__item>a:not([href]){cursor:default!important;pointer-events:none!important}
      .portfolio__list-1[data-nashar-single-work="1"] .portfolio__item img[data-nashar-featured-work="1"]{
        display:block!important;visibility:visible!important;opacity:1!important;width:100%!important;height:auto!important;object-fit:contain!important;object-position:center!important
      }

      /* Learn With Us: selected posts must never reveal the legacy Adsela thumbnails. */
      .blog__item-2[data-nashar-hide-thumb="1"] .blog__img-wrapper{display:none!important}

      /* The dotted/off-canvas menu must not show the legacy Adsela logo. */
      .offcanvas__area .offcanvas__logo{display:none!important}

      /* Service-request replacement for the old PDF section. */
      [data-id="${PDF_SECTION_ID}"].nashar-request-section{background:#0b0b0b!important;color:#fff!important;padding:72px 0!important;overflow:hidden!important}
      [data-id="${PDF_SECTION_ID}"].nashar-request-section>.e-con-inner{width:min(1180px,calc(100% - 40px))!important;max-width:1180px!important;margin:0 auto!important;padding:0!important;display:block!important}
      .nashar-request-wrap{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:58px;align-items:center;direction:rtl}
      .nashar-request-copy{min-width:0}
      .nashar-request-kicker{display:inline-flex;align-items:center;gap:9px;margin-bottom:18px;color:#b9ff56;font-size:13px;font-weight:700}
      .nashar-request-kicker:before{content:"";width:26px;height:1px;background:currentColor}
      .nashar-request-copy h2{margin:0 0 18px;color:#fff;font-size:clamp(34px,4.5vw,66px);line-height:1.18;font-weight:700;letter-spacing:-.025em}
      .nashar-request-copy p{margin:0;color:#b9c0bb;font-size:15px;line-height:2;max-width:590px}
      .nashar-request-card{background:#fff;color:#111;border-radius:26px;padding:30px;box-shadow:0 25px 70px rgba(0,0,0,.22)}
      .nashar-request-form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .nashar-request-field{display:flex;flex-direction:column;gap:8px;min-width:0}
      .nashar-request-field.full{grid-column:1/-1}
      .nashar-request-field label{font-size:12px;font-weight:700;color:#282828}
      .nashar-request-field input,.nashar-request-field select,.nashar-request-field textarea{width:100%;min-width:0;border:1px solid #dedede;background:#fafafa;color:#111;border-radius:12px;padding:13px 14px;outline:none;transition:border-color .2s,box-shadow .2s}
      .nashar-request-field input:focus,.nashar-request-field select:focus,.nashar-request-field textarea:focus{border-color:#7f3fd0;box-shadow:0 0 0 3px rgba(127,63,208,.10)}
      .nashar-request-field textarea{min-height:105px;resize:vertical}
      .nashar-request-submit{grid-column:1/-1;border:0;border-radius:999px;padding:15px 22px;background:#6d32aa;color:#fff;font-weight:800;cursor:pointer;transition:transform .2s,filter .2s}
      .nashar-request-submit:hover{transform:translateY(-1px);filter:brightness(1.06)}
      .nashar-request-note{grid-column:1/-1;margin:0;text-align:center;color:#777;font-size:11px;line-height:1.7}
      @media(max-width:767px){
        [data-id="${PDF_SECTION_ID}"].nashar-request-section{padding:52px 0!important}
        [data-id="${PDF_SECTION_ID}"].nashar-request-section>.e-con-inner{width:min(100% - 28px,1180px)!important}
        .nashar-request-wrap{grid-template-columns:1fr;gap:28px}
        .nashar-request-copy h2{font-size:clamp(32px,9vw,46px)}
        .nashar-request-card{padding:22px 16px;border-radius:20px}
        .nashar-request-form{grid-template-columns:1fr}
        .nashar-request-field,.nashar-request-field.full,.nashar-request-submit,.nashar-request-note{grid-column:1/-1}
      }
    `;
    (document.head||document.documentElement).appendChild(style);
  }

  function patchPortfolio(){
    const lists=Array.from(document.querySelectorAll('.portfolio__area .portfolio__list-1'));
    if(!lists.length)return false;
    lists.forEach(list=>{
      const items=Array.from(list.querySelectorAll(':scope > .portfolio__item'));
      if(!items.length)return;
      items.slice(1).forEach(item=>item.remove());
      const first=items[0];
      list.dataset.nasharSingleWork='1';
      first.dataset.nasharFeaturedWork='mandoub-zain-5g';

      const link=first.querySelector('a');
      if(link){
        link.removeAttribute('href');
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.removeAttribute('data-scroll');
        link.removeAttribute('data-options');
      }

      const img=first.querySelector('img');
      if(img){
        img.setAttribute('src',PORTFOLIO_IMAGE);
        img.setAttribute('alt','مشروع موقع مندوب زين 5G');
        img.setAttribute('title','مندوب زين 5G');
        img.setAttribute('loading','eager');
        img.setAttribute('decoding','async');
        ['srcset','sizes','data-src','data-srcset','data-lazy-src','data-lazy-srcset','data-original','data-sizes'].forEach(a=>img.removeAttribute(a));
        img.dataset.nasharFeaturedWork='1';
      }
      const title=first.querySelector('.portfolio__info .portfolio__title');
      if(title)title.textContent='مندوب زين 5G';
      const meta=first.querySelector('.portfolio__info p');
      if(meta)meta.textContent='تصميم وتطوير موقع';
    });
    return true;
  }

  function setContactAnchorText(a,text){
    const textTarget=a.querySelector('.elementor-icon-list-text');
    if(textTarget){textTarget.textContent=text;return}
    if(!a.querySelector('svg,i,img')){a.textContent=text;return}
    const textNodes=[];
    const walker=document.createTreeWalker(a,NodeFilter.SHOW_TEXT);
    let n;while((n=walker.nextNode()))if((n.nodeValue||'').trim())textNodes.push(n);
    if(textNodes.length)textNodes[textNodes.length-1].nodeValue=text;
  }

  function patchMenuPhone(){
    const scopes=document.querySelectorAll('.offcanvas__area,.offcanvas__contact');
    if(!scopes.length)return false;
    scopes.forEach(scope=>{
      scope.querySelectorAll('a[href^="tel:"]').forEach(a=>{
        a.setAttribute('href','tel:'+PHONE_TEL);
        setContactAnchorText(a,PHONE_DISPLAY);
      });
      scope.querySelectorAll('.offcanvas__contact li').forEach(li=>{
        if(/00966581471796|966581471796\+?|\+?966\s*58\s*147\s*1796/.test(li.textContent||'')){
          const a=li.querySelector('a')||li;
          if(a.tagName==='A')a.setAttribute('href','tel:'+PHONE_TEL);
          const span=li.querySelector('.elementor-icon-list-text');
          if(span)span.textContent=PHONE_DISPLAY;
          else if(a.tagName==='A')a.textContent=PHONE_DISPLAY;
        }
      });
    });
    return true;
  }

  function hideSelectedLearnThumbnails(){
    let changed=false;
    document.querySelectorAll('.blog__area-2 .blog__item-2').forEach(card=>{
      const titleLink=card.querySelector('a.blog__title-2');
      const title=(titleLink?.textContent||'').replace(/\s+/g,' ').trim();
      if(!LEARN_TITLES.has(title))return;
      card.dataset.nasharHideThumb='1';
      const wrapper=card.querySelector('.blog__img-wrapper');
      if(wrapper){wrapper.remove();changed=true}
    });
    return changed;
  }

  function patchFooterContacts(){
    const footer=document.querySelector('footer');
    if(!footer)return false;

    footer.querySelectorAll('a[href^="mailto:"]').forEach(a=>{
      a.setAttribute('href','mailto:'+FOOTER_EMAIL);
      setContactAnchorText(a,FOOTER_EMAIL);
    });
    footer.querySelectorAll('a[href^="tel:"]').forEach(a=>{
      a.setAttribute('href','tel:'+PHONE_TEL);
      setContactAnchorText(a,PHONE_DISPLAY);
    });

    footer.querySelectorAll('.elementor-icon-list-text').forEach(span=>{
      const text=(span.textContent||'').trim();
      if(/info@(adsela|adselams)\.com/i.test(text))span.textContent=FOOTER_EMAIL;
      if(/00966581471796|966581471796\+?|\+?966\s*58\s*147\s*1796/.test(text))span.textContent=PHONE_DISPLAY;
    });
    return true;
  }

  function removeOffcanvasLogo(){
    const logos=document.querySelectorAll('.offcanvas__area .offcanvas__logo');
    logos.forEach(logo=>logo.remove());
    return logos.length>0;
  }

  function serviceOptions(){
    return [
      'تحسين محركات البحث SEO وGEO',
      'إدارة الحملات الإعلانية المدفوعة',
      'تصميم وتطوير المواقع',
      'إدارة حسابات التواصل الاجتماعي',
      'حلول التجارة الإلكترونية',
      'تصميم جرافيك وهوية بصرية',
      'موشن جرافيك',
      'تصميم تطبيقات الجوال',
      'التسويق عبر المؤثرين',
      'استشارة تسويقية',
      'خدمة أخرى'
    ];
  }

  function replacePdfSection(){
    const section=document.querySelector('[data-id="'+PDF_SECTION_ID+'"]');
    if(!section)return false;
    const inner=section.querySelector(':scope > .e-con-inner')||section;
    if(inner.dataset.nasharServiceRequest==='1')return true;

    section.classList.add('nashar-request-section');
    section.classList.add('e-lazyloaded');
    const options=serviceOptions().map(v=>'<option value="'+v+'">'+v+'</option>').join('');
    inner.innerHTML=`
      <div class="nashar-request-wrap">
        <div class="nashar-request-copy">
          <span class="nashar-request-kicker">طلب خدمة</span>
          <h2>ابدأ طلب خدمتك مع النشار جروب</h2>
          <p>أرسل لنا بياناتك والخدمة التي تحتاجها، وسيتم تحويلك مباشرة إلى واتساب برسالة مرتبة تحتوي على ملخص طلبك لتسريع التواصل مع فريقنا.</p>
        </div>
        <div class="nashar-request-card">
          <form class="nashar-request-form" id="nashar-service-request-form" autocomplete="on">
            <div class="nashar-request-field">
              <label for="nashar-name">الاسم</label>
              <input id="nashar-name" name="name" type="text" autocomplete="name" placeholder="اكتب اسمك" required>
            </div>
            <div class="nashar-request-field">
              <label for="nashar-phone">رقم الهاتف</label>
              <input id="nashar-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="مثال: 01012345678" required>
            </div>
            <div class="nashar-request-field">
              <label for="nashar-city">المدينة / الدولة</label>
              <input id="nashar-city" name="city" type="text" autocomplete="address-level2" placeholder="الرياض، جدة، القاهرة...">
            </div>
            <div class="nashar-request-field">
              <label for="nashar-service">الخدمة المطلوبة</label>
              <select id="nashar-service" name="service" required>
                <option value="" selected disabled>اختر الخدمة</option>
                ${options}
              </select>
            </div>
            <div class="nashar-request-field full">
              <label for="nashar-details">تفاصيل الطلب</label>
              <textarea id="nashar-details" name="details" placeholder="اكتب باختصار ما الذي تريد تنفيذه، أهدافك، وأي تفاصيل مهمة"></textarea>
            </div>
            <button class="nashar-request-submit" type="submit">إرسال الطلب عبر واتساب</button>
            <p class="nashar-request-note">بالضغط على الزر سيتم فتح واتساب على الرقم ${PHONE_DISPLAY} مع ملخص طلبك فقط.</p>
          </form>
        </div>
      </div>`;
    inner.dataset.nasharServiceRequest='1';

    const form=inner.querySelector('#nashar-service-request-form');
    if(form&&!form.dataset.bound){
      form.dataset.bound='1';
      form.addEventListener('submit',function(e){
        e.preventDefault();
        const data=new FormData(form);
        const name=String(data.get('name')||'').trim();
        const phone=String(data.get('phone')||'').trim();
        const city=String(data.get('city')||'').trim();
        const service=String(data.get('service')||'').trim();
        const details=String(data.get('details')||'').trim();
        if(!name||!phone||!service){form.reportValidity();return}
        const lines=[
          'طلب خدمة جديد - النشار جروب',
          '',
          'الاسم: '+name,
          'رقم الهاتف: '+phone,
          'الخدمة المطلوبة: '+service,
          city?'المدينة / الدولة: '+city:'',
          details?'تفاصيل الطلب: '+details:'',
          '',
          'تم إرسال الطلب من: '+location.origin+location.pathname
        ].filter(Boolean);
        location.href='https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(lines.join('\n'));
      });
    }
    return true;
  }

  function apply(){
    addStyles();
    patchPortfolio();
    patchMenuPhone();
    hideSelectedLearnThumbnails();
    patchFooterContacts();
    removeOffcanvasLogo();
    replacePdfSection();
  }

  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  document.addEventListener('DOMContentLiteSpeedLoaded',apply);
  window.addEventListener('load',apply,{once:true});
  [80,300,900,1800].forEach(ms=>setTimeout(apply,ms));
})();
