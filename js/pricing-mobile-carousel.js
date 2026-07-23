/* iPhone-only carousel controls for the five pricing plans. */
(function () {
  'use strict';

  function initMobilePricingCarousel() {
    var mobileQuery = window.matchMedia('(max-width: 480px)');
    var rail = document.getElementById('mobilePlanRail');
    var previous = document.querySelector('.pricing-carousel-arrow--previous');
    var next = document.querySelector('.pricing-carousel-arrow--next');

    if (!rail || !previous || !next) return;

    var cards = Array.prototype.slice.call(rail.querySelectorAll('.card[data-plan]'));
    if (!cards.length) return;

    function activeIndex() {
      var railCenter = rail.scrollLeft + (rail.clientWidth / 2);
      var closestIndex = 0;
      var closestDistance = Infinity;

      cards.forEach(function (card, index) {
        var cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        var distance = Math.abs(cardCenter - railCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    }

    function syncControls() {
      if (!mobileQuery.matches) return;
      var index = activeIndex();
      previous.disabled = index === 0;
      next.disabled = index === cards.length - 1;
      rail.setAttribute('aria-label', 'Pricing plans, ' + (index + 1) + ' of ' + cards.length + ': ' + cards[index].getAttribute('data-plan'));
    }

    function move(direction) {
      if (!mobileQuery.matches) return;
      var targetIndex = Math.max(0, Math.min(cards.length - 1, activeIndex() + direction));
      cards[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    previous.addEventListener('click', function () { move(-1); });
    next.addEventListener('click', function () { move(1); });
    rail.addEventListener('scroll', function () { window.requestAnimationFrame(syncControls); }, { passive: true });
    window.addEventListener('resize', syncControls);
    mobileQuery.addEventListener('change', syncControls);
    syncControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobilePricingCarousel);
  } else {
    initMobilePricingCarousel();
  }
})();
