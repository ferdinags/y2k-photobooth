// PIXEL POP — Main Application Controller
import { sound } from './audio.js';
import { DEFAULT_PHOTOS, STICKER_COLLECTION, FILTER_PRESETS, LAYOUT_PRESETS, BORDER_STYLES, BACKDROP_STYLES } from './assets.js';
import { CameraManager } from './camera.js';
import { ScrapbookCanvas } from './canvas.js';
import { PhotostripExporter } from './exporter.js';

class PixelPopApp {
  constructor() {
    this.currentView = 'home';
    this.photos = [...DEFAULT_PHOTOS]; // Initialize with high quality demo photos
    this.activeStudioSlot = 0;
    this.isCapturingSequence = false;
    this.activeTool = 'layouts';

    // Core Engines
    this.camera = null;
    this.canvas = null;
    this.exportedCanvas = null;
    this.isExporting = false;
    this.currentBackdrop = 'dot-matrix';

    // Design state
    this.filename = 'pixel_pop_20261023.png';

    this.init();
  }

  async init() {
    this.initNavigation();
    this.initStudio();
    this.initEditor();
    this.initExportView();
    this.initModals();

    // Set initial view from URL hash or default to home
    const hash = window.location.hash.replace('#', '');
    if (['home', 'studio', 'editor', 'result'].includes(hash)) {
      this.switchView(hash);
    } else {
      this.switchView('home');
    }

    // Populate sticker teaser on landing page
    this.initHomeTeaser();
  }

