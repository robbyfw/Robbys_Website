/* Interactions:
   - pointerenter/hover draws a thin black line from organ center to an endpoint outside torso (based on data-offset)
   - info box appears at end of line with organ name + short description
   - click toggles persistent info box
   - clicking outside hides persistent info
*/

(function () {
  const anatomy = document.getElementById('anatomy');
  const connector = document.getElementById('connector');
  const connLine = document.getElementById('conn-line');
  const info = document.getElementById('info');
  const infoTitle = document.getElementById('info-title');
  const infoText = document.getElementById('info-text');

  const organs = Array.from(anatomy.querySelectorAll('.organ'));
  let active = null;
  let persistent = false;
  let hideTimer = null;

  // Ensure connector overlay maps to anatomy bounding box in page coordinates
  function syncConnector() {
    const rect = anatomy.getBoundingClientRect();
    connector.style.left = rect.left + 'px';
    connector.style.top = rect.top + 'px';
    connector.style.width = rect.width + 'px';
    connector.style.height = rect.height + 'px';
    connector.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  // element center (screen coords)
  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  // show line + info for organ
  function showFor(el) {
    if (!el) return;
    clearTimeout(hideTimer);
    active = el;

    const organCenter = center(el);
    const torsoRect = anatomy.getBoundingClientRect();

    // offsets defined on each <g> element (in px)
    const ox = Number(el.dataset.offsetX ?? 140);
    const oy = Number(el.dataset.offsetY ?? 0);

    // convert to connector SVG coords (relative to anatomy top-left)
    const startX = Math.round(organCenter.x - torsoRect.left);
    const startY = Math.round(organCenter.y - torsoRect.top);
    const endX = Math.round(startX + ox);
    const endY = Math.round(startY + oy);

    // initialize line at start (for dash animation)
    connLine.setAttribute('x1', startX);
    connLine.setAttribute('y1', startY);
    connLine.setAttribute('x2', startX);
    connLine.setAttribute('y2', startY);
    connLine.style.strokeOpacity = '1';

    // compute length and set dash for draw animation
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    connLine.style.strokeDasharray = length;
    connLine.style.strokeDashoffset = length;

    // a frame later set the real end point and animate dash to 0
    requestAnimationFrame(() => {
      connLine.setAttribute('x2', endX);
      connLine.setAttribute('y2', endY);
      requestAnimationFrame(() => {
        connLine.style.strokeDashoffset = '0';
      });
    });

    // prepare info content
    const name = el.dataset.name || el.id || 'Organ';
    const text = el.dataset.info || '';
    infoTitle.textContent = name;
    infoText.textContent = text;
    info.setAttribute('aria-hidden', 'false');

    // position and show info box near endpoint (on page coords)
    info.style.display = 'block';
    requestAnimationFrame(() => {
      const box = info.getBoundingClientRect();
      const pageEndX = torsoRect.left + endX;
      const pageEndY = torsoRect.top + endY;

      // prefer placing to the right
      let left = pageEndX + 12;
      let top = pageEndY - box.height / 2;

      // if would overflow right, place left of endpoint
      if (left + box.width > window.innerWidth - 8) {
        left = pageEndX - box.width - 16;
      }
      // clamp top to viewport
      if (top < 8) top = 8;
      if (top + box.height > window.innerHeight - 8) top = window.innerHeight - box.height - 8;

      info.style.left = Math.round(left) + 'px';
      info.style.top = Math.round(top) + 'px';

      // slight delay so the line is visible drawing before box appears
      setTimeout(() => info.classList.add('show'), 120);
    });
  }

  function hideSoon(ms = 260) {
    if (persistent) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideNow, ms);
  }

  function hideNow() {
    clearTimeout(hideTimer);
    active = null;
    persistent = false;
    // retract line visually
    const dash = connLine.style.strokeDasharray || 0;
    connLine.style.strokeDashoffset = dash;
    connLine.style.strokeOpacity = '0';
    info.classList.remove('show');
    info.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!persistent) info.style.display = 'none'; }, 220);
  }

  // attach organ listeners
  organs.forEach(el => {
    el.addEventListener('pointerenter', () => {
      persistent = false;
      showFor(el);
    });

    el.addEventListener('pointermove', () => {
      // update the connector while pointer moves inside
      if (active === el) showFor(el);
    });

    el.addEventListener('pointerleave', () => {
      hideSoon(300);
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (active === el && persistent) {
        persistent = false;
        hideNow();
      } else {
        persistent = true;
        showFor(el);
      }
    });
  });

  // hide when clicking outside organs
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.organ')) {
      hideNow();
    }
  });

  // escape hides
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideNow();
  });

  // update connector size and reposition active labels on resize / scroll
  function refresh() {
    syncConnector();
    if (active) showFor(active);
  }

  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, { passive: true });

  // initial sync
  requestAnimationFrame(refresh);
})();
