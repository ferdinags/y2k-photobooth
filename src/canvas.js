// Interactive Creative Scrapbook Editor Engine
import { sound } from './audio.js';
import { FILTER_PRESETS, BORDER_STYLES } from './assets.js';

export class ScrapbookCanvas {
  constructor(canvasContainerElement, options = {}) {
    this.container = canvasContainerElement;
    this.options = options;

    this.photos = [];
    this.layout = 'vertical-4';
    this.filter = 'soft-pink';
    this.borderStyle = 'baby-pink';
    this.elements = []; // Stickers & text layers
    this.selectedElementId = null;
    this.cardWidth = 300;
    this.cardHeight = 980;

    // History for Undo / Redo
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 30;

    // Interaction state
    this.activeDrag = null; // { mode: 'move'|'scale'|'rotate', elementId, startX, startY, origX, origY, origScale, origRot }

    this.initEventListeners();
  }

  getDefaultCardWidth() {
    if (this.layout === 'collage-2x2') return 360;
    return 300;
  }

  getDefaultCardHeight() {
    if (this.layout === 'collage-2x2') return 460;
    if (this.layout === 'vertical-3') return 760;
    return 980;
  }

  initEventListeners() {
    // Pointer interactions
    this.container.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  saveHistory() {
    const snapshot = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      layout: this.layout,
      filter: this.filter,
      borderStyle: this.borderStyle
    };
    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo stack on new action
    if (this.options.onHistoryChange) {
      this.options.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    if (!this.canUndo()) return;
    const currentState = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      layout: this.layout,
      filter: this.filter,
      borderStyle: this.borderStyle
    };
    this.redoStack.push(currentState);

    const prevState = this.undoStack.pop();
    this.elements = prevState.elements;
    this.layout = prevState.layout;
    this.filter = prevState.filter;
    this.borderStyle = prevState.borderStyle;
    this.selectedElementId = null;

    this.render();
    if (this.options.onHistoryChange) {
      this.options.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  redo() {
    if (!this.canRedo()) return;
    const currentState = {
      elements: JSON.parse(JSON.stringify(this.elements)),
      layout: this.layout,
      filter: this.filter,
      borderStyle: this.borderStyle
    };
    this.undoStack.push(currentState);

    const nextState = this.redoStack.pop();
    this.elements = nextState.elements;
    this.layout = nextState.layout;
    this.filter = nextState.filter;
    this.borderStyle = nextState.borderStyle;
    this.selectedElementId = null;

    this.render();
    if (this.options.onHistoryChange) {
      this.options.onHistoryChange(this.canUndo(), this.canRedo());
    }
  }

  reset() {
    this.saveHistory();
    this.elements = [];
    this.selectedElementId = null;
    this.render();
  }

  setPhotos(photos) {
    this.photos = [...photos];
    this.render();
  }

  setLayout(layoutId) {
    this.saveHistory();
    this.layout = layoutId;
    this.render();
  }

  setFilter(filterId) {
    this.saveHistory();
    this.filter = filterId;
    this.render();
  }

  setBorderStyle(styleId) {
    this.saveHistory();
    this.borderStyle = styleId;
    this.render();
  }

  // Add Sticker to Canvas
  addSticker(sticker) {
    this.saveHistory();
    sound.playPop();

    // Centered placement relative to photostrip card
    const cardDom = this.container.querySelector('#photostrip-card');
    const cardW = (cardDom && cardDom.offsetWidth > 0) ? cardDom.offsetWidth : this.getDefaultCardWidth();
    const cardH = (cardDom && cardDom.offsetHeight > 0) ? cardDom.offsetHeight : this.getDefaultCardHeight();

    const centerX = cardW / 2 + (Math.random() * 40 - 20);
    const centerY = cardH / 2 + (Math.random() * 60 - 30);

    const newElement = {
      id: 'el_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'sticker',
      stickerId: sticker.id,
      content: sticker.content,
      isEmoji: sticker.type === 'emoji',
      isBadge: sticker.isBadge || sticker.type === 'badge',
      bg: sticker.bg || 'transparent',
      color: sticker.color || '#2B213A',
      x: Math.round(centerX),
      y: Math.round(centerY),
      scale: 1.0,
      rotation: Math.floor(Math.random() * 20 - 10), // slight Y2K natural tilt
      zIndex: this.elements.length + 10
    };

    this.elements.push(newElement);
    this.selectedElementId = newElement.id;
    this.render();

    if (this.options.onSelectElement) {
      this.options.onSelectElement(newElement);
    }
  }

  // Add Custom Text Sticker to Canvas
  addText(text = 'PIXEL POP ★', font = 'Epilogue', color = '#FF69B4', bg = '#FFFFFF') {
    this.saveHistory();
    sound.playPop();

    const cardDom = this.container.querySelector('#photostrip-card');
    const cardW = (cardDom && cardDom.offsetWidth > 0) ? cardDom.offsetWidth : this.getDefaultCardWidth();
    const cardH = (cardDom && cardDom.offsetHeight > 0) ? cardDom.offsetHeight : this.getDefaultCardHeight();

    const centerX = cardW / 2;
    const centerY = cardH / 2;

    const newElement = {
      id: 'el_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: 'text',
      content: text,
      font: font,
      fontSize: 18,
      color: color,
      bg: bg,
      stroke: true,
      x: Math.round(centerX),
      y: Math.round(centerY),
      scale: 1.0,
      rotation: 0,
      zIndex: this.elements.length + 10
    };

    this.elements.push(newElement);
    this.selectedElementId = newElement.id;
    this.render();

    if (this.options.onSelectElement) {
      this.options.onSelectElement(newElement);
    }
  }

  updateSelectedElement(updates) {
    if (!this.selectedElementId) return;
    const el = this.elements.find(e => e.id === this.selectedElementId);
    if (!el) return;

    this.saveHistory();
    Object.assign(el, updates);
    this.render();
  }

  deleteSelectedElement() {
    if (!this.selectedElementId) return;
    this.saveHistory();
    this.elements = this.elements.filter(e => e.id !== this.selectedElementId);
    this.selectedElementId = null;
    this.render();

    if (this.options.onSelectElement) {
      this.options.onSelectElement(null);
    }
  }

  bringSelectedToFront() {
    if (!this.selectedElementId) return;
    this.saveHistory();
    const el = this.elements.find(e => e.id === this.selectedElementId);
    if (!el) return;
    const maxZ = Math.max(...this.elements.map(e => e.zIndex || 0), 10);
    el.zIndex = maxZ + 1;
    this.render();
  }

  sendSelectedToBack() {
    if (!this.selectedElementId) return;
    this.saveHistory();
    const el = this.elements.find(e => e.id === this.selectedElementId);
    if (!el) return;
    const minZ = Math.min(...this.elements.map(e => e.zIndex || 0), 10);
    el.zIndex = Math.max(1, minZ - 1);
    this.render();
  }

  handleKeyDown(e) {
    if (!this.selectedElementId) return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    const el = this.elements.find(item => item.id === this.selectedElementId);
    if (!el) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.deleteSelectedElement();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      el.y -= e.shiftKey ? 10 : 2;
      this.render();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      el.y += e.shiftKey ? 10 : 2;
      this.render();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      el.x -= e.shiftKey ? 10 : 2;
      this.render();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      el.x += e.shiftKey ? 10 : 2;
      this.render();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      this.redo();
    }
  }

  handlePointerDown(e) {
    const handle = e.target.closest('[data-handle]');
    if (handle) {
      e.stopPropagation();
      const mode = handle.dataset.handle; // 'scale' | 'rotate' | 'delete'
      const elementId = handle.dataset.elementId;
      const el = this.elements.find(item => item.id === elementId);
      if (!el) return;

      if (mode === 'delete') {
        this.deleteSelectedElement();
        return;
      }

      this.activeDrag = {
        mode,
        elementId,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origScale: el.scale,
        origRot: el.rotation
      };
      return;
    }

    const elementDom = e.target.closest('[data-element-id]');
    if (elementDom) {
      e.stopPropagation();
      const elementId = elementDom.dataset.elementId;
      this.selectedElementId = elementId;
      const el = this.elements.find(item => item.id === elementId);

      this.activeDrag = {
        mode: 'move',
        elementId,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y
      };

      this.render();
      if (this.options.onSelectElement) {
        this.options.onSelectElement(el);
      }
      return;
    }

    // Clicked blank space -> deselect
    if (this.selectedElementId) {
      this.selectedElementId = null;
      this.render();
      if (this.options.onSelectElement) {
        this.options.onSelectElement(null);
      }
    }
  }

  handlePointerMove(e) {
    if (!this.activeDrag) return;
    const { mode, elementId, startX, startY, origX, origY, origScale, origRot } = this.activeDrag;
    const el = this.elements.find(item => item.id === elementId);
    if (!el) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (mode === 'move') {
      el.x = origX + deltaX;
      el.y = origY + deltaY;
    } else if (mode === 'scale') {
      const distance = Math.hypot(deltaX, deltaY);
      const direction = deltaX + deltaY > 0 ? 1 : -1;
      const scaleDelta = (direction * distance) / 100;
      el.scale = Math.max(0.4, Math.min(3.5, origScale + scaleDelta));
    } else if (mode === 'rotate') {
      const elDom = this.container.querySelector(`[data-element-id="${elementId}"]`);
      if (elDom) {
        const rect = elDom.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let deg = (rad * 180) / Math.PI + 90; // offset for top handle
        el.rotation = Math.round(deg);
      }
    }

    this.render();
  }

  handlePointerUp() {
    if (this.activeDrag) {
      this.saveHistory();
      this.activeDrag = null;
    }
  }

  // Main Render Function
  render() {
    const activeFilterObj = FILTER_PRESETS.find(f => f.id === this.filter) || FILTER_PRESETS[0];

    // Build the Photostrip Card DOM
    let cardClasses = 'bg-white p-3 md:p-4 rounded-xl border-2 border-ink-dark shadow-y2k-lg relative transition-all mx-auto';
    let cardStyle = '';

    if (this.borderStyle === 'baby-pink') {
      cardStyle += 'background-color: #ffebf3;';
    } else if (this.borderStyle === 'lilac') {
      cardStyle += 'background-color: #f2edff;';
    } else if (this.borderStyle === 'glitter') {
      cardClasses += ' holo-sheen';
      cardStyle += 'background-color: #ffffff;';
    } else if (this.borderStyle === 'checker') {
      cardStyle += 'background-color: #ffffff; background-image: repeating-conic-gradient(#ffffff 0% 25%, #ffb7d5 0% 50%) 50% / 20px 20px;';
    } else {
      cardStyle += 'background-color: #ffffff;';
    }

    // Layout configuration
    let gridHtml = '';
    const photoCount = this.layout === 'vertical-3' ? 3 : 4;
    const activePhotos = this.photos.slice(0, photoCount);
    while (activePhotos.length < photoCount) {
      activePhotos.push(null);
    }

    if (this.layout === 'vertical-4') {
      // 4-Frame classic vertical strip
      gridHtml = `
        <div class="w-[260px] sm:w-[300px] flex flex-col gap-2.5">
          ${activePhotos.map((photo, i) => this.renderPhotoSlot(photo, i, 'aspect-[4/3]', activeFilterObj)).join('')}
        </div>
      `;
    } else if (this.layout === 'collage-2x2') {
      // 2x2 Square collage
      gridHtml = `
        <div class="w-[320px] sm:w-[380px] grid grid-cols-2 gap-2">
          ${activePhotos.map((photo, i) => this.renderPhotoSlot(photo, i, 'aspect-square', activeFilterObj)).join('')}
        </div>
      `;
    } else if (this.layout === 'vertical-3') {
      // 3-Frame Mini strip
      gridHtml = `
        <div class="w-[260px] sm:w-[300px] flex flex-col gap-3">
          ${activePhotos.slice(0, 3).map((photo, i) => this.renderPhotoSlot(photo, i, 'aspect-[4/3]', activeFilterObj)).join('')}
        </div>
      `;
    }

    // Date header & bottom stamps
    const headerHtml = `
      <div class="flex items-center justify-between pb-2 mb-2 border-b-2 border-dashed border-ink-dark/30">
        <span class="text-label-sm font-label-sm font-black tracking-widest text-primary flex items-center gap-1">
          <span>PIXEL POP</span>
          <span class="text-bubblegum-hot">★</span>
          <span>BOOTH</span>
        </span>
        <span class="text-[10px] font-label-sm font-bold text-ink-dark bg-surface-container px-1.5 py-0.5 rounded border border-ink-dark">
          OCT 2026
        </span>
      </div>
    `;

    const footerHtml = `
      <div class="mt-2.5 pt-2 border-t-2 border-ink-dark flex flex-col gap-1 text-center">
        <div class="bg-primary-fixed border border-ink-dark rounded py-0.5 px-2 shadow-y2k-sm">
          <p class="font-headline-md text-[13px] text-ink-dark font-extrabold tracking-wider uppercase">
            BESTIES FOREVER ★ 2026
          </p>
        </div>
        <div class="flex items-center justify-between text-[8px] font-label-sm text-ink-dark/70 px-1 font-mono font-bold">
          <span>STRIP #9940</span>
          <span>MADE ON PIXEL POP ♥</span>
        </div>
      </div>
    `;

    // Render Stickers & Text layers
    const elementsHtml = this.elements.map(el => this.renderElement(el)).join('');

    // Put everything together
    this.container.innerHTML = `
      <div class="relative w-full h-full min-h-[640px] flex items-center justify-center p-4 select-none overflow-hidden" id="canvas-stage">
        <!-- Floating Photostrip Card -->
        <div class="${cardClasses}" style="${cardStyle}" id="photostrip-card">
          <!-- Washi tape at top -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 washi-tape -rotate-1 rounded border border-ink-dark/30 z-10"></div>
          ${headerHtml}
          ${gridHtml}
          ${footerHtml}
          <!-- Scrapbook Free Stickers / Floating Elements Layer mounted directly on Card -->
          <div class="absolute inset-0 pointer-events-none z-20" id="stickers-layer">
            ${elementsHtml}
          </div>
          <!-- Gloss sheen -->
          <div class="absolute inset-0 bubble-gloss pointer-events-none rounded-xl z-30"></div>
        </div>
      </div>
    `;

    // Cache card dimensions for export engine
    const cardDom = this.container.querySelector('#photostrip-card');
    if (cardDom && cardDom.offsetWidth > 0) {
      this.cardWidth = cardDom.offsetWidth;
      this.cardHeight = cardDom.offsetHeight;
    } else {
      this.cardWidth = this.getDefaultCardWidth();
      this.cardHeight = this.getDefaultCardHeight();
    }
  }

  renderPhotoSlot(photo, index, aspectClass, filterObj) {
    const filterStyle = filterObj ? `filter: ${filterObj.cssFilter};` : '';
    const overlayHtml = filterObj && filterObj.overlay ? `<div class="absolute inset-0 pointer-events-none" style="background: ${filterObj.overlay}; mix-blend-mode: color;"></div>` : '';

    if (!photo) {
      return `
        <div class="relative rounded-lg border-2 border-dashed border-ink-dark/50 ${aspectClass} bg-surface-container-high/60 flex flex-col items-center justify-center text-ink-dark/60 gap-1 overflow-hidden">
          <span class="material-symbols-outlined text-[26px]">photo_camera</span>
          <span class="font-label-sm text-label-sm font-bold">Pose 0${index + 1} Empty</span>
        </div>
      `;
    }

    return `
      <div class="relative rounded-lg border-2 border-ink-dark ${aspectClass} overflow-hidden bg-ink-dark shadow-sm group">
        <img src="${photo}" class="w-full h-full object-cover transition-transform duration-300" style="${filterStyle}" alt="Pose 0${index + 1}"/>
        ${overlayHtml}
        <span class="absolute bottom-1 right-1 text-[9px] font-label-sm font-bold text-white bg-ink-dark/80 px-1 py-0.5 rounded border border-white/30 backdrop-blur-xs">
          #0${index + 1} • POSE
        </span>
      </div>
    `;
  }

  renderElement(el) {
    const isSelected = el.id === this.selectedElementId;
    const transform = `translate(${el.x}px, ${el.y}px) translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scale})`;
    
    let contentHtml = '';
    if (el.type === 'text') {
      contentHtml = `
        <div class="px-3 py-1 rounded-full border-2 border-ink-dark font-extrabold shadow-y2k-sm whitespace-nowrap text-center select-none"
             style="font-family: ${el.font}, sans-serif; font-size: ${el.fontSize}px; color: ${el.color}; background-color: ${el.bg};">
          ${el.content}
        </div>
      `;
    } else if (el.isBadge) {
      contentHtml = `
        <div class="px-2.5 py-0.5 rounded-full border-2 border-ink-dark text-[11px] font-bold shadow-y2k-sm whitespace-nowrap tracking-wide select-none leading-normal"
             style="background-color: ${el.bg}; color: ${el.color}; font-family: 'Space Grotesk', sans-serif;">
          ${el.content}
        </div>
      `;
    } else {
      contentHtml = `
        <div class="text-4xl filter drop-shadow-[2px_2px_0px_#2B213A] select-none hover:scale-105 transition-transform">
          ${el.content}
        </div>
      `;
    }

    // Bounding box controls for selected element
    let boundingBoxHtml = '';
    if (isSelected) {
      boundingBoxHtml = `
        <div class="absolute -inset-2 border-2 border-dashed border-primary pointer-events-none rounded-lg z-30">
          <!-- Top Rotation Handle -->
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-mint-pop border-2 border-ink-dark shadow-sm flex items-center justify-center cursor-grab pointer-events-auto hover:scale-125 transition-transform"
               data-handle="rotate" data-element-id="${el.id}" title="Drag to Rotate">
            <span class="material-symbols-outlined text-[12px] text-ink-dark font-bold">sync</span>
          </div>
          <!-- Delete button top-right -->
          <div class="absolute -top-3.5 -right-3.5 w-5 h-5 rounded-full bg-error text-white border-2 border-ink-dark shadow-sm flex items-center justify-center cursor-pointer pointer-events-auto hover:scale-125 transition-transform"
               data-handle="delete" data-element-id="${el.id}" title="Delete">
            <span class="text-[10px] font-bold">✕</span>
          </div>
          <!-- Corner Scale Handles -->
          <div class="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-sticker-yellow border-2 border-ink-dark shadow-sm cursor-nwse-resize pointer-events-auto hover:scale-125"
               data-handle="scale" data-element-id="${el.id}" title="Drag to Resize"></div>
          <div class="absolute -bottom-2 -left-2 w-3.5 h-3.5 rounded-full bg-baby-blue border-2 border-ink-dark shadow-sm cursor-nesw-resize pointer-events-auto hover:scale-125"
               data-handle="scale" data-element-id="${el.id}" title="Drag to Resize"></div>
          <div class="absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full bg-baby-blue border-2 border-ink-dark shadow-sm cursor-nwse-resize pointer-events-auto hover:scale-125"
               data-handle="scale" data-element-id="${el.id}" title="Drag to Resize"></div>
        </div>
      `;
    }

    return `
      <div class="absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow"
           style="transform: ${transform}; z-index: ${el.zIndex || 10};"
           data-element-id="${el.id}">
        ${contentHtml}
        ${boundingBoxHtml}
      </div>
    `;
  }
}
