/* VITRINE v2 — spine scroll-spy. Vanilla, no dependencies, no external calls.
   Without JS the tabs are plain anchors and the first one is marked server-side. */
(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-spine-tab]'));
  if (!tabs.length) return;

  var sections = tabs
    .map(function (tab) {
      return document.getElementById(tab.getAttribute('data-spine-tab'));
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setCurrent(id) {
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-spine-tab') === id) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
  }

  setCurrent(sections[0].id);

  // Scroll-spy can leave the last section marked when the user scrolls back to
  // the masthead; reset to the first section at the very top of the page.
  function resetAtTop() {
    if (window.scrollY <= 8) setCurrent(sections[0].id);
  }

  window.addEventListener('scroll', resetAtTop, { passive: true });
  resetAtTop();

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var tab = target.closest('[data-spine-tab]');
    if (tab) setCurrent(tab.getAttribute('data-spine-tab'));
  });
})();