  // ================= NAVIGATION & ROUTING =================
  initNavigation() {
    // Brand & Top Navigation
    document.getElementById('nav-brand')?.addEventListener('click', () => this.switchView('home'));
    document.getElementById('nav-home')?.addEventListener('click', () => this.switchView('home'));
    document.getElementById('nav-studio')?.addEventListener('click', () => this.switchView('studio'));
    document.getElementById('nav-editor')?.addEventListener('click', () => this.switchView('editor'));
    document.getElementById('btn-start-booth')?.addEventListener('click', () => this.switchView('studio'));
    document.getElementById('hero-btn-start')?.addEventListener('click', () => this.switchView('studio'));
    document.getElementById('bottom-btn-camera')?.addEventListener('click', () => this.switchView('studio'));
    document.getElementById('bottom-btn-upload')?.addEventListener('click', () => {
      this.switchView('studio');
      this.setStudioMode('upload');
    });

    // Wizard Step Buttons
    document.getElementById('step-btn-1')?.addEventListener('click', () => this.switchView('studio'));
    document.getElementById('step-btn-2')?.addEventListener('click', () => this.switchView('editor'));
    document.getElementById('step-btn-3')?.addEventListener('click', () => {
      this.openExportView();
    });

    // Sound Toggle
    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      const isEnabled = sound.toggle();
      const icon = document.getElementById('sound-icon');
      if (icon) {
        icon.textContent = isEnabled ? 'volume_up' : 'volume_off';
      }
      this.showToast(isEnabled ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇');
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Toggle view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`view-${viewName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Update wizard steps highlight
    this.updateWizardSteps(viewName);

    // Life-cycle triggers
    if (viewName === 'studio') {
      this.onEnterStudio();
    } else {
      if (this.camera) {
        this.camera.stopStream();
      }
    }

    if (viewName === 'editor') {
      this.onEnterEditor();
    }

    if (viewName === 'result') {
      if (!this.exportedCanvas && !this.isExporting) {
        this.openExportView();
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateWizardSteps(viewName) {
    const s1 = document.getElementById('step-btn-1');
    const s2 = document.getElementById('step-btn-2');
    const s3 = document.getElementById('step-btn-3');
    if (!s1 || !s2 || !s3) return;

    // Reset styles
    [s1, s2, s3].forEach(btn => {
      btn.className = 'flex items-center gap-1.5 px-space-sm py-0.5 text-on-surface-variant font-label-md text-label-md transition-all';
      const badge = btn.querySelector('span:first-child');
      if (badge) badge.className = 'w-4 h-4 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[10px]';
    });

    let activeBtn = s1;
    if (viewName === 'editor') activeBtn = s2;
    if (viewName === 'result') activeBtn = s3;

    activeBtn.className = 'flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-inner transition-all';
    const activeBadge = activeBtn.querySelector('span:first-child');
    if (activeBadge) activeBadge.className = 'w-4 h-4 rounded-full bg-chrome-shine text-primary flex items-center justify-center text-[10px] font-extrabold';
  }

  // ================= STUDIO (CAPTURE & UPLOAD) =================
  initStudio() {
    const video = document.getElementById('webcam-video');
    const flashOverlay = document.getElementById('camera-flash-overlay');
    this.camera = new CameraManager(video, flashOverlay);

    // Mode tabs: Webcam vs Upload
    document.getElementById('tab-webcam')?.addEventListener('click', () => this.setStudioMode('webcam'));
    document.getElementById('tab-upload')?.addEventListener('click', () => this.setStudioMode('upload'));
    document.getElementById('btn-switch-upload-link')?.addEventListener('click', () => this.setStudioMode('upload'));

    // Camera control buttons
    document.getElementById('btn-toggle-flash')?.addEventListener('click', () => {
      const enabled = this.camera.toggleFlash();
      const text = document.getElementById('flash-status-text');
      if (text) text.textContent = `Flash: ${enabled ? 'ON' : 'OFF'}`;
      this.showToast(enabled ? 'Camera Flash: ON ⚡' : 'Camera Flash: OFF');
    });

    document.getElementById('btn-toggle-mirror')?.addEventListener('click', () => {
      this.camera.toggleMirror();
    });

    // Snap Sequence: 4 Photos with 3s Timer
    document.getElementById('btn-snap-sequence')?.addEventListener('click', () => {
      this.runSnapSequence();
    });

    // Single Snap Button
    document.getElementById('btn-single-snap')?.addEventListener('click', () => {
      this.snapSinglePhoto(this.activeStudioSlot);
      this.activeStudioSlot = (this.activeStudioSlot + 1) % 4;
    });

    // Clear All Photos Button
    document.getElementById('btn-clear-all-photos')?.addEventListener('click', () => {
      this.photos = [null, null, null, null];
      this.renderStudioSlots();
      this.showToast('Cleared all photos. Ready for new shots! 📸');
    });

    // Continue to Editor CTA
    document.getElementById('btn-continue-editor')?.addEventListener('click', () => {
      // Ensure we have at least 1 photo, fill empty with demo photos if needed
      const hasAnyPhoto = this.photos.some(p => p !== null);
      if (!hasAnyPhoto) {
        this.photos = [...DEFAULT_PHOTOS];
      } else {
        // Fill remaining empty slots with the first taken photo or demo photos
        const firstValid = this.photos.find(p => p !== null) || DEFAULT_PHOTOS[0];
        this.photos = this.photos.map(p => p || firstValid);
      }
      this.switchView('editor');
    });

    // Quick Vibe Filters in Studio
    document.querySelectorAll('[data-quick-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterId = e.currentTarget.dataset.quickFilter;
        document.querySelectorAll('[data-quick-filter]').forEach(b => {
          b.className = 'px-2.5 py-1 rounded-full border border-ink-dark bg-white hover:bg-surface text-ink-dark';
        });
        e.currentTarget.className = 'px-2.5 py-1 rounded-full border border-ink-dark bg-cyber-sky text-ink-dark font-bold shadow-y2k-sm';
        
        const filterObj = FILTER_PRESETS.find(f => f.id === filterId);
        if (filterObj && video) {
          video.style.filter = filterObj.cssFilter;
        }
      });
    });

    // File Upload Drag & Drop and File Picker
    this.initUploadHandler();
  }

  async onEnterStudio() {
    this.renderStudioSlots();
    await this.camera.init();
    await this.camera.startStream();

    // Populate camera devices dropdown
    const select = document.getElementById('camera-device-select');
    if (select && this.camera.devices.length > 0) {
      select.innerHTML = this.camera.devices.map((d, i) => `
        <option value="${d.deviceId}">${d.label || `Camera ${i + 1}`}</option>
      `).join('');
      select.onchange = (e) => {
        this.camera.startStream(e.target.value);
      };
    }
  }

  setStudioMode(mode) {
    const tabWebcam = document.getElementById('tab-webcam');
    const tabUpload = document.getElementById('tab-upload');
    const dropzone = document.getElementById('upload-dropzone');
    const title = document.getElementById('viewfinder-window-title');

    if (mode === 'webcam') {
      tabWebcam.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-space-md py-1.5 rounded-full bg-cyber-sky border-2 border-ink-dark text-ink-dark font-title-md text-title-md shadow-y2k-sm transition-all';
      tabUpload.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-space-md py-1.5 rounded-full text-on-surface-variant font-title-md text-title-md hover:text-primary transition-all';
      dropzone.classList.add('hidden');
      if (title) title.textContent = 'DIGITAL-EYE 2000 PRO // WEBCAM STREAM';
      this.camera.startStream();
    } else {
      tabUpload.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-space-md py-1.5 rounded-full bg-bubblegum-hot border-2 border-ink-dark text-white font-title-md text-title-md shadow-y2k-sm transition-all';
      tabWebcam.className = 'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-space-md py-1.5 rounded-full text-on-surface-variant font-title-md text-title-md hover:text-primary transition-all';
      dropzone.classList.remove('hidden');
      if (title) title.textContent = 'IMAGE IMPORT // LOCAL FILES';
      this.camera.stopStream();
    }
  }

  initUploadHandler() {
    const fileInput = document.getElementById('file-upload-input');
    const browseBtn = document.getElementById('btn-browse-files');
    const dropzone = document.getElementById('upload-dropzone');

    browseBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-primary', 'bg-pink-50');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-primary', 'bg-pink-50');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-primary', 'bg-pink-50');
        this.handleFiles(e.dataTransfer.files);
      });
    }
  }

  handleFiles(files) {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4);

    if (validFiles.length === 0) {
      this.showToast('⚠️ Please upload valid image files (PNG, JPG, WebP)');
      return;
    }

    let loadedCount = 0;
    validFiles.forEach((file, idx) => {
      if (file.size > 15 * 1024 * 1024) {
        this.showToast(`⚠️ File "${file.name}" exceeds 15MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photos[idx] = e.target.result;
        loadedCount++;
        this.renderStudioSlots();
        if (loadedCount === validFiles.length) {
          this.showToast(`✨ Successfully imported ${loadedCount} photo(s)!`);
          sound.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // 4-Pose Countdown Sequence
  async runSnapSequence() {
    if (this.isCapturingSequence) return;
    this.isCapturingSequence = true;

    for (let slot = 0; slot < 4; slot++) {
      this.activeStudioSlot = slot;
      await this.runCountdown(slot + 1);
      this.snapSinglePhoto(slot);
      if (slot < 3) {
        await new Promise(r => setTimeout(r, 900)); // Brief pause between poses
      }
    }

    this.isCapturingSequence = false;
    sound.playSuccess();
    this.showToast('🎉 All 4 poses captured! Ready for editor.');
  }

  runCountdown(poseNumber) {
    return new Promise(resolve => {
      const overlay = document.getElementById('countdown-overlay');
      const numberEl = document.getElementById('countdown-number');
      const labelEl = document.getElementById('countdown-label');
      if (!overlay || !numberEl || !labelEl) {
        resolve();
        return;
      }

      overlay.classList.remove('hidden');
      labelEl.textContent = `Get ready for Pose #${poseNumber}!`;

      let count = 3;
      numberEl.textContent = count;
      sound.playBeep(440, 0.12);

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          numberEl.textContent = count;
          sound.playBeep(440, 0.12);
        } else {
          clearInterval(timer);
          overlay.classList.add('hidden');
          resolve();
        }
      }, 950);
    });
  }

