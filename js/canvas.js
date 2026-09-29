/* =========================================================================
   CANVAS RENDERING & INTERACTION ENGINE
   ========================================================================= */

import { studioState, getEffectiveFontWeight } from './state.js';

export async function loadFontAsync(family, weight = '400') {
  try {
    const effectiveWeight = getEffectiveFontWeight(family, weight);
    if (document.fonts && document.fonts.load) {
      await Promise.allSettled([
        document.fonts.load(`${effectiveWeight} 48px "${family}"`),
        document.fonts.load(`400 48px "${family}"`)
      ]);
      await document.fonts.ready;
    }
  } catch (err) {
    console.warn('Font load warning:', err);
  }
}

export function formatCase(name, casing) {
  if (!name) return '';
  const trimmed = name.trim();
  if (casing === 'upper') return trimmed.toUpperCase();
  if (casing === 'title') {
    return trimmed.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  return trimmed;
}

export function getCurrentRecipientName() {
  if (studioState.names.length > 0) {
    const raw = studioState.names[studioState.currentIndex] || studioState.names[0];
    return formatCase(raw, studioState.letterCase);
  }
  return formatCase('Recipient Name', studioState.letterCase);
}

export async function drawOnCanvas(targetCanvas, recipientName, isInteractive = false) {
  if (!studioState.templateLoaded || !studioState.templateImage) return;

  const ctx = targetCanvas.getContext('2d');
  const w = targetCanvas.width;
  const h = targetCanvas.height;

  // 1. Draw User's Template Image at Full Scale
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(studioState.templateImage, 0, 0, w, h);

  // 2. Ensure font is ready with its supported weight
  const effectiveWeight = getEffectiveFontWeight(studioState.fontFamily, studioState.fontWeight);
  await loadFontAsync(studioState.fontFamily, effectiveWeight);

  // 3. Compute relative coordinates
  const x = studioState.posXFrac * w;
  const y = studioState.posYFrac * h;

  // 4. Calculate Font Size relative to original template height
  let scaledFontSize = studioState.fontSize * (h / studioState.templateHeight);
  ctx.font = `${effectiveWeight} ${scaledFontSize}px "${studioState.fontFamily}", cursive, serif`;
  ctx.textAlign = studioState.textAlign;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = studioState.color;

  // 5. Shrink-to-fit calculation
  if (studioState.shrinkToFit) {
    const maxWidth = w * studioState.maxWidthFrac;
    let textWidth = ctx.measureText(recipientName).width;

    if (textWidth > maxWidth && textWidth > 0) {
      const factor = maxWidth / textWidth;
      scaledFontSize = Math.max(12, scaledFontSize * factor);
      ctx.font = `${studioState.fontWeight} ${scaledFontSize}px "${studioState.fontFamily}", sans-serif, serif`;
    }
  }

  // 6. Draw the Name Text
  ctx.fillText(recipientName, x, y);

  // 7. If interactive preview, draw drag handle and boundary guides
  if (isInteractive) {
    const textMetrics = ctx.measureText(recipientName);
    const textW = textMetrics.width;
    const textH = scaledFontSize;

    let left = x;
    if (studioState.textAlign === 'center') left = x - textW / 2;
    else if (studioState.textAlign === 'right') left = x - textW;
    const top = y - textH / 2;

    ctx.save();
    // Dashed bounding box
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
    ctx.lineWidth = Math.max(2, 2.5 * (w / 1200));
    ctx.setLineDash([8 * (w / 1200), 5 * (w / 1200)]);
    ctx.strokeRect(left - 12, top - 8, textW + 24, textH + 16);

    // Center crosshair marker
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    const cross = 10 * (w / 1200);
    ctx.beginPath();
    ctx.moveTo(x - cross, y);
    ctx.lineTo(x + cross, y);
    ctx.moveTo(x, y - cross);
    ctx.lineTo(x, y + cross);
    ctx.stroke();

    // Drag handle badge
    ctx.fillStyle = '#4f46e5';
    const tag = ' ✥ Drag to Move ';
    ctx.font = `700 ${Math.max(12, 14 * (w / 1200))}px "Plus Jakarta Sans", sans-serif`;
    const tagW = ctx.measureText(tag).width + 12;
    const tagH = 22 * (w / 1200);
    const tagX = left + textW / 2 - tagW / 2;
    const tagY = top - tagH - 10;

    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, tagX + tagW / 2, tagY + tagH / 2);
    ctx.restore();
  }
}

export function initCanvasDrag(previewCanvas, onPositionChange) {
  const getFrac = (e) => {
    const rect = previewCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let xF = (clientX - rect.left) / rect.width;
    let yF = (clientY - rect.top) / rect.height;

    xF = Math.max(0.04, Math.min(0.96, xF));
    yF = Math.max(0.04, Math.min(0.96, yF));
    return { xF, yF };
  };

  const start = (e) => {
    e.preventDefault();
    studioState.isDragging = true;
    const { xF, yF } = getFrac(e);
    studioState.posXFrac = xF;
    studioState.posYFrac = yF;
    onPositionChange();
  };

  const move = (e) => {
    if (!studioState.isDragging) return;
    e.preventDefault();
    const { xF, yF } = getFrac(e);
    studioState.posXFrac = xF;
    studioState.posYFrac = yF;
    onPositionChange();
  };

  const end = () => {
    studioState.isDragging = false;
  };

  previewCanvas.addEventListener('mousedown', start);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);

  previewCanvas.addEventListener('touchstart', start, { passive: false });
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);
}
