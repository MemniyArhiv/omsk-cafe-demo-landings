/* Демо-лендинги: мобильная навигация, липкая шапка и плавный скролл.
   Только ванильный JS: ни трекеров, ни внешних запросов, ни зависимостей. */
(function () {
  'use strict';

  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Липкая шапка: тень и граница появляются после прокрутки. */
  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* Мобильное меню. */
  function isNavOpen() {
    return Boolean(toggle && toggle.getAttribute('aria-expanded') === 'true');
  }

  function closeNav(returnFocus) {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }

  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      if (isNavOpen()) {
        closeNav(false);
      } else {
        openNav();
      }
    });

    nav.addEventListener('click', function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a')) closeNav(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !isNavOpen()) return;
      var focusInsideNav = nav.contains(document.activeElement) || toggle === document.activeElement;
      closeNav(focusInsideNav);
    });

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!(target instanceof Element) || !isNavOpen()) return;
      if (nav.contains(target) || toggle.contains(target)) return;
      closeNav(false);
    });

    var desktopQuery = window.matchMedia('(min-width: 900px)');
    var onDesktop = function (event) {
      if (event.matches) closeNav(false);
    };
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', onDesktop);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(onDesktop);
    }
  }

  /* Плавная прокрутка по внутренним якорям с учётом липкой шапки
     (отступ задаётся через scroll-margin-top в CSS). */
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var link = target.closest('a[href^="#"]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href === '#') return;
    var id;
    try {
      id = decodeURIComponent(href.slice(1));
    } catch (error) {
      return;
    }
    var section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    if (isNavOpen()) closeNav(false);
    section.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
    if (window.history && typeof window.history.replaceState === 'function') {
      try {
        window.history.replaceState(null, '', '#' + encodeURIComponent(id));
      } catch (error) {
        /* На file:// история может быть недоступна — скролл уже выполнен. */
      }
    }
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  });

  /* Подсветка активного раздела в меню (необязательное улучшение). */
  if ('IntersectionObserver' in window) {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
    var sections = navLinks
      .map(function (link) {
        return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
      })
      .filter(Boolean);
    if (sections.length > 0) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            navLinks.forEach(function (link) {
              var id = decodeURIComponent(link.getAttribute('href').slice(1));
              if (id === entry.target.id) link.setAttribute('aria-current', 'true');
              else link.removeAttribute('aria-current');
            });
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
      );
      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }

})();