  snapSinglePhoto(slotIndex) {
    const dataUrl = this.camera.captureFrame(slotIndex);
    this.photos[slotIndex] = dataUrl;
    this.renderStudioSlots();
    this.showToast(`📸 Snapped Pose #${slotIndex + 1}!`);
  }

  renderStudioSlots() {
    const container = document.getElementById('slots-container');
    const badge = document.getElementById('slots-count-badge');
    if (!container) return;

    const filledCount = this.photos.filter(p => p !== null).length;
    if (badge) {
      badge.textContent = `${filledCount}/4 READY`;
      badge.className = filledCount === 4
        ? 'text-label-sm font-label-sm bg-mint-pop text-ink-dark px-2 py-0.5 rounded-full font-bold border border-ink-dark'
        : 'text-label-sm font-label-sm bg-bubblegum-soft text-ink-dark px-2 py-0.5 rounded-full font-bold border border-ink-dark';
    }

    const slotLabels = ['Wink & Peace', 'Cute Silly', 'Heart Hands', 'Forever Smile'];

    container.innerHTML = this.photos.map((photo, i) => {
      const hasPhoto = photo !== null;
      return `
        <div class="border-2 border-ink-dark rounded-xl p-2.5 bg-white shadow-y2k-sm flex items-center justify-between gap-3 ${this.activeStudioSlot === i ? 'ring-2 ring-primary ring-offset-1' : ''}">
          <div class="flex items-center gap-2.5">
            <div class="w-12 h-12 rounded-lg border border-ink-dark overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
              ${hasPhoto
                ? `<img src="${photo}" class="w-full h-full object-cover"/>`
                : `<span class="material-symbols-outlined text-[20px] text-on-surface-variant">photo_camera</span>`}
            </div>
            <div>
              <p class="text-xs font-bold text-ink-dark">Pose 0${i + 1}: ${slotLabels[i]}</p>
              <p class="text-[10px] text-on-surface-variant font-mono">
                ${hasPhoto ? 'Ready to Edit' : 'Waiting for Shutter...'}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="px-2 py-1 rounded-full border border-ink-dark bg-surface-container hover:bg-surface-bright text-[11px] font-bold text-ink-dark flex items-center gap-0.5" data-retake-slot="${i}">
              <span class="material-symbols-outlined text-[12px]">replay</span>
              <span>Retake</span>
            </button>
            ${hasPhoto ? `
              <button class="p-1 text-on-surface-variant hover:text-error transition-colors" data-delete-slot="${i}" title="Delete">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Attach retake & delete listeners
    container.querySelectorAll('[data-retake-slot]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const slot = parseInt(e.currentTarget.dataset.retakeSlot, 10);
        this.activeStudioSlot = slot;
        await this.runCountdown(slot + 1);
        this.snapSinglePhoto(slot);
      });
    });

