/* Interactive organs:
   - Hover or pointerenter -> draw animated connector line from organ center to an endpoint outside body (based on data-offset)
   - Info box appears at endpoint with organ name + description
   - Click toggles persistent info; clicking outside hides it.
*/

(() => {
  // Grab elements
  const anatomy = document.getElementById('anatomy');
  const connector = document.getElementById('connector');
  const line = document.getElementById('line');
  const info = document.getElementById('info');
  const titleEl = document.getElementById('info-title');
  const textEl = document.getElementById('info-text');

  // All organ elements (have class 'organ' and data attributes)
  const organs = Array.from(anatomy.querySelectorAll('.organ'));

  let current = null;
  let persistent = false;
  let hideTimeout = null;

  // Keep overlay connector sized to the anatomy viewbox in screen pixels
  function syncConnectorSize() {
    // Match connector SVG to anatomy bounding box in screen coords
    const rect = anatomy.getBoundingClientRect();
    connector.style.left = rect.left + 'px';
    connector.style.top = rect.top + 'px';
    connector.style.width = rect.width + 'px';
    connector.style.height = rect.height + 'px';
    connector.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  }

  // Compute center of an organ element relative to document
  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }

  // Show line + info for organ
  function showFor(el) {
    if (!el) return;
    clearTimeout(hideTimeout);
    current = el;

    // Use center coordinates and offsets
    const organCenter = centerOf(el);

    // Anatomy bounding rect to convert to connector SVG coords
    const anatomyRect = anatomy.getBoundingClientRect();

    // Get offsets from data attributes (px relative to organ center)
    const ox = Number(el.dataset.offsetX ?? 140);
    const oy = Number(el.dataset.offsetY ?? 0);

    // Compute start (relative to connector SVG coords)
    const startX = organCenter.x - anatomyRect.left;
    const startY = organCenter.y - anatomyRect.top;

    const endX = startX + ox;
    const endY = startY + oy;

    // Set line coordinates
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', startX);
    line.setAttribute('y2', startY);
    line.style.strokeOpacity = '1';

    // Calculate length for dash animation
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.hypot(dx, dy);
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;

    // animate to end point (two frames to ensure CSS transition)
    requestAnimationFrame(() => {
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      requestAnimationFrame(() => {
        line.style.strokeDashoffset = '0';
      });
    });

    // Fill info content
    const name = el.dataset.name || el.id || 'Organ';
    const infoText = el.dataset.info || '';
    titleEl.textContent = name;
    textEl.textContent = infoText;
    info.setAttribute('aria-hidden', 'false');

    // Position info box near the end point but keep inside viewport
    info.classList.remove('show');
    info.style.display = 'block';

    // Wait a frame for size measurement
    requestAnimationFrame(() => {
      const box = info.getBoundingClientRect();
      // transform end point coords from connector (which is positioned over anatomyRect)
      const pageEndX = anatomyRect.left + endX;
      const pageEndY = anatomyRect.top + endY;

      // prefer right side of the endpoint, otherwise left
      let left = pageEndX + 12;
      let top = pageEndY - box.height / 2;

      if (left + box.width > window.innerWidth - 8) {
        left = pageEndX - box.width - 16;
      }
      if (top < 8) top = 8;
      if (top + box.height > window.innerHeight - 8) top = window.innerHeight - box.height - 8;

      info.style.left = Math.round(left) + 'px';
      info.style.top = Math.round(top) + 'px';

      // small delay to let the line start drawing so it looks smooth
      setTimeout(() => {
        info.classList.add('show');
      }, 130);
    });
  }

  function hideSoon(ms = 240) {
    if (persistent) return;
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideNow, ms);
  }

  function hideNow() {
    clearTimeout(hideTimeout);
    current = null;
    persistent = false;
    // retract line
    const dash = line.style.strokeDasharray || 0;
    line.style.strokeDashoffset = dash;
    line.style.strokeOpacity = '0';
    info.classList.remove('show');
    info.setAttribute('aria-hidden', 'true');
    setTimeout(() => { if (!persistent) info.style.display = 'none'; }, 220);
  }

  // Attach events to organs
  organs.forEach(el => {
    el.addEventListener('pointerenter', (e) => {
      persistent = false;
      showFor(el);
    });

    el.addEventListener('pointermove', (e) => {
      // Update while pointer moves so the connector stays accurate
      if (current === el) showFor(el);
    });

    el.addEventListener('pointerleave', (e) => {
      hideSoon(280);
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (current === el && persistent) {
        // toggle off
        persistent = false;
        hideNow();
      } else {
        persistent = true;
        showFor(el);
      }
    });
  });

  // clicking outside hides persistent info
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.organ')) {
      hideNow();
    }
  });

  // Escape hides
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideNow();
  });

  // Keep connector synced when window resizes / scrolls
  function refresh() {
    syncConnectorSize();
    // if an organ is currently active, reposition its visuals
    if (current) showFor(current);
  }

  window.addEventListener('resize', refresh);
  window.addEventListener('scroll', refresh, { passive: true });

  // initial sync after DOM paint
  requestAnimationFrame(refresh);
})();
