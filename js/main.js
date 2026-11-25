/* =========================================
   ABOOBACKER SIDEQEE - PORTFOLIO SCRIPTS
   Animations, interactions, and UI behavior
   ========================================= */

(() => {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Icons ----------
  if (window.lucide) window.lucide.createIcons();

  // ---------- Year ----------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Scroll Progress ----------
  const progressBar = $('#scrollProgress');
  const updateProgress = () => {
    if (!progressBar) return;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progressBar.style.width = max > 0 ? `${(h.scrollTop / max) * 100}%` : '0%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Navigation ----------
  const navWrap = $('#navWrap');
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  const navLinks = $$('.nav__link[data-nav]');

  const setNavState = () => {
    if (!navWrap) return;
    navWrap.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', setNavState, { passive: true });
  setNavState();

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navMenu.classList.remove('is-open');
  };
  const openMenu = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    navMenu.classList.add('is-open');
  };

  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!navMenu?.classList.contains('is-open')) return;
    if (navWrap && !navWrap.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Smooth scroll for in-page anchors ----------
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = (navWrap?.offsetHeight || 80) + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReduced ? 'auto' : 'smooth' });
      history.pushState(null, '', id);
    });
  });

  // ---------- Active nav on scroll ----------
  const sections = $$('section[id]');
  const activateNav = () => {
    const y = window.scrollY + (navWrap?.offsetHeight || 80) + 120;
    let current = 'hero';
    sections.forEach((sec) => { if (sec.offsetTop <= y) current = sec.id; });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${current}` || (current === 'works' && href === '#works') ||
                       (current === 'graphic-design' && href === '#works') ||
                       (current === 'video-editing' && href === '#works') ||
                       (current === 'services' && href === '#works') ||
                       (current === 'process' && href === '#works');
      link.classList.toggle('active', isActive);
    });
  };
  window.addEventListener('scroll', activateNav, { passive: true });
  activateNav();

  // ---------- Hero rotating text ----------
  const rotatingText = $('#rotatingText');
  const phrases = ['DESIGNING IDEAS.', 'EDITING STORIES.', 'GROWING BRANDS.'];
  let phraseIndex = 0;
  if (rotatingText && !prefersReduced) {
    setInterval(() => {
      rotatingText.classList.add('is-swapping');
      setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        rotatingText.textContent = phrases[phraseIndex];
        rotatingText.classList.remove('is-swapping');
      }, 350);
    }, 2600);
  }

  // ---------- Cursor glow ----------
  const cursorGlow = $('#cursorGlow');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursorGlow && canHover && !prefersReduced) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    const raf = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      cursorGlow.style.left = cx + 'px';
      cursorGlow.style.top = cy + 'px';
      requestAnimationFrame(raf);
    };
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    raf();
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  // ---------- Magnetic buttons ----------
  if (canHover && !prefersReduced) {
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.18;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ---------- Project filters ----------
  const filterBtns = $$('.filter-btn');
  const workCards = $$('.work-card[data-category]');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      workCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
      });
      // refresh ScrollTrigger positions after layout change
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  // ---------- Lightbox ----------
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxTitle = $('#lightboxTitle');
  const lightboxCat = $('#lightboxCat');
  let lastFocus = null;

  const openLightbox = (src, title, cat) => {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = title || 'Project preview';
    lightboxTitle.textContent = title || '';
    lightboxCat.textContent = cat || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.modal__close')?.focus();
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  $$('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(btn.dataset.lightbox, btn.dataset.title, btn.dataset.cat));
  });

  // ---------- Video modal ----------
  const videoModal = $('#videoModal');
  const videoFrame = $('#videoFrame');
  const videoPlayer = $('#videoPlayer');
  const videoPlaceholder = $('#videoPlaceholder');
  const videoModalTitle = $('#videoModalTitle');
  const videoModalCat = $('#videoModalCat');

  const isEmbed = (url) => /youtube\.com|youtu\.be|vimeo\.com|player\./i.test(url);
  const toEmbed = (url) => {
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const id = url.split('vimeo.com/')[1].split(/[?&]/)[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  const openVideo = (src, title, cat) => {
    if (!videoModal) return;
    lastFocus = document.activeElement;
    videoModalTitle.textContent = title || 'Video Preview';
    videoModalCat.innerHTML = cat ? cat : 'Add your real video by setting <code>data-video-src</code> on this project card.';
    videoFrame.hidden = true; videoPlayer.hidden = true; videoPlaceholder.hidden = false;
    videoFrame.removeAttribute('src'); videoPlayer.removeAttribute('src'); videoPlayer.load?.();
    if (src) {
      videoPlaceholder.hidden = true;
      if (isEmbed(src)) {
        videoFrame.src = toEmbed(src);
        videoFrame.hidden = false;
      } else {
        videoPlayer.src = src;
        videoPlayer.hidden = false;
        videoPlayer.play().catch(() => {});
      }
    }
    videoModal.classList.add('is-open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    videoModal.querySelector('.modal__close')?.focus();
  };
  const closeVideo = () => {
    if (!videoModal) return;
    videoModal.classList.remove('is-open');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    videoFrame.removeAttribute('src'); videoFrame.hidden = true;
    videoPlayer.pause?.(); videoPlayer.removeAttribute('src'); videoPlayer.load?.(); videoPlayer.hidden = true;
    videoPlaceholder.hidden = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  $$('[data-video-title]').forEach((btn) => {
    btn.addEventListener('click', () => openVideo(btn.dataset.videoSrc || '', btn.dataset.videoTitle, btn.dataset.videoCat));
  });

  // Modal close handlers
  $$('[data-close="lightbox"]').forEach((el) => el.addEventListener('click', closeLightbox));
  $$('[data-close="videoModal"]').forEach((el) => el.addEventListener('click', closeVideo));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (videoModal?.classList.contains('is-open')) closeVideo();
    else if (lightbox?.classList.contains('is-open')) closeLightbox();
  });

  // ---------- Copy phone ----------
  const copyBtn = $('#copyPhone');
  const copyFeedback = $('#copyFeedback');
  const phoneNumber = $('#phoneNumber');
  copyBtn?.addEventListener('click', async () => {
    const text = phoneNumber?.textContent?.trim() || '+91 7902392766';
    try {
      await navigator.clipboard.writeText(text);
      copyFeedback.textContent = 'WhatsApp number copied!';
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      copyFeedback.textContent = 'WhatsApp number copied!';
    }
    setTimeout(() => { copyFeedback.textContent = ''; }, 2500);
  });

  // ---------- Contact form -> WhatsApp ----------
  const form = $('#contactForm');
  const formStatus = $('#formStatus');
  const err = (id, msg) => { const el = document.getElementById(id); if (el) el.textContent = msg || ''; };
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    err('err-name'); err('err-email'); err('err-message'); formStatus.textContent = '';
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    let ok = true;
    if (!name) { err('err-name', 'Please enter your name.'); ok = false; }
    if (!email) { err('err-email', 'Please enter your email address.'); ok = false; }
    else if (!validEmail(email)) { err('err-email', 'Please enter a valid email address.'); ok = false; }
    if (!message) { err('err-message', 'Please enter a message.'); ok = false; }
    if (!ok) return;

    const text = `Hi Aboobacker, I saw your portfolio and would like to discuss a project.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;
    const url = `https://wa.me/917902392766?text=${encodeURIComponent(text)}`;
    formStatus.textContent = 'Opening WhatsApp...';
    window.open(url, '_blank', 'noopener');
    form.reset();
    setTimeout(() => { formStatus.textContent = ''; }, 4000);
  });

  // ---------- Back to top ----------
  $('#backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  // ---------- GSAP Animations ----------
  const initAnimations = () => {
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.nav__logo', { y: -20, opacity: 0, duration: 0.7 })
      .from('.nav__links li', { y: -16, opacity: 0, duration: 0.5, stagger: 0.06 }, '-=0.4')
      .from('.nav__cta', { y: -16, opacity: 0, duration: 0.5 }, '-=0.35')
      .from('.hero__eyebrow', { y: 24, opacity: 0, duration: 0.7 }, '-=0.2')
      .from('.hero__title-inner', { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.45')
      .from('.hero__rotating', { y: 20, opacity: 0, duration: 0.6 }, '-=0.45')
      .from('.hero__desc', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero__actions .btn', { y: 20, opacity: 0, duration: 0.55, stagger: 0.1 }, '-=0.35')
      .from('.hero__availability', { y: 16, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero__frame', { scale: 0.92, opacity: 0, duration: 1.1, ease: 'power2.out' }, '-=1.1')
      .from('.hero__ring', { scale: 0.85, opacity: 0, duration: 1, stagger: 0.1 }, '-=0.8')
      .from('.hero__float-card', { y: 30, opacity: 0, duration: 0.7, stagger: 0.15 }, '-=0.6')
      .from('.hero__scroll', { opacity: 0, duration: 0.6 }, '-=0.3');

    // Subtle floating for hero image
    gsap.to('.hero__frame', { y: -10, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.hero__float-card--top', { y: -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.4 });
    gsap.to('.hero__float-card--bottom', { y: 8, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.8 });

    // Generic reveals
    gsap.utils.toArray('.reveal').forEach((el) => {
      // Skip hero elements already animated
      if (el.closest('.hero')) return;
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    // Skill cards stagger
    const skillCards = gsap.utils.toArray('.skill-card');
    if (skillCards.length) {
      gsap.from(skillCards, {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.skills-grid', start: 'top 80%', once: true }
      });
    }

    // Skill meters
    $$('.skill-card').forEach((card) => {
      ScrollTrigger.create({
        trigger: card, start: 'top 85%', once: true,
        onEnter: () => card.classList.add('in-view')
      });
    });

    // Service cards stagger
    const serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length) {
      gsap.from(serviceCards, {
        y: 36, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.services-grid', start: 'top 82%', once: true }
      });
    }

    // Process line
    const processLine = $('#processLine');
    if (processLine) {
      gsap.to(processLine, {
        width: '100%', ease: 'none',
        scrollTrigger: { trigger: '.process', start: 'top 75%', end: 'bottom 60%', scrub: 1 }
      });
    }

    // Gallery items stagger
    const galleryItems = gsap.utils.toArray('.gallery__item');
    if (galleryItems.length) {
      gsap.from(galleryItems, {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.gallery', start: 'top 82%', once: true }
      });
    }

    // Video cards stagger
    const videoCards = gsap.utils.toArray('.video-card');
    if (videoCards.length) {
      gsap.from(videoCards, {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.video-grid', start: 'top 82%', once: true }
      });
    }

    // Work cards stagger
    const workCardEls = gsap.utils.toArray('.work-card');
    if (workCardEls.length) {
      gsap.from(workCardEls, {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.works-grid', start: 'top 82%', once: true }
      });
    }
  };

  // Delay animation init slightly to ensure layout is stable
  window.addEventListener('load', () => {
    initAnimations();
    // Fallback: if GSAP not available, make sure reveals are visible
    if (prefersReduced || !window.gsap) {
      $$('.reveal').forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      $$('.skill-card').forEach((c) => c.classList.add('in-view'));
    }
  });

})();
