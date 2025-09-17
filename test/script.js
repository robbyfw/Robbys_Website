/* script.js
   Improved interaction:
   - white glowing connector line draws from organ center to a point outside torso (left/right)
   - small white dot shows where the line meets the organ
   - label box appears outside torso (left/right) and stays horizontal like your diagram
   - click toggles persistent label (useful for touch); clicking outside hides it
   - overlay syncs to anatomy bounding box on resize/scroll
*/

(function () {
  // DOM references
  const anatomy = document.getElementById('anatomy');
  const connector = document.getElementById('connector');
  const connLine = document.getElementById('conn-line');
  const connDot = document.getElementById('conn-dot');
  const label = document.getElementById('label');
  const labelTitle = document.getElementById('label-title');
  const labelText = document.getElementById('label-text');

  const organs = Array.from(anatomy.querySelectorAll('.organ'));
  let active = null;
  let persistent = false;
  let hideTimer = null;

  // Map connector overlay to anatomy element on screen
  function syncConnector() {
    const rect = anatomy.getBoundingClientRect();
    connector.style.left = rect.left + 'px';
    connector.style.top = rect.top + 'px';
    connector.style.width = rect.width + 'px';
    connector.style.height = rect.height + 'px';
    // set viewBox so line coordinates match pixel coords inside the anatomy rect
    connector.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  // get screen center of element
  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  // show connector and label for organ el
  function showFor(el) {
    if (!el) return;
    clearTimeout(hideTimer);
    active = el;

    const organCenter = center(el);
    const anatomyRect = anatomy.getBoundingClientRect();

    // relative coordinates inside connector SVG
    const startX = Math.round(organCenter.x - anatomyRect.left);
    const startY = Math.round(organCenter.y - anatomyRect.top);

    // side: left or right (default right)
    const side = (el.dataset.side === 'left') ? 'left' : 'right';

    // offset distance (how far line extends horizontally). Adjust based on anatomy width:
    const baseOffset = Math.max(120, Math.round(anatomyRect.width * 0.44)); // responsive default
    const offsetDistance = Number(el.dataset.offsetX || baseOffset);
    const vOffset = Number(el.dataset.offsetY || 0);

    // compute end coordinates relative to connector SVG
    let endX = (side === 'left') ? startX - offsetDistance : startX + offsetDistance;
    let endY = startY + vOffset;

    // clamp endY to inside anatomy area for label vertical placement
    const maxH = anatomyRect.height - 10;
    if (endY < 10) endY = 10;
    if (endY > maxH) endY = maxH;

    // initialize line (start and initial end same point) for dash animation
    connLine.setAttribute('x1', startX);
    connLine.setAttribute('y1', startY);
    connLine.setAttribute('x2', startX);
    connLine.setAttribute('y2', startY);
    connLine.style.strokeOpacity = '1';

    // calculate length and dash
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.hypot(dx, dy);
    connLine.style.strokeDasharray = length;
    connLine.style.strokeDashoffset = length;

    // animate to endpoint
    requestAnimationFrame(() => {
      connLine.setAttribute('x2', endX);
      connLine.setAttribute('y2', endY);
      requestAnimationFrame(() => {
        connLine.style.strokeDashoffset = '0';
      });
    });

    // show dot at the organ center (a bit inside)
    connDot.setAttribute('cx', startX);
    connDot.setAttribute('cy', startY);
    connDot.style.opacity = '1';

    // fill label content
    const title = el.dataset.name || el.id || 'Organ';
    const info = el.dataset.info || '';
    labelTitle.textContent = title;
    labelText.textContent = info;
    label.setAttribute('aria-hidden', 'false');

    // show label near endpoint (on page coords)
    label.classList.remove('show');
    label.style.display = 'block';

    requestAnimationFrame(() => {
      const box = label.getBoundingClientRect();
      // page coords for end point
      const pageEndX = anatomyRect.left + endX;
      const pageEndY = anatomyRect.top + endY;

      // determine whether label sits left or right and align horizontally like diagram
      if (side === 'left') {
        // put label to the left of the endpoint
        let left = pageEndX - box.width - 18;
        // clamp
        if (left < 8) left = 8;
        const top = Math.min(Math.max(8, pageEndY - box.height / 2), window.innerHeight - box.height - 8);
        label.style.left = Math.round(left) + 'px';
        label.style.top = Math.round(top) + 'px';
        label.classList.add('left');
        label.classList.remove('right');
      } else {
        // place to the right
        let left = pageEndX + 18;
        if (left + box.width > window.innerWidth - 8) left = window.innerWidth - box.width - 8;
        const top = Math.min(Math.max(8, pageEndY - box.height / 2), window.innerHeight - box.height - 8);
        label.style.left = Math.round(left) + 'px';
        label.style.top = Math.round(top) + 'px';
        label.classList.add('right');
        label.classList.remove('left');
      }

      // delay showing label slightly so the line draws first
      setTimeout(() => label.classList.add('show'), 110);
    });
  }

  function hideSoon(delay = 260) {
    if (persistent) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideNow, delay);
  }

  function hideNow() {
    clearTimeout(hideTimer);
    active = null;
    persistent = false;
    const dash = connLine.style.strokeDasharray || 0;
    connLine.style.strokeDashoffset = dash;
    connLine.style.strokeOpacity = '0';
    connDot.style.opacity = '0';
    label.classList.remove('show');
    label.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!persistent) label.style.display = 'none'; }, 220);
  }

  // attach events
  organs.forEach(el => {
    el.addEventListener('pointerenter', () => {
      persistent = false;
      showFor(el);
    });

    el.addEventListener('pointermove', () => {
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
    if (!e.target.closest('.organ')) hideNow();
  });

  // escape
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hideNow(); });

  // on resize/scroll remap overlay and reposition active label
  function refresh() {
    syncConnector();
    if (active) showFor(active);
  }
  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, { passive: true });

  // initial
  requestAnimationFrame(refresh);
})();
