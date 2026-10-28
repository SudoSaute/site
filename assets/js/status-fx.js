/* Resume status card: the glass highlight follows the cursor (sets --mx and
   --my on [data-st-light]). Mouse and trackpad only; without it the
   highlight rests at the top left. Styles: assets/css/site/41-status.css. */
(function () {
  'use strict';
  var fine = false;
  try { fine = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
  if (!fine) return;
  [].forEach.call(document.querySelectorAll('[data-st-light]'), function (el) {
    var raf = 0;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
    });
    el.addEventListener('pointerleave', function () {
      cancelAnimationFrame(raf);
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  });
})();
