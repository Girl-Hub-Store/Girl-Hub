function header(active=''){
  return `<header class="header figma-header">
    <div class="header-inner">
      <div class="header-right">
        <nav class="navlinks">
          <a class="${active==='home'?'active':''}" href="home.html">الرئيسية</a>
          <a class="${active==='clothes'?'active':''}" href="clothes.html">ملابس</a>
          <a class="${active==='accessories'?'active':''}" href="accessories.html">اكسسوارات</a>
          <a href="https://wa.me/201279860213" target="_blank" rel="noopener noreferrer">تواصل معنا</a>
        </nav>
      </div>
      <a href="home.html" class="brand-center" aria-label="Girl Hub"><img class="logo" src="assets/images/logo.png" alt="Girl hub"></a>
      <button class="mobile-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mobileMenu">
        <span></span><span></span><span></span>
      </button>
      <div class="mobile-menu" id="mobileMenu" hidden>
        <a class="${active==='home'?'active':''}" href="home.html">الرئيسية</a>
        <a class="${active==='clothes'?'active':''}" href="clothes.html">ملابس</a>
        <a class="${active==='accessories'?'active':''}" href="accessories.html">اكسسوارات</a>
        <a href="https://wa.me/201279860213" target="_blank" rel="noopener noreferrer">تواصل معنا</a>
      </div>
      <div class="header-left">
        <a class="mobile-contact" href="https://wa.me/201279860213" target="_blank" rel="noopener noreferrer">تواصل</a>
        <button class="mini-user" aria-label="الحساب">●</button>
        <a class="cart-icon" href="cart.html" aria-label="السلة">🛒<span class="badge cart-count">0</span></a>
        <a class="wish-icon" href="wishlist.html" aria-label="المفضلة">♡<span class="badge wish-count">0</span></a>
        <button class="lang lang-toggle" data-lang-toggle type="button" aria-label="تغيير اللغة">AR</button>
        <a class="search-pill" href="search.html"><span>البحث</span><span class="search-arrow">←</span></a>
      </div>
    </div>
  </header>`
}
function footer(){
  return `<footer class="footer figma-footer">
    <div class="footer-center">
      <img class="footer-logo" src="assets/images/logo.png" alt="Girl hub">
      <div class="footer-owner-en">Owned By : Zeinab Mahmoud</div>
      <div class="footer-caption">تابعينا علي صفحات السوشيال ميديا يقمررر</div>
      <div class="social exact-social" aria-label="وسائل التواصل الاجتماعي">
        <a href="https://www.instagram.com/girl_hub.gh?stkn=MWRkdGl4OGZ2dW5hYg==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor"/></svg></a>
        <a href="#" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-3.3 0-5 1.8-5 5v2H6v4h3v5h4v-5h3.2l.8-4H13V9c0-.7.3-1 1-1Z" fill="currentColor"/></svg></a>
        <a href="https://chat.whatsapp.com/KddbvTR3t7h7am8utFqufA?mode=wwt&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAdGRleAUfnOhwZG9mAmZkaWQWUO7RNK2dDAsek2Nqx7L5ocn9f15ijmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzEyNDAyNDU3NDI4NzQxNAABpwRUv5Ft_xYJ88VnKRo1eBglYrhMq__wOM8lETQP56IEx6SSwwP9T671zy0d_aem_R09L8hRhdFI-nruHdQwtcA" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 3a8.5 8.5 0 0 0-7.3 12.9L3.2 21l5.2-1.4A8.5 8.5 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.7 8.2c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c.7 1.2 1.6 2.1 2.9 2.7l.5-.6c.2-.2.4-.3.7-.2l1.6.7c.3.1.4.3.4.6v.4c0 .3-.1.6-.4.8-.4.3-1 .5-1.6.4-2.9-.5-5.6-3.1-6.3-6-.1-.5.1-1.1.3-1.6Z" fill="currentColor"/></svg></a>
        <a href="https://www.tiktok.com/@girl.hub21?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok"><svg viewBox="0 0 24 24"><path d="M15 4c.5 2.2 1.8 3.6 4 4v3.1c-1.5-.1-2.8-.6-4-1.4V15a5 5 0 1 1-4.9-5h1.3v3.1h-1.3a1.9 1.9 0 1 0 1.8 1.9V4H15Z" fill="currentColor"/></svg></a>
      </div>
    </div>
    <div class="footer-bottom exact-bottom"><span>صمم بكل حب لـ GIRL HUB © ٢٠٢٦</span><span>جميع الحقوق محفوظة لزينب محمود</span></div>
  </footer>`
}
function mountHeader(active){
  document.body.insertAdjacentHTML('afterbegin',header(active));
  document.body.insertAdjacentHTML('beforeend',footer());
  const toggle=document.querySelector('.mobile-menu-toggle');
  const menu=document.querySelector('.mobile-menu');
  if(toggle && menu){
    const closeMenu=()=>{menu.hidden=true;toggle.classList.remove('open');toggle.setAttribute('aria-expanded','false')};
    toggle.addEventListener('click',()=>{
      const open=menu.hidden;
      menu.hidden=!open;
      toggle.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',String(open));
    });
    menu.addEventListener('click',e=>{if(e.target.closest('a')) closeMenu()});
    document.addEventListener('click',e=>{
      if(!e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-toggle')) closeMenu();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape') closeMenu()});
  }
}
