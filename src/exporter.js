// High-Resolution Lossless PNG Export Engine for PIXEL POP
import { FILTER_PRESETS } from './assets.js';
import { sound } from './audio.js';

export class PhotostripExporter {
  // Renders the composition onto an offscreen canvas at 300 DPI high-res
  static async renderToCanvas(state, stageElement) {
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
    } catch (_) {}

    const { layout, filter, borderStyle, photos, elements, filename, cardWidth, cardHeight } = state;
    const filterObj = FILTER_PRESETS.find(f => f.id === filter) || FILTER_PRESETS[0];

    // Canvas Dimensions based on layout
    let width = 1200;
    let height = 3600;

    if (layout === 'collage-2x2') {
      width = 2000;
      height = 2000;
    } else if (layout === 'vertical-3') {
      width = 1200;
      height = 2800;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Draw Card Background
    ctx.save();
    if (borderStyle === 'baby-pink') {
      ctx.fillStyle = '#ffebf3';
      ctx.fillRect(0, 0, width, height);
    } else if (borderStyle === 'lilac') {
      ctx.fillStyle = '#f2edff';
      ctx.fillRect(0, 0, width, height);
    } else if (borderStyle === 'glitter') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ffe4f0');
      grad.addColorStop(0.7, '#d9f5ff');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (borderStyle === 'checker') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffd1e6';
      const tileSize = 60;
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
          if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
            ctx.fillRect(x, y, tileSize, tileSize);
          }
        }
      }
    } else {
      // Classic Polaroid White
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    // Outer Border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#2B213A';
    ctx.strokeRect(7, 7, width - 14, height - 14);

    // 2. Draw Header
    const padX = width * 0.08;
    const topMargin = height * 0.035;

    ctx.fillStyle = '#ac2471';
    ctx.font = `bold ${Math.round(width * 0.045)}px 'Epilogue', sans-serif`;
    ctx.fillText('PIXEL POP ★ BOOTH', padX, topMargin + 40);

    // Date badge
    const dateText = 'OCT 2026';
    ctx.font = `bold ${Math.round(width * 0.024)}px 'Space Grotesk', monospace`;
    const dateWidth = ctx.measureText(dateText).width;
    ctx.fillStyle = '#ede4ff';
    ctx.fillRect(width - padX - dateWidth - 28, topMargin + 10, dateWidth + 28, 42);
    ctx.lineWidth = 4;
    ctx.strokeRect(width - padX - dateWidth - 28, topMargin + 10, dateWidth + 28, 42);
    ctx.fillStyle = '#2B213A';
    ctx.fillText(dateText, width - padX - dateWidth - 14, topMargin + 38);

    // Header divider dashed line
    ctx.beginPath();
    ctx.setLineDash([12, 10]);
    ctx.moveTo(padX, topMargin + 75);
    ctx.lineTo(width - padX, topMargin + 75);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(43, 33, 58, 0.4)';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Draw Photos
    const contentTop = topMargin + 105;
    const footerHeight = height * 0.08;
    const availableHeight = height - contentTop - footerHeight;

    const safePhotos = Array.isArray(photos) ? photos : [];
    const loadedImages = await Promise.all(
      safePhotos.map(src => {
        if (!src) return Promise.resolve(null);
        return new Promise(resolve => {
          const img = new Image();
          if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
            img.crossOrigin = 'anonymous';
          }
          const timer = setTimeout(() => resolve(null), 4000);
          img.onload = () => {
            clearTimeout(timer);
            resolve(img);
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve(null);
          };
          img.src = src;
          if (img.complete && img.naturalWidth !== 0) {
            clearTimeout(timer);
            resolve(img);
          }
        });
      })
    );

    if (layout === 'vertical-4' || layout === 'vertical-3') {
      const numSlots = layout === 'vertical-3' ? 3 : 4;
      const slotGap = height * 0.015;
      const slotH = (availableHeight - slotGap * (numSlots - 1)) / numSlots;
      const slotW = width - padX * 2;

      for (let i = 0; i < numSlots; i++) {
        const slotY = contentTop + i * (slotH + slotGap);
        const img = loadedImages[i];
        await this.drawPhotoSlot(ctx, img, padX, slotY, slotW, slotH, filterObj, i + 1);
      }
    } else if (layout === 'collage-2x2') {
      const slotGap = width * 0.03;
      const slotW = (width - padX * 2 - slotGap) / 2;
      const slotH = (availableHeight - slotGap) / 2;

      for (let i = 0; i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const slotX = padX + col * (slotW + slotGap);
        const slotY = contentTop + row * (slotH + slotGap);
        const img = loadedImages[i];
        await this.drawPhotoSlot(ctx, img, slotX, slotY, slotW, slotH, filterObj, i + 1);
      }
    } else {
      // Default to 4 frames
      const slotGap = height * 0.015;
      const slotH = (availableHeight - slotGap * 3) / 4;
      const slotW = width - padX * 2;
      for (let i = 0; i < 4; i++) {
        const slotY = contentTop + i * (slotH + slotGap);
        const img = loadedImages[i];
        await this.drawPhotoSlot(ctx, img, padX, slotY, slotW, slotH, filterObj, i + 1);
      }
    }

    // 4. Draw Footer
    const footerY = height - footerHeight + 10;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2B213A';
    ctx.moveTo(padX, footerY - 15);
    ctx.lineTo(width - padX, footerY - 15);
    ctx.stroke();

    // Footer Ribbon
    ctx.fillStyle = '#ffd8e6';
    ctx.fillRect(padX, footerY, width - padX * 2, footerHeight * 0.5);
    ctx.lineWidth = 4;
    ctx.strokeRect(padX, footerY, width - padX * 2, footerHeight * 0.5);

    ctx.fillStyle = '#2B213A';
    ctx.font = `800 ${Math.round(width * 0.035)}px 'Epilogue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BESTIES FOREVER ★ 2026', width / 2, footerY + footerHeight * 0.35);

    // Sub-footer
    ctx.font = `bold ${Math.round(width * 0.02)}px 'Space Grotesk', monospace`;
    ctx.fillStyle = 'rgba(43, 33, 58, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('AUTHENTIC STRIP #9940', padX + 10, height - 30);
    ctx.textAlign = 'right';
    ctx.fillText('MADE ON PIXEL POP ♥', width - padX - 10, height - 30);
    ctx.restore();

    // 5. Draw Stickers and Text Elements relative to stage card
    let baseCardW = cardWidth;
    let baseCardH = cardHeight;

    if (!baseCardW || !baseCardH || baseCardW <= 0 || baseCardH <= 0) {
      if (stageElement) {
        const cardDom = stageElement.querySelector('#photostrip-card');
        if (cardDom && cardDom.offsetWidth > 0 && cardDom.offsetHeight > 0) {
          baseCardW = cardDom.offsetWidth;
          baseCardH = cardDom.offsetHeight;
        }
      }
    }

    if (!baseCardW || baseCardW <= 0) {
      baseCardW = layout === 'collage-2x2' ? 360 : 300;
    }
    if (!baseCardH || baseCardH <= 0) {
      baseCardH = layout === 'collage-2x2' ? 460 : (layout === 'vertical-3' ? 760 : 980);
    }

    const scaleX = width / baseCardW;
    const scaleY = height / baseCardH;
    const uniformScale = (scaleX + scaleY) / 2;

    if (elements && elements.length > 0) {
      // Sort elements by zIndex to render layers in correct order
      const sortedElements = [...elements].sort((a, b) => (a.zIndex || 10) - (b.zIndex || 10));

      for (const el of sortedElements) {
        if (!el || el.content == null) continue;
        ctx.save();

        const posX = (el.x || 0) * scaleX;
        const posY = (el.y || 0) * scaleY;

        ctx.translate(posX, posY);
        ctx.rotate(((el.rotation || 0) * Math.PI) / 180);

        const elScale = el.scale || 1.0;
        ctx.scale(elScale * uniformScale, elScale * uniformScale);

        if (el.type === 'text') {
          const fontSize = el.fontSize || 18;
          ctx.font = `800 ${fontSize}px '${el.font || 'Epilogue'}', sans-serif`;
          const textContent = String(el.content);
          const metrics = ctx.measureText(textContent);
          const textW = metrics.width || 40;
          const textH = fontSize;

          // Draw pill background
          ctx.fillStyle = el.bg || '#ffffff';
          this.roundRect(ctx, -textW / 2 - 16, -textH / 2 - 8, textW + 32, textH + 16, 20);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#2B213A';
          ctx.stroke();

          // Text
          ctx.fillStyle = el.color || '#ff69b4';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(textContent, 0, 2);
        } else if (el.isBadge) {
          ctx.font = `bold 11px 'Space Grotesk', sans-serif`;
          const badgeContent = String(el.content);
          const metrics = ctx.measureText(badgeContent);
          const badgeW = metrics.width || 30;
          const badgeH = 11;

          ctx.fillStyle = el.bg || '#ffd166';
          this.roundRect(ctx, -badgeW / 2 - 8, -badgeH / 2 - 4, badgeW + 16, badgeH + 8, 10);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#2B213A';
          ctx.stroke();

          ctx.fillStyle = el.color || '#2B213A';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeContent, 0, 1);
        } else {
          // Emoji / Icon Sticker
          ctx.font = '36px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Y2K Retro drop shadow matching CSS: drop-shadow-[2px_2px_0px_#2B213A]
          ctx.shadowColor = '#2B213A';
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 0;

          ctx.fillStyle = el.color || '#2B213A';
          ctx.fillText(String(el.content), 0, 0);

          ctx.shadowColor = 'transparent';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        ctx.restore();
      }
    }

    return canvas;
  }

  // Draw single photo slot with aspect fit / cover and filter
  static async drawPhotoSlot(ctx, img, x, y, w, h, filterObj, slotNum) {
    ctx.save();

    // Clip slot with rounded corners
    ctx.beginPath();
    this.roundRect(ctx, x, y, w, h, 20);
    ctx.clip();

    if (img && img.width > 0 && img.height > 0 && isFinite(img.width) && isFinite(img.height)) {
      // Calculate aspect-fill cropping
      const imgRatio = img.width / img.height;
      const slotRatio = w / h;
      let sW, sH, sX, sY;

      if (imgRatio > slotRatio) {
        sH = img.height;
        sW = img.height * slotRatio;
        sX = (img.width - sW) / 2;
        sY = 0;
      } else {
        sW = img.width;
        sH = img.width / slotRatio;
        sX = 0;
        sY = (img.height - sH) / 2;
      }

      // Apply Canvas Filter safely
      try {
        if (filterObj && filterObj.canvasFilter && filterObj.canvasFilter !== 'none') {
          ctx.filter = filterObj.canvasFilter;
        }
      } catch (_) {}

      try {
        ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);
      } catch (err) {
        console.warn('drawImage failed for slot ' + slotNum, err);
      }

      try {
        ctx.filter = 'none';
      } catch (_) {}

      // Overlay color tint if applicable
      if (filterObj && filterObj.overlay) {
        ctx.fillStyle = filterObj.overlay;
        ctx.globalCompositeOperation = 'color';
        ctx.fillRect(x, y, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }
    } else {
      // Empty slot placeholder
      ctx.fillStyle = '#f2ebff';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#2B213A';
      ctx.font = `bold ${Math.round(w * 0.05)}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`Empty Slot #${slotNum}`, x + w / 2, y + h / 2);
    }

    // Photo slot inner stroke & badge
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2B213A';
    this.roundRect(ctx, x, y, w, h, 20);
    ctx.stroke();

    // Slot badge at bottom right
    const badgeText = `#0${slotNum} • FLASH`;
    ctx.font = `bold ${Math.max(12, Math.round(w * 0.03))}px 'Space Grotesk', monospace`;
    ctx.fillStyle = 'rgba(43, 33, 58, 0.85)';
    const bW = ctx.measureText(badgeText).width + 16;
    const bH = 26;
    ctx.fillRect(x + w - bW - 12, y + h - bH - 12, bW, bH);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, x + w - bW - 4, y + h - 16);

    ctx.restore();
  }

  // Rounded rectangle path helper
  static roundRect(ctx, x, y, w, h, r) {
    if (r < 0) r = 0;
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Trigger Lossless PNG Download
  static downloadPNG(canvas, filename = 'pixel-pop-photostrip.png') {
    if (!canvas) return;
    try {
      sound.playSuccess();
    } catch (_) {}

    const cleanName = (filename && filename.trim()) ? filename.trim() : 'pixel-pop-photostrip.png';
    const finalName = cleanName.toLowerCase().endsWith('.png') ? cleanName : `${cleanName}.png`;

    const triggerDownload = (url, isBlob = false) => {
      const link = document.createElement('a');
      link.download = finalName;
      link.href = url;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        if (isBlob) {
          URL.revokeObjectURL(url);
        }
      }, 1000);
    };

    if (canvas.toBlob) {
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          triggerDownload(url, true);
        } else {
          try {
            const dataUrl = canvas.toDataURL('image/png');
            triggerDownload(dataUrl, false);
          } catch (err) {
            console.error('Download failed:', err);
          }
        }
      }, 'image/png');
    } else {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl, false);
      } catch (err) {
        console.error('Download failed:', err);
      }
    }
  }

  // Copy to Clipboard
  static async copyToClipboard(canvas) {
    if (!canvas) return false;
    return new Promise(resolve => {
      if (!canvas.toBlob) {
        resolve(false);
        return;
      }
      canvas.toBlob(async blob => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            try {
              sound.playSuccess();
            } catch (_) {}
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          console.warn('Clipboard write failed', err);
          resolve(false);
        }
      }, 'image/png');
    });
  }
}

