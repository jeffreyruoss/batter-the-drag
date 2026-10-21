// Prev/next page navigation shared by every page: the big arrow links, keyboard arrows
// and swipes. Each page brings its own exit animation. Load after player.js.
//
// Page-to-page transitions: a page that wants the next page to pick up its exit
// (e.g. a whiteout) stores sessionStorage 'btd-arrive'. Every page reads and clears it
// in <head> and exposes it as <html data-arrive="...">.
(function () {
  // opts: prev, next (the arrow <a> elements; either may be null)
  //   leave(link, dir): play this page's exit ('prev' | 'next'); return ms to wait before going
  //   canLeave(): optional; return false to ignore navigation (e.g. before the intro starts)
  //   restore(): optional; the back/forward cache brought the page back mid-exit, so undo it
  BTD.nav = function (opts) {
    var leaving = false;
    var timer;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(link, dir) {
      if (!link || leaving || (opts.canLeave && !opts.canLeave())) return;
      leaving = true;
      if (reduceMotion) { location.href = link.href; return; }
      var ms = opts.leave(link, dir);
      timer = setTimeout(function () { location.href = link.href; }, ms);
    }

    [[opts.prev, 'prev'], [opts.next, 'next']].forEach(function (pair) {
      if (!pair[0]) return;
      pair[0].addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(pair[0], pair[1]);
      });
    });

    window.addEventListener('keydown', function (e) {
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if (e.key === 'ArrowLeft') go(opts.prev, 'prev');
      if (e.key === 'ArrowRight') go(opts.next, 'next');
    });

    var touch = null;
    // Single-finger, mostly horizontal swipes only, so pinch-zoom and scrolling never navigate.
    // Swipes from the screen edge belong to the browser's own back/forward gesture.
    window.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      var edge = t.clientX < 24 || t.clientX > window.innerWidth - 24;
      touch = e.touches.length === 1 && !edge ? { x: t.clientX, y: t.clientY } : null;
    }, { passive: true });
    window.addEventListener('touchend', function (e) {
      if (touch === null || e.touches.length > 0) { touch = null; return; }
      var dx = e.changedTouches[0].clientX - touch.x;
      var dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx > 0) go(opts.prev, 'prev');
      else go(opts.next, 'next');
    });

    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      // Came back mid-exit: don't let the pending navigation fire later.
      clearTimeout(timer);
      leaving = false;
      if (opts.restore) opts.restore();
    });
  };
})();