    container.querySelectorAll('[data-delete-slot]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slot = parseInt(e.currentTarget.dataset.deleteSlot, 10);
        this.photos[slot] = null;
        this.renderStudioSlots();
      });
    });
  }

  // ================= CREATIVE SCRAPBOOK EDITOR =================
  initEditor() {
    const canvasContainer = document.getElementById('scrapbook-canvas-container');
    this.canvas = new ScrapbookCanvas(canvasContainer, {
      onSelectElement: (el) => this.onCanvasElementSelected(el),
      onHistoryChange: (canUndo, canRedo) => this.updateHistoryButtons(canUndo, canRedo)
    });

    // Top Bar controls
    document.getElementById('btn-back-to-studio')?.addEventListener('click', () => this.switchView('studio'));
    document.getElementById('btn-undo')?.addEventListener('click', () => this.canvas.undo());
    document.getElementById('btn-redo')?.addEventListener('click', () => this.canvas.redo());
    document.getElementById('btn-reset-canvas')?.addEventListener('click', () => {
      document.getElementById('modal-reset-confirm')?.classList.remove('hidden');
    });

    // Filename input
    const filenameInput = document.getElementById('strip-filename-input');
    filenameInput?.addEventListener('input', (e) => {
      this.filename = e.target.value.trim() || 'pixel_pop.png';
    });

    // Export button in top bar
    document.getElementById('btn-open-export')?.addEventListener('click', () => {
      this.openExportView();
    });

    // Tool Rail buttons
    document.querySelectorAll('.tool-rail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tool = e.currentTarget.dataset.tool;
        this.setActiveTool(tool);
      });
    });

    // Selected Element Controls in Drawer
    document.getElementById('slider-element-scale')?.addEventListener('input', (e) => {
      this.canvas.updateSelectedElement({ scale: parseFloat(e.target.value) });
    });
    document.getElementById('slider-element-rot')?.addEventListener('input', (e) => {
      this.canvas.updateSelectedElement({ rotation: parseInt(e.target.value, 10) });
    });
    document.getElementById('btn-layer-up')?.addEventListener('click', () => this.canvas.bringSelectedToFront());
    document.getElementById('btn-layer-down')?.addEventListener('click', () => this.canvas.sendSelectedToBack());
    document.getElementById('btn-delete-element')?.addEventListener('click', () => this.canvas.deleteSelectedElement());

    // Retake All from editor
    document.getElementById('btn-retake-all-from-editor')?.addEventListener('click', () => {
      this.switchView('studio');
    });

    this.setActiveTool('layouts');
  }

  onEnterEditor() {
    this.canvas.setPhotos(this.photos);
    this.renderEditorBottomReel();
    if (this.currentBackdrop) {
      this.setBackdrop(this.currentBackdrop, false);
    }
  }

  setBackdrop(backdropId, playAudio = true) {
    const backdropObj = BACKDROP_STYLES.find(b => b.id === backdropId) || BACKDROP_STYLES[0];
    this.currentBackdrop = backdropObj.id;
    if (playAudio) {
      sound.playPop();
    }

    const stage = document.getElementById('editor-canvas-stage');
    if (stage) {
      const allCssClasses = BACKDROP_STYLES.map(b => b.cssClass);
      stage.classList.remove(...allCssClasses);
      stage.classList.add(backdropObj.cssClass);
    }
  }

  updateHistoryButtons(canUndo, canRedo) {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = !canUndo;
    if (btnRedo) btnRedo.disabled = !canRedo;
  }

  setActiveTool(toolName) {
    this.activeTool = toolName;

    // Highlight active tool button in rail
    document.querySelectorAll('.tool-rail-btn').forEach(btn => {
      if (btn.dataset.tool === toolName) {
        btn.className = 'tool-rail-btn w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 border-ink-dark bg-cyber-sky text-ink-dark shadow-y2k-sm transition-all scale-105';
      } else {
        btn.className = 'tool-rail-btn w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 border-2 border-transparent hover:border-ink-dark hover:bg-white text-ink-dark transition-all';
      }
    });

    // Render inspector content based on active tool
    this.renderInspectorContent(toolName);
  }

  renderInspectorContent(toolName) {
    const container = document.getElementById('inspector-content');
    if (!container) return;

    if (toolName === 'layouts') {
      container.innerHTML = `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-ink-dark/20 pb-1.5">
            <span class="font-headline-md text-xs font-bold text-ink-dark">Strip Layout</span>
            <span class="text-[10px] font-bold text-primary">3 Presets</span>
          </div>
          <div class="grid grid-cols-1 gap-2">
            ${LAYOUT_PRESETS.map(l => `
              <button class="border-2 border-ink-dark p-2.5 rounded-xl bg-white shadow-y2k-sm hover:scale-102 transition-transform text-left flex items-center justify-between ${this.canvas.layout === l.id ? 'bg-cyber-sky/30 ring-2 ring-primary' : ''}" data-layout-choice="${l.id}">
                <div>
                  <p class="text-xs font-bold text-ink-dark">${l.name}</p>
                  <p class="text-[10px] text-on-surface-variant">${l.desc}</p>
                </div>
                <span class="text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded border border-ink-dark">${l.tag}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      container.querySelectorAll('[data-layout-choice]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.canvas.setLayout(e.currentTarget.dataset.layoutChoice);
          this.renderInspectorContent('layouts');
        });
      });

    } else if (toolName === 'filters') {
      container.innerHTML = `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-ink-dark/20 pb-1.5">
            <span class="font-headline-md text-xs font-bold text-ink-dark">Color Tone & Filter</span>
            <span class="text-[10px] font-bold text-bubblegum-hot">★ Active</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            ${FILTER_PRESETS.map(f => `
              <button class="border-2 border-ink-dark p-2 rounded-xl bg-white shadow-y2k-sm hover:scale-105 transition-transform flex flex-col items-center gap-1 ${this.canvas.filter === f.id ? 'bg-bubblegum-soft/40 ring-2 ring-primary' : ''}" data-filter-choice="${f.id}">
                <div class="w-8 h-8 rounded-full bg-surface-container-high border border-ink-dark flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[18px]">${f.icon}</span>
                </div>
                <span class="text-xs font-bold text-ink-dark">${f.name}</span>
                <span class="text-[9px] text-on-surface-variant text-center">${f.desc}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      container.querySelectorAll('[data-filter-choice]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.canvas.setFilter(e.currentTarget.dataset.filterChoice);
          this.renderInspectorContent('filters');
        });
      });

    } else if (toolName === 'stickers') {
      const renderStickers = (category = 'all') => {
        const filtered = category === 'all'
          ? STICKER_COLLECTION
          : STICKER_COLLECTION.filter(s => s.category === category);

        return filtered.map(s => {
          const isBadge = s.type === 'badge' || s.isBadge;
          if (isBadge) {
            return `
              <button class="col-span-2 h-8 px-2 rounded-lg border-2 border-ink-dark shadow-y2k-sm flex items-center justify-center text-[10px] font-bold tracking-tight hover:scale-105 active:scale-95 transition-all truncate cursor-pointer uppercase select-none"
                      style="background-color: ${s.bg || '#ffd166'}; color: ${s.color || '#2B213A'}; font-family: 'Space Grotesk', sans-serif;"
                      data-sticker-id="${s.id}" title="${s.label}">
                ${s.content}
              </button>
            `;
          }
          return `
            <button class="col-span-1 h-10 bg-surface-container-low hover:bg-pink-100 p-1 rounded-lg border border-ink-dark shadow-sm flex items-center justify-center text-xl hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                    data-sticker-id="${s.id}" title="${s.label}">
              ${s.content}
            </button>
          `;
        }).join('');
      };

      const bindStickerEvents = () => {
        container.querySelectorAll('[data-sticker-id]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.stickerId;
            const sticker = STICKER_COLLECTION.find(s => s.id === id);
            if (sticker) {
              this.canvas.addSticker(sticker);
              this.showToast(`Stamped ${sticker.label}! ✨`);
            }
          });
        });
      };

      container.innerHTML = `
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between border-b border-ink-dark/20 pb-1.5">
            <span class="font-headline-md text-xs font-bold text-ink-dark">Sticker Vault ★</span>
            <span class="text-[10px] font-bold text-primary">Curated Pack</span>
          </div>

          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold select-none" id="sticker-pills" style="scrollbar-width: none;">
            <button class="px-2 py-0.5 rounded-full border border-ink-dark bg-cyber-sky text-ink-dark shadow-sm whitespace-nowrap" data-cat="all">All</button>
            <button class="px-2 py-0.5 rounded-full border border-ink-dark/30 bg-white text-ink-dark hover:border-ink-dark whitespace-nowrap" data-cat="words">Badges ★</button>
            <button class="px-2 py-0.5 rounded-full border border-ink-dark/30 bg-white text-ink-dark hover:border-ink-dark whitespace-nowrap" data-cat="stars">Stars ✨</button>
            <button class="px-2 py-0.5 rounded-full border border-ink-dark/30 bg-white text-ink-dark hover:border-ink-dark whitespace-nowrap" data-cat="hearts">Hearts 💖</button>
            <button class="px-2 py-0.5 rounded-full border border-ink-dark/30 bg-white text-ink-dark hover:border-ink-dark whitespace-nowrap" data-cat="tech">Tech 💾</button>
            <button class="px-2 py-0.5 rounded-full border border-ink-dark/30 bg-white text-ink-dark hover:border-ink-dark whitespace-nowrap" data-cat="doodles">Cute 🎀</button>
          </div>

          <div class="grid grid-cols-4 gap-1.5 max-h-[350px] overflow-y-auto p-1.5 bg-surface-container-lowest border border-ink-dark/30 rounded-xl" id="sticker-grid-container">
            ${renderStickers('all')}
          </div>
          <p class="text-[10px] text-on-surface-variant text-center">Click any sticker to stamp onto canvas</p>
        </div>
      `;

      bindStickerEvents();

      container.querySelectorAll('#sticker-pills button').forEach(pill => {
        pill.addEventListener('click', (e) => {
          container.querySelectorAll('#sticker-pills button').forEach(p => {
            p.className = 'px-2 py-0.5 rounded-full border border-ink-dark/30 bg-white text-ink-dark hover:border-ink-dark whitespace-nowrap';
          });
          e.currentTarget.className = 'px-2 py-0.5 rounded-full border border-ink-dark bg-cyber-sky text-ink-dark shadow-sm whitespace-nowrap font-bold';
          const cat = e.currentTarget.dataset.cat;
          const grid = container.querySelector('#sticker-grid-container');
          if (grid) {
            grid.innerHTML = renderStickers(cat);
            bindStickerEvents();
          }
        });
      });

    } else if (toolName === 'text') {
      container.innerHTML = `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-ink-dark/20 pb-1.5">
            <span class="font-headline-md text-xs font-bold text-ink-dark">Text Stamping</span>
          </div>
          <div class="flex flex-col gap-2">
            <input type="text" id="custom-text-input" value="BESTIES 4EVA ★" class="border-2 border-ink-dark rounded-lg p-2 text-xs font-bold text-ink-dark"/>
            <button class="gloss-btn-primary border-2 border-ink-dark text-white rounded-full py-2 text-xs font-bold shadow-y2k-sm" id="btn-add-text-sticker">
              + Stamp Text on Canvas
            </button>
          </div>
          <div class="flex flex-col gap-1 text-[11px] font-bold text-ink-dark pt-2">
            <span>Font Style:</span>
            <div class="flex gap-1">
              <button class="flex-1 border border-ink-dark p-1 rounded bg-white text-xs font-bold font-sans" data-font="Epilogue">Epilogue</button>
              <button class="flex-1 border border-ink-dark p-1 rounded bg-white text-xs font-mono" data-font="Space Grotesk">Tech</button>
              <button class="flex-1 border border-ink-dark p-1 rounded bg-white text-xs" data-font="Plus Jakarta Sans">Clean</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('btn-add-text-sticker')?.addEventListener('click', () => {
        const text = document.getElementById('custom-text-input')?.value.trim() || 'PIXEL POP ★';
        this.canvas.addText(text);
        this.showToast('Text sticker added! ✍️');
      });

    } else if (toolName === 'frames') {
      container.innerHTML = `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-ink-dark/20 pb-1.5">
            <span class="font-headline-md text-xs font-bold text-ink-dark">Border Card Style</span>
          </div>
          <div class="grid grid-cols-1 gap-2">
            ${BORDER_STYLES.map(b => `
              <button class="border-2 border-ink-dark p-2 rounded-xl bg-white shadow-y2k-sm hover:scale-102 transition-transform text-left flex items-center gap-2.5 ${this.canvas.borderStyle === b.id ? 'ring-2 ring-primary' : ''}" data-border-choice="${b.id}">
                <div class="w-6 h-6 rounded border border-ink-dark flex-shrink-0" style="background-color: ${b.color};"></div>
                <span class="text-xs font-bold text-ink-dark">${b.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      container.querySelectorAll('[data-border-choice]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.canvas.setBorderStyle(e.currentTarget.dataset.borderChoice);
          this.renderInspectorContent('frames');
        });
      });

    } else if (toolName === 'backdrop') {
      container.innerHTML = `
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between border-b border-ink-dark/20 pb-1.5">
            <span class="font-headline-md text-xs font-bold text-ink-dark">Desk Mat Backdrop</span>
            <span class="text-[10px] font-mono text-on-surface-variant font-bold">${BACKDROP_STYLES.length} styles</span>
          </div>
          <div class="grid grid-cols-1 gap-2">
            ${BACKDROP_STYLES.map(b => {
              const isSelected = this.currentBackdrop === b.id;
              return `
                <button class="border-2 border-ink-dark p-2 rounded-xl bg-white shadow-y2k-sm hover:scale-102 transition-transform text-left flex items-center justify-between ${isSelected ? 'ring-2 ring-primary bg-primary-fixed/30' : ''}" data-backdrop-choice="${b.id}">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg border-2 border-ink-dark flex-shrink-0 ${b.cssClass} shadow-sm"></div>
                    <span class="text-xs font-bold text-ink-dark">${b.name}</span>
                  </div>
                  ${isSelected ? '<span class="material-symbols-outlined text-primary text-[18px]">check_circle</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
      container.querySelectorAll('[data-backdrop-choice]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.backdropChoice;
          this.setBackdrop(id);
          this.renderInspectorContent('backdrop');
        });
      });
    }
  }

  onCanvasElementSelected(el) {
    const controlsBox = document.getElementById('element-controls-box');
    const scaleSlider = document.getElementById('slider-element-scale');
    const rotSlider = document.getElementById('slider-element-rot');
    if (!controlsBox) return;

    if (!el) {
      controlsBox.classList.add('hidden');
    } else {
      controlsBox.classList.remove('hidden');
      if (scaleSlider) scaleSlider.value = el.scale || 1.0;
      if (rotSlider) rotSlider.value = el.rotation || 0;
    }
  }

  renderEditorBottomReel() {
    const reel = document.getElementById('editor-bottom-reel');
    if (!reel) return;

    reel.innerHTML = this.photos.map((p, i) => `
      <div class="w-12 h-12 rounded-lg border-2 border-ink-dark bg-white overflow-hidden shadow-y2k-sm relative group cursor-pointer" data-reel-slot="${i}" title="Click to retake slot ${i + 1}">
        ${p ? `<img src="${p}" class="w-full h-full object-cover"/>` : ''}
        <span class="absolute bottom-0 right-0 bg-ink-dark text-white text-[8px] font-mono px-1 rounded-tl">${i + 1}</span>
      </div>
    `).join('');

    reel.querySelectorAll('[data-reel-slot]').forEach(item => {
      item.addEventListener('click', (e) => {
        const slot = parseInt(e.currentTarget.dataset.reelSlot, 10);
        this.activeStudioSlot = slot;
        this.switchView('studio');
      });
    });
  }

  // ================= RESULT & EXPORT =================
  initExportView() {
    // Download PNG Button
    document.getElementById('btn-download-png')?.addEventListener('click', () => {
      if (this.exportedCanvas) {
        PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
        this.showToast('🎉 Downloading your lossless photostrip PNG!');
      } else {
        this.showToast('⚠️ Photostrip sedang diproses, silakan tunggu...');
      }
    });

    // Edit Again Button
    document.getElementById('btn-edit-again')?.addEventListener('click', () => {
      this.exportedCanvas = null;
      this.switchView('editor');
    });

    // Copy to Clipboard Button
    document.getElementById('btn-copy-clipboard')?.addEventListener('click', async () => {
      if (this.exportedCanvas) {
        const success = await PhotostripExporter.copyToClipboard(this.exportedCanvas);
        if (success) {
          this.showToast('📋 Image copied to clipboard!');
        } else {
          this.showToast('⚠️ Clipboard copy not supported by browser. Downloading instead.');
          PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
        }
      } else {
        this.showToast('⚠️ Photostrip belum selesai di-render.');
      }
    });

    // Start New Session Button
    document.getElementById('btn-start-new-session')?.addEventListener('click', () => {
      this.photos = [null, null, null, null];
      this.exportedCanvas = null;
      this.canvas.reset();
      this.switchView('studio');
      this.showToast('✨ Clean session started! Smile for the camera.');
    });

    // Web Share API trigger
    document.getElementById('btn-share-native')?.addEventListener('click', async () => {
      if (!this.exportedCanvas) {
        this.showToast('⚠️ Photostrip belum selesai di-render.');
        return;
      }
      if (navigator.share) {
        try {
          this.exportedCanvas.toBlob(async (blob) => {
            if (!blob) {
              PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
              return;
            }
            const safeName = (this.filename && this.filename.toLowerCase().endsWith('.png'))
              ? this.filename
              : `${this.filename || 'pixel_pop'}.png`;
            const file = new File([blob], safeName, { type: 'image/png' });
            const shareData = {
              title: 'My PIXEL POP Y2K Photostrip',
              text: 'Check out my retro photostrip made on PIXEL POP ★'
            };
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
            try {
              await navigator.share(shareData);
            } catch (shareErr) {
              if (shareErr.name !== 'AbortError') {
                PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
              }
            }
          }, 'image/png');
        } catch (e) {
          console.warn('Share error', e);
          PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
        }
      } else {
        this.showToast('Direct share not available in this browser. Use Download instead!');
      }
    });

    document.getElementById('btn-share-instagram')?.addEventListener('click', () => {
      this.showToast('📸 Downloaded PNG is ready for Instagram Stories & Feed!');
      if (this.exportedCanvas) {
        PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
      }
    });

    document.getElementById('btn-share-tiktok')?.addEventListener('click', () => {
      this.showToast('🎵 Ready to post on TikTok & lockscreens!');
      if (this.exportedCanvas) {
        PhotostripExporter.downloadPNG(this.exportedCanvas, this.filename);
      }
    });
  }

  async openExportView() {
    if (this.isExporting) return;
    this.isExporting = true;

    try {
      // 1. Measure card dimensions while the editor stage is active & visible
      const cardDom = document.getElementById('photostrip-card');
      const cardWidth = (cardDom && cardDom.offsetWidth > 0) ? cardDom.offsetWidth : (this.canvas?.cardWidth || 300);
      const cardHeight = (cardDom && cardDom.offsetHeight > 0) ? cardDom.offsetHeight : (this.canvas?.cardHeight || 980);

      const state = {
        layout: this.canvas?.layout || 'vertical-4',
        filter: this.canvas?.filter || 'soft-pink',
        borderStyle: this.canvas?.borderStyle || 'baby-pink',
        photos: Array.isArray(this.photos) ? this.photos : [],
        elements: this.canvas?.elements || [],
        filename: this.filename || 'pixel_pop.png',
        cardWidth,
        cardHeight
      };

      // 2. Switch to result view
      this.switchView('result');
      const container = document.getElementById('result-canvas-container');
      const assetName = document.getElementById('export-asset-name');
      const assetSpecs = document.getElementById('export-asset-specs');
      if (!container) return;

      container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-8 gap-2">
          <div class="w-10 h-10 border-4 border-bubblegum-hot border-t-transparent rounded-full animate-spin"></div>
          <p class="font-bold text-xs text-ink-dark">Rendering High-Res 300 DPI Canvas...</p>
        </div>
      `;

      const stageDom = document.getElementById('canvas-stage');
      this.exportedCanvas = await PhotostripExporter.renderToCanvas(state, stageDom);

      // Display scaled preview in results view
      const previewImg = document.createElement('img');
      previewImg.src = this.exportedCanvas.toDataURL('image/png');
      previewImg.className = 'max-w-[280px] sm:max-w-[320px] max-h-[640px] rounded-lg shadow-y2k-lg border-2 border-ink-dark object-contain';
      previewImg.alt = 'Rendered Photostrip';

      container.innerHTML = '';
      container.appendChild(previewImg);

      if (assetName) assetName.textContent = this.filename;
      if (assetSpecs) {
        assetSpecs.textContent = `${this.exportedCanvas.width} × ${this.exportedCanvas.height} px (300 DPI High-Res) • Lossless PNG`;
      }

      // Update format & border badges
      const formatPill = document.getElementById('result-format-pill');
      if (formatPill) {
        const layoutObj = LAYOUT_PRESETS.find(l => l.id === state.layout);
        formatPill.textContent = `Format: ${layoutObj ? layoutObj.name : 'Standard Photostrip'}`;
      }
      const palettePill = document.getElementById('result-palette-pill');
      if (palettePill) {
        const borderObj = BORDER_STYLES.find(b => b.id === state.borderStyle);
        palettePill.textContent = `Border: ${borderObj ? borderObj.name : 'Baby Pink'}`;
      }

      // Update result showcase desk mat to match chosen backdrop
      const resultMat = document.getElementById('result-desk-mat');
      if (resultMat) {
        const backdropObj = BACKDROP_STYLES.find(b => b.id === this.currentBackdrop) || BACKDROP_STYLES[0];
        const allCssClasses = BACKDROP_STYLES.map(b => b.cssClass);
        resultMat.classList.remove(...allCssClasses);
        resultMat.classList.add(backdropObj.cssClass);
      }

      sound.playSuccess();
    } catch (err) {
      console.error('Export render error:', err);
      const container = document.getElementById('result-canvas-container');
      if (container) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center p-6 text-center gap-3">
            <span class="text-4xl">⚠️</span>
            <p class="font-bold text-sm text-error">Terjadi kesalahan saat memproses ekspor photostrip.</p>
            <p class="text-xs text-on-surface-variant font-mono bg-white p-2 rounded border border-ink-dark/30 max-w-md">${err?.message || err}</p>
            <button id="btn-retry-export" class="px-4 py-2 bg-bubblegum-hot text-white font-bold rounded-full border-2 border-ink-dark shadow-y2k-sm hover:bg-primary transition-all text-xs">
              Coba Lagi
            </button>
          </div>
        `;
        document.getElementById('btn-retry-export')?.addEventListener('click', () => {
          this.openExportView();
        });
      }
      this.showToast('Gagal memproses ekspor photostrip: ' + (err?.message || 'Error'));
    } finally {
      this.isExporting = false;
    }
  }

  // ================= MODALS & HELP =================
  initModals() {
    // Help Modal
    const helpModal = document.getElementById('modal-help');
    document.getElementById('btn-open-help')?.addEventListener('click', () => helpModal?.classList.remove('hidden'));
    document.getElementById('footer-btn-help')?.addEventListener('click', () => helpModal?.classList.remove('hidden'));
    document.getElementById('btn-close-help')?.addEventListener('click', () => helpModal?.classList.add('hidden'));
    document.getElementById('btn-help-ok')?.addEventListener('click', () => helpModal?.classList.add('hidden'));

    // Reset Confirm Modal
    const resetModal = document.getElementById('modal-reset-confirm');
    document.getElementById('btn-reset-cancel')?.addEventListener('click', () => resetModal?.classList.add('hidden'));
    document.getElementById('btn-reset-confirm')?.addEventListener('click', () => {
      this.canvas.reset();
      this.setBackdrop('dot-matrix', false);
      resetModal?.classList.add('hidden');
      this.showToast('Canvas reset to fresh state! ✨');
    });

    // Hero Templates button triggers layouts tool in editor
    document.getElementById('hero-btn-templates')?.addEventListener('click', () => {
      this.switchView('editor');
      this.setActiveTool('layouts');
    });
    document.getElementById('nav-templates')?.addEventListener('click', () => {
      this.switchView('editor');
      this.setActiveTool('layouts');
    });
    document.getElementById('nav-stickers')?.addEventListener('click', () => {
      this.switchView('editor');
      this.setActiveTool('stickers');
    });
  }

  initHomeTeaser() {
    document.querySelectorAll('#home-sticker-grid button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = e.currentTarget.dataset.sticker;
        sound.playPop();
        this.showToast(`Previewed ${emoji}! Enter the studio to stick it on your photo.`);
      });
    });

    document.getElementById('hero-sample-strip')?.addEventListener('click', () => {
      this.switchView('editor');
    });
  }

  showToast(message) {
    const toast = document.getElementById('toast-notification');
    const msg = document.getElementById('toast-message');
    if (!toast || !msg) return;

    msg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 2800);
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new PixelPopApp();
});
