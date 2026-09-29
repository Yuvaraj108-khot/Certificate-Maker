/* =========================================================================
   BULK CERTIFICATE GENERATOR - STUDIO MAIN APPLICATION
   ========================================================================= */

import { studioState, FONT_CATALOG, getAvailableWeightsForFont } from './state.js';
import { drawOnCanvas, getCurrentRecipientName, initCanvasDrag, loadFontAsync } from './canvas.js';
import { loadTemplateImageFile, parseSpreadsheetFile, getExcelColumnsList, extractColumnNames } from './importer.js';
import { runBatchExport } from './exporter.js';

// Cache DOM references
const dom = {
  templateDropzone: document.getElementById('templateDropzone'),
  templateInput: document.getElementById('templateInput'),
  dropzoneText: document.getElementById('dropzoneText'),
  templateActiveCard: document.getElementById('templateActiveCard'),
  activeFileName: document.getElementById('activeFileName'),
  activeDimensions: document.getElementById('activeDimensions'),
  removeTemplateBtn: document.getElementById('removeTemplateBtn'),

  canvaLinkInput: document.getElementById('canvaLinkInput'),
  openCanvaBtn: document.getElementById('openCanvaBtn'),

  loadSampleNamesBtn: document.getElementById('loadSampleNamesBtn'),
  tabExcelBtn: document.getElementById('tabExcelBtn'),
  tabManualBtn: document.getElementById('tabManualBtn'),
  tabExcelContent: document.getElementById('tabExcelContent'),
  tabManualContent: document.getElementById('tabManualContent'),
  excelDropzone: document.getElementById('excelDropzone'),
  excelInput: document.getElementById('excelInput'),
  excelDropText: document.getElementById('excelDropText'),
  excelColumnControls: document.getElementById('excelColumnControls'),
  columnDropdown: document.getElementById('columnDropdown'),
  headerRowCheckbox: document.getElementById('headerRowCheckbox'),
  manualTextarea: document.getElementById('manualTextarea'),
  manualCounter: document.getElementById('manualCounter'),
  totalNamesBadge: document.getElementById('totalNamesBadge'),
  namesChipTray: document.getElementById('namesChipTray'),

  fontDropdownContainer: document.getElementById('fontDropdownContainer'),
  fontPickerTrigger: document.getElementById('fontPickerTrigger'),
  fontTriggerName: document.getElementById('fontTriggerName'),
  fontTriggerPreview: document.getElementById('fontTriggerPreview'),
  fontCategoryLabel: document.getElementById('fontCategoryLabel'),
  fontPickerMenu: document.getElementById('fontPickerMenu'),
  fontSearchInput: document.getElementById('fontSearchInput'),
  fontSearchClearBtn: document.getElementById('fontSearchClearBtn'),
  fontListScroll: document.getElementById('fontListScroll'),
  fontCustomLoaderRow: document.getElementById('fontCustomLoaderRow'),
  fontCustomLoaderPrompt: document.getElementById('fontCustomLoaderPrompt'),
  btnLoadTypedFont: document.getElementById('btnLoadTypedFont'),

  weightSelect: document.getElementById('weightSelect'),
  fontSizeRange: document.getElementById('fontSizeRange'),
  fontSizeNum: document.getElementById('fontSizeNum'),
  colorSvBox: document.getElementById('colorSvBox'),
  colorSvHandle: document.getElementById('colorSvHandle'),
  colorHueBar: document.getElementById('colorHueBar'),
  colorHueHandle: document.getElementById('colorHueHandle'),
  colorPreviewSwatch: document.getElementById('colorPreviewSwatch'),
  pickerHexInput: document.getElementById('pickerHexInput'),
  pickerRInput: document.getElementById('pickerRInput'),
  pickerGInput: document.getElementById('pickerGInput'),
  pickerBInput: document.getElementById('pickerBInput'),
  btnEyeDropper: document.getElementById('btnEyeDropper'),
  shrinkCheckbox: document.getElementById('shrinkCheckbox'),
  maxWidthSliderBox: document.getElementById('maxWidthSliderBox'),
  maxWidthRange: document.getElementById('maxWidthRange'),
  maxWidthLabel: document.getElementById('maxWidthLabel'),
  coordsDisplay: document.getElementById('coordsDisplay'),
  snapCenterBtn: document.getElementById('snapCenterBtn'),
  snapCenterXBtn: document.getElementById('snapCenterXBtn'),
  snapCenterYBtn: document.getElementById('snapCenterYBtn'),
  posYInput: document.getElementById('posYInput'),
  posYRange: document.getElementById('posYRange'),
  posXInput: document.getElementById('posXInput'),
  posXRange: document.getElementById('posXRange'),
  nudgeUpBtn: document.getElementById('nudgeUpBtn'),
  nudgeDownBtn: document.getElementById('nudgeDownBtn'),
  nudgeLeftBtn: document.getElementById('nudgeLeftBtn'),
  nudgeRightBtn: document.getElementById('nudgeRightBtn'),
  nudgeCenterBtn: document.getElementById('nudgeCenterBtn'),

  btnGenerateZip: document.getElementById('btnGenerateZip'),
  btnGenerateFolder: document.getElementById('btnGenerateFolder'),
  progressContainer: document.getElementById('progressContainer'),
  progressLabel: document.getElementById('progressLabel'),
  progressPercentNum: document.getElementById('progressPercentNum'),
  progressFillBar: document.getElementById('progressFillBar'),
  progressCurrentFile: document.getElementById('progressCurrentFile'),
  btnCancelGen: document.getElementById('btnCancelGen'),

  canvasScreenArea: document.getElementById('canvasScreenArea'),
  emptyCanvasPrompt: document.getElementById('emptyCanvasPrompt'),
  emptyUploadCard: document.getElementById('emptyUploadCard'),
  emptyFileInput: document.getElementById('emptyFileInput'),
  canvasStageWrapper: document.getElementById('canvasStageWrapper'),
  previewCanvas: document.getElementById('previewCanvas'),
  renderEngineCanvas: document.getElementById('renderEngineCanvas'),

  btnPrevRecipient: document.getElementById('btnPrevRecipient'),
  btnNextRecipient: document.getElementById('btnNextRecipient'),
  recipientNavStatus: document.getElementById('recipientNavStatus'),
  btnOpenFullResTest: document.getElementById('btnOpenFullResTest'),
  toastTray: document.getElementById('toastTray'),

  studioGrid: document.getElementById('studioGrid'),
  mobTabControls: document.getElementById('mobTabControls'),
  mobTabPreview: document.getElementById('mobTabPreview'),
  mobRecipientBadge: document.getElementById('mobRecipientBadge'),
  btnFloatingPreview: document.getElementById('btnFloatingPreview'),
  btnMobBackToControls: document.getElementById('btnMobBackToControls')
};

/* =========================================================================
   INITIALIZATION
   ========================================================================= */
/* =========================================================================
   INITIALIZATION
   ========================================================================= */
export function initApp() {
  initFontPicker();
  updateWeightDropdown(studioState.fontFamily);
  setupEventListeners();
  loadDefaultSampleNames();
  initCanvasDrag(dom.previewCanvas, () => {
    updateCoordsDisplay();
    renderPreview();
  });
}

export function toast(message, type = 'info', timeout = 4000) {
  const el = document.createElement('div');
  el.className = `toast-item toast-${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><div style="flex:1;">${message}</div>`;
  dom.toastTray.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.25s ease';
    setTimeout(() => el.remove(), 250);
  }, timeout);
}

/* =========================================================================
   CUSTOM SEARCHABLE FONT PICKER (CANVA/FIGMA STYLE)
   ========================================================================= */
let committedFontFamily = studioState.fontFamily;

function initFontPicker() {
  committedFontFamily = studioState.fontFamily;
  renderFontList('');
  updateFontTriggerUI(studioState.fontFamily);

  // Toggle dropdown on trigger click
  if (dom.fontPickerTrigger) {
    dom.fontPickerTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dom.fontPickerMenu.classList.contains('show');
      if (isOpen) {
        closeFontMenu();
      } else {
        openFontMenu();
      }
    });

    dom.fontPickerTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFontMenu();
      }
    });
  }

  // Live Search filter input
  if (dom.fontSearchInput) {
    dom.fontSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (dom.fontSearchClearBtn) {
        dom.fontSearchClearBtn.style.display = q.length > 0 ? 'flex' : 'none';
      }
      renderFontList(q);
    });

    dom.fontSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFontMenu();
      if (e.key === 'Enter') {
        const q = dom.fontSearchInput.value.trim();
        if (q) loadCustomGoogleFont(q);
      }
    });
  }

  // Clear search button
  if (dom.fontSearchClearBtn) {
    dom.fontSearchClearBtn.addEventListener('click', () => {
      dom.fontSearchInput.value = '';
      dom.fontSearchClearBtn.style.display = 'none';
      renderFontList('');
      dom.fontSearchInput.focus();
    });
  }

  // Custom Google Font on-the-fly load button
  if (dom.btnLoadTypedFont) {
    dom.btnLoadTypedFont.addEventListener('click', () => {
      const q = dom.fontSearchInput.value.trim();
      if (q) loadCustomGoogleFont(q);
    });
  }

  // Revert preview on mouse leaving the font list
  if (dom.fontListScroll) {
    dom.fontListScroll.addEventListener('mouseleave', async () => {
      if (studioState.fontFamily !== committedFontFamily) {
        studioState.fontFamily = committedFontFamily;
        updateFontTriggerUI(committedFontFamily);
        const effWeight = getEffectiveFontWeight(committedFontFamily, studioState.fontWeight);
        await loadFontAsync(committedFontFamily, effWeight);
        renderPreview();
      }
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (dom.fontDropdownContainer && !dom.fontDropdownContainer.contains(e.target)) {
      closeFontMenu();
    }
  });
}

let fontsPrewarmed = false;
function preloadCatalogFonts() {
  if (fontsPrewarmed || !document.fonts || !document.fonts.load) return;
  fontsPrewarmed = true;
  FONT_CATALOG.forEach(group => {
    group.fonts.forEach(f => {
      const w = f.weights && f.weights.length ? f.weights[0] : '400';
      document.fonts.load(`${w} 36px "${f.name}"`).catch(() => {});
    });
  });
}

function openFontMenu() {
  if (!dom.fontPickerMenu) return;
  committedFontFamily = studioState.fontFamily;
  dom.fontPickerMenu.classList.add('show');
  dom.fontPickerTrigger.classList.add('is-open');
  dom.fontPickerTrigger.setAttribute('aria-expanded', 'true');
  if (dom.fontSearchInput) {
    dom.fontSearchInput.focus();
  }
  preloadCatalogFonts();
}

function closeFontMenu() {
  if (!dom.fontPickerMenu) return;
  dom.fontPickerMenu.classList.remove('show');
  dom.fontPickerTrigger.classList.remove('is-open');
  dom.fontPickerTrigger.setAttribute('aria-expanded', 'false');

  // Revert preview if user closed menu without clicking a font
  if (studioState.fontFamily !== committedFontFamily) {
    studioState.fontFamily = committedFontFamily;
    updateFontTriggerUI(committedFontFamily);
    const effWeight = getEffectiveFontWeight(committedFontFamily, studioState.fontWeight);
    loadFontAsync(committedFontFamily, effWeight).then(renderPreview);
  }
}

function updateFontTriggerUI(fontFamily) {
  if (dom.fontTriggerName) dom.fontTriggerName.textContent = fontFamily;
  if (dom.fontTriggerPreview) {
    dom.fontTriggerPreview.style.fontFamily = `"${fontFamily}", cursive, serif`;
    dom.fontTriggerPreview.textContent = 'Certificate Sample';
  }

  // Find category name
  let category = 'Google Font';
  for (const group of FONT_CATALOG) {
    if (group.fonts.some(f => f.name.toLowerCase() === fontFamily.toLowerCase())) {
      category = group.category.replace(/^[^\w\s]+/, '').trim();
      break;
    }
  }
  if (dom.fontCategoryLabel) dom.fontCategoryLabel.textContent = category;
}

let hoverSeq = 0;
let currentHoveredFont = null;

function renderFontList(searchQuery = '') {
  if (!dom.fontListScroll) return;
  dom.fontListScroll.innerHTML = '';

  const q = searchQuery.toLowerCase().trim();
  let totalMatches = 0;
  let hasExactMatch = false;

  FONT_CATALOG.forEach(group => {
    const matchingFonts = group.fonts.filter(f => {
      const matches = f.name.toLowerCase().includes(q);
      if (f.name.toLowerCase() === q) hasExactMatch = true;
      return matches;
    });

    if (matchingFonts.length > 0) {
      // Category header
      const header = document.createElement('div');
      header.className = 'font-category-header';
      header.textContent = group.category;
      dom.fontListScroll.appendChild(header);

      // Font item rows
      matchingFonts.forEach(font => {
        totalMatches++;
        const row = document.createElement('div');
        row.className = `font-item-row ${font.name === studioState.fontFamily ? 'is-active' : ''}`;
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', font.name === studioState.fontFamily ? 'true' : 'false');

        row.innerHTML = `
          <span class="font-item-name">${font.name}</span>
          <span class="font-item-sample" style="font-family: '${font.name}', cursive, serif;">Aa</span>
        `;

        // REAL-TIME HOVER PREVIEW directly on certificate canvas!
        row.addEventListener('mouseenter', async () => {
          const seq = ++hoverSeq;
          const targetFont = font.name;
          currentHoveredFont = targetFont;

          studioState.fontFamily = targetFont;
          updateFontTriggerUI(targetFont);

          const effWeight = getEffectiveFontWeight(targetFont, studioState.fontWeight);
          await loadFontAsync(targetFont, effWeight);

          // Render only if this is still the active hover target
          if (seq === hoverSeq && currentHoveredFont === targetFont) {
            await renderPreview();
          }
        });

        // Commit font on click
        row.addEventListener('click', () => {
          selectFont(font.name);
        });

        dom.fontListScroll.appendChild(row);
      });
    }
  });

  // If search query is non-empty and not an exact match, show Google Font loader row
  if (dom.fontCustomLoaderRow) {
    if (q.length > 1 && !hasExactMatch) {
      dom.fontCustomLoaderRow.style.display = 'flex';
      if (dom.fontCustomLoaderPrompt) {
        dom.fontCustomLoaderPrompt.textContent = `Font not listed? Load "${searchQuery}"`;
      }
    } else {
      dom.fontCustomLoaderRow.style.display = 'none';
    }
  }

  // If no matches at all
  if (totalMatches === 0 && q.length > 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.padding = '1rem';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.fontSize = '0.78rem';
    emptyMsg.style.color = '#64748b';
    emptyMsg.textContent = `No fonts matched "${searchQuery}". Click below to load it from Google Fonts!`;
    dom.fontListScroll.appendChild(emptyMsg);
  }
}

async function selectFont(fontFamily) {
  committedFontFamily = fontFamily;
  studioState.fontFamily = fontFamily;
  updateFontTriggerUI(fontFamily);
  updateWeightDropdown(fontFamily);
  closeFontMenu();

  await loadFontAsync(fontFamily, studioState.fontWeight);
  renderPreview();
  renderFontList(dom.fontSearchInput ? dom.fontSearchInput.value : '');
}

function updateWeightDropdown(fontFamily) {
  const weights = getAvailableWeightsForFont(fontFamily);
  dom.weightSelect.innerHTML = '';
  const labels = {
    '400': 'Regular (400)',
    '500': 'Medium (500)',
    '600': 'Semi-Bold (600)',
    '700': 'Bold (700)',
    '800': 'Extra-Bold (800)',
    '900': 'Black (900)'
  };

  weights.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = labels[w] || w;
    dom.weightSelect.appendChild(opt);
  });

  if (weights.includes(studioState.fontWeight)) {
    dom.weightSelect.value = studioState.fontWeight;
  } else {
    studioState.fontWeight = weights[weights.length - 1];
    dom.weightSelect.value = studioState.fontWeight;
  }
}

async function loadCustomGoogleFont(fontName) {
  const cleanName = fontName.trim();
  if (!cleanName) return;

  const fontId = `custom-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:wght@400;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }

  // Add to FONT_CATALOG custom category if not already present
  let customCat = FONT_CATALOG.find(c => c.category.includes('Custom'));
  if (!customCat) {
    customCat = { category: '🌟 Custom Google Fonts', fonts: [] };
    FONT_CATALOG.unshift(customCat);
  }

  if (!customCat.fonts.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
    customCat.fonts.push({ name: cleanName, weights: ['400', '600', '700', '800'] });
  }

  await selectFont(cleanName);
  if (dom.fontSearchInput) dom.fontSearchInput.value = '';
  if (dom.fontSearchClearBtn) dom.fontSearchClearBtn.style.display = 'none';
  toast(`Loaded Google Font: "${cleanName}"`, 'success');
}

/* =========================================================================
   SAMPLE DATA & NAMES SUMMARY
   ========================================================================= */
function loadDefaultSampleNames() {
  const samples = [
    "Priya Nair",
    "Alexander Wright",
    "Sofia Rodriguez",
    "Michael Chen",
    "Dr. Eleanor Vance",
    "James Wilson",
    "Aarav Sharma",
    "Isabella Bianchi"
  ];
  dom.manualTextarea.value = samples.join('\n');
  processNames(samples);
}

function processNames(rawArray) {
  const cleaned = [];
  for (const item of rawArray) {
    if (item !== null && item !== undefined) {
      const s = String(item).trim();
      if (s.length > 0) cleaned.push(s);
    }
  }

  studioState.names = cleaned;
  studioState.currentIndex = 0;
  updateNamesUI();
  updateCyclerUI();
  renderPreview();
}

function updateNamesUI() {
  const total = studioState.names.length;
  dom.totalNamesBadge.textContent = `👥 ${total} Recipients Loaded`;
  dom.manualCounter.textContent = `${total} names`;

  if (total === 0) {
    dom.namesChipTray.innerHTML = `<span style="font-size: 0.73rem; color: var(--text-tertiary); font-style: italic;">No names loaded yet. Upload sheet or enter names above.</span>`;
    return;
  }

  const limit = 10;
  const slice = studioState.names.slice(0, limit);
  let html = '';

  slice.forEach((n, idx) => {
    html += `<span class="name-chip">${idx + 1}. ${n}</span>`;
  });

  if (total > limit) {
    html += `<span class="name-chip name-chip-more">+${total - limit} more</span>`;
  }

  dom.namesChipTray.innerHTML = html;
}

function updateCyclerUI() {
  const total = studioState.names.length;
  if (total === 0) {
    dom.recipientNavStatus.textContent = '0 of 0';
    if (dom.mobRecipientBadge) dom.mobRecipientBadge.textContent = '0 / 0';
    dom.btnPrevRecipient.disabled = true;
    dom.btnNextRecipient.disabled = true;
  } else {
    dom.recipientNavStatus.textContent = `${studioState.currentIndex + 1} of ${total}`;
    if (dom.mobRecipientBadge) dom.mobRecipientBadge.textContent = `${studioState.currentIndex + 1} / ${total}`;
    dom.btnPrevRecipient.disabled = studioState.currentIndex === 0;
    dom.btnNextRecipient.disabled = studioState.currentIndex === total - 1;
  }
}

export function updateCoordsDisplay() {
  const x = (studioState.posXFrac * 100).toFixed(1);
  const y = (studioState.posYFrac * 100).toFixed(1);
  if (dom.coordsDisplay) dom.coordsDisplay.textContent = `X: ${x}% | Y: ${y}%`;
  if (dom.posXInput && document.activeElement !== dom.posXInput) dom.posXInput.value = x;
  if (dom.posYInput && document.activeElement !== dom.posYInput) dom.posYInput.value = y;
  if (dom.posXRange) dom.posXRange.value = x;
  if (dom.posYRange) dom.posYRange.value = y;
}

export function setCoordinates(xPct, yPct) {
  const clampedX = Math.max(0, Math.min(100, xPct));
  const clampedY = Math.max(0, Math.min(100, yPct));
  studioState.posXFrac = clampedX / 100;
  studioState.posYFrac = clampedY / 100;
  updateCoordsDisplay();
  renderPreview();
}

/* =========================================================================
   LIVE CANVAS PREVIEW
   ========================================================================= */
export async function renderPreview() {
  if (!studioState.templateLoaded) {
    dom.emptyCanvasPrompt.style.display = 'flex';
    dom.canvasStageWrapper.style.display = 'none';
    return;
  }

  dom.emptyCanvasPrompt.style.display = 'none';
  dom.canvasStageWrapper.style.display = 'block';

  const canvas = dom.previewCanvas;
  const displayW = Math.min(studioState.templateWidth, 1400);
  const ratio = studioState.templateHeight / studioState.templateWidth;
  canvas.width = displayW;
  canvas.height = displayW * ratio;

  const name = getCurrentRecipientName();
  await drawOnCanvas(canvas, name, true);
}

/* =========================================================================
   EVENT LISTENERS
   ========================================================================= */
function setupEventListeners() {
  // Mobile View Switcher (Controls vs Live Certificate)
  const setMobileView = (view) => {
    if (dom.studioGrid) {
      dom.studioGrid.setAttribute('data-mobile-view', view);
    }
    if (dom.mobTabControls) {
      dom.mobTabControls.classList.toggle('active', view === 'controls');
    }
    if (dom.mobTabPreview) {
      dom.mobTabPreview.classList.toggle('active', view === 'preview');
    }
    if (view === 'preview') {
      renderPreview();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  dom.mobTabControls?.addEventListener('click', () => setMobileView('controls'));
  dom.mobTabPreview?.addEventListener('click', () => setMobileView('preview'));
  dom.btnFloatingPreview?.addEventListener('click', () => setMobileView('preview'));
  dom.btnMobBackToControls?.addEventListener('click', () => setMobileView('controls'));

  // Template File Uploads
  const handleTemplateFile = (file) => {
    loadTemplateImageFile(file, (f, img) => {
      dom.activeFileName.textContent = f.name;
      dom.activeDimensions.textContent = `${studioState.templateWidth} × ${studioState.templateHeight} px (Original Resolution)`;
      dom.templateActiveCard.style.display = 'flex';
      dom.dropzoneText.textContent = `Replace Template: ${f.name}`;

      dom.fontSizeNum.value = studioState.fontSize;
      dom.fontSizeRange.value = Math.min(studioState.fontSize, 260);

      renderPreview();
      toast(`Loaded template: ${f.name}`, 'success');
      if (window.innerWidth <= 992 && typeof setMobileView === 'function') {
        setMobileView('preview');
      }
    }, (err) => toast(err, 'error'));
  };

  dom.templateInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) handleTemplateFile(e.target.files[0]);
  });
  dom.emptyFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) handleTemplateFile(e.target.files[0]);
  });

  dom.removeTemplateBtn.addEventListener('click', () => {
    studioState.templateImage = null;
    studioState.templateLoaded = false;
    studioState.templateFileName = '';
    dom.templateActiveCard.style.display = 'none';
    dom.dropzoneText.textContent = 'Click or Drop Template Here';
    dom.templateInput.value = '';
    dom.emptyFileInput.value = '';
    renderPreview();
    toast('Template removed', 'info');
  });

  // Drag and drop for template zones
  [dom.templateDropzone, dom.emptyUploadCard, dom.canvasScreenArea].forEach(zone => {
    ['dragenter', 'dragover'].forEach(n => {
      zone.addEventListener(n, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(n => {
      zone.addEventListener(n, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('dragover');
      });
    });
    zone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) handleTemplateFile(files[0]);
    });
  });

  // Canva Link
  dom.openCanvaBtn.addEventListener('click', () => {
    let url = dom.canvaLinkInput.value.trim();
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast('Please enter your Canva link first', 'warning');
    }
  });

  // Sample Names
  dom.loadSampleNamesBtn.addEventListener('click', () => {
    loadDefaultSampleNames();
    toast('Loaded sample recipient list', 'info');
  });

  // Tabs
  dom.tabExcelBtn.addEventListener('click', () => {
    dom.tabExcelBtn.classList.add('active');
    dom.tabManualBtn.classList.remove('active');
    dom.tabExcelContent.style.display = 'block';
    dom.tabManualContent.style.display = 'none';
  });

  dom.tabManualBtn.addEventListener('click', () => {
    dom.tabManualBtn.classList.add('active');
    dom.tabExcelBtn.classList.remove('active');
    dom.tabManualContent.style.display = 'block';
    dom.tabExcelContent.style.display = 'none';
  });

  // Excel Upload
  const syncExcelColumns = () => {
    const hasHeader = dom.headerRowCheckbox.checked;
    const { columns, selectedIndex } = getExcelColumnsList(hasHeader);
    dom.columnDropdown.innerHTML = '';
    columns.forEach(col => {
      const opt = document.createElement('option');
      opt.value = col.index;
      opt.textContent = col.label;
      dom.columnDropdown.appendChild(opt);
    });
    dom.columnDropdown.value = selectedIndex;
    const names = extractColumnNames(selectedIndex, hasHeader);
    processNames(names);
  };

  dom.excelInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      parseSpreadsheetFile(file, () => {
        dom.excelDropText.textContent = `Loaded: ${file.name}`;
        syncExcelColumns();
        dom.excelColumnControls.style.display = 'grid';
        toast(`Parsed spreadsheet: ${file.name}`, 'success');
      }, (err) => toast(err, 'error'));
    }
  });

  dom.columnDropdown.addEventListener('change', () => {
    const col = parseInt(dom.columnDropdown.value, 10);
    const hasHeader = dom.headerRowCheckbox.checked;
    const names = extractColumnNames(col, hasHeader);
    processNames(names);
  });

  dom.headerRowCheckbox.addEventListener('change', syncExcelColumns);

  // Manual Textarea
  dom.manualTextarea.addEventListener('input', () => {
    const lines = dom.manualTextarea.value.split('\n');
    processNames(lines);
  });

  // Font Weight
  dom.weightSelect.addEventListener('change', (e) => {
    studioState.fontWeight = e.target.value;
    renderPreview();
  });

  // Font Size
  dom.fontSizeRange.addEventListener('input', (e) => {
    studioState.fontSize = parseInt(e.target.value, 10);
    dom.fontSizeNum.value = studioState.fontSize;
    renderPreview();
  });

  dom.fontSizeNum.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10) || 12;
    studioState.fontSize = val;
    dom.fontSizeRange.value = Math.min(val, 260);
    renderPreview();
  });

  // =========================================================================
  // PROFESSIONAL 2D HSV COLOR PICKER ENGINE
  // =========================================================================
  let curHue = 220;  // 0 - 360
  let curSat = 0.65; // 0 - 1
  let curVal = 0.16; // 0 - 1
  let isDraggingSv = false;
  let isDraggingHue = false;

  const hsvToRgb = (h, s, v) => {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s, v];
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const hexToRgb = (hex) => {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
    let num = parseInt(c, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  // Updates UI handles, inputs, preview swatch and canvas
  const updateColorPickerUI = (updateInputs = true, render = true) => {
    const [r, g, b] = hsvToRgb(curHue, curSat, curVal);
    const hex = rgbToHex(r, g, b);

    // Update SV Box Background Color based on Hue
    if (dom.colorSvBox) {
      dom.colorSvBox.style.backgroundColor = `hsl(${curHue}, 100%, 50%)`;
    }

    // Position SV Handle
    if (dom.colorSvHandle) {
      dom.colorSvHandle.style.left = `${curSat * 100}%`;
      dom.colorSvHandle.style.top = `${(1 - curVal) * 100}%`;
    }

    // Position Hue Handle
    if (dom.colorHueHandle) {
      dom.colorHueHandle.style.left = `${(curHue / 360) * 100}%`;
    }

    // Swatch preview
    if (dom.colorPreviewSwatch) {
      dom.colorPreviewSwatch.style.backgroundColor = hex;
    }

    // Inputs
    if (updateInputs) {
      if (dom.pickerHexInput) dom.pickerHexInput.value = hex;
      if (dom.pickerRInput) dom.pickerRInput.value = r;
      if (dom.pickerGInput) dom.pickerGInput.value = g;
      if (dom.pickerBInput) dom.pickerBInput.value = b;
    }

    // Highlight matching preset dot if any
    document.querySelectorAll('.mini-dot').forEach(btn => {
      const dotHex = (btn.getAttribute('data-color') || '').toUpperCase();
      if (dotHex === hex) {
        btn.classList.add('active-swatch');
      } else {
        btn.classList.remove('active-swatch');
      }
    });

    studioState.color = hex;
    if (render) renderPreview();
  };

  // Set from an external hex (e.g. from preset or input)
  const setColorFromHex = (hex, render = true) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const [r, g, b] = rgb;
    const [h, s, v] = rgbToHsv(r, g, b);
    curHue = h;
    curSat = s;
    curVal = v;
    updateColorPickerUI(true, render);
  };

  // SV Box Drag Handling
  const handleSvMove = (e) => {
    const rect = dom.colorSvBox.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;

    curSat = Math.max(0, Math.min(1, x));
    curVal = Math.max(0, Math.min(1, 1 - y));

    updateColorPickerUI(true, true);
  };

  if (dom.colorSvBox) {
    dom.colorSvBox.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDraggingSv = true;
      handleSvMove(e);
    });
    dom.colorSvBox.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDraggingSv = true;
      handleSvMove(e);
    }, { passive: false });
  }

  // Hue Bar Drag Handling
  const handleHueMove = (e) => {
    const rect = dom.colorHueBar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let x = (clientX - rect.left) / rect.width;
    curHue = Math.max(0, Math.min(360, x * 360));
    updateColorPickerUI(true, true);
  };

  if (dom.colorHueBar) {
    dom.colorHueBar.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDraggingHue = true;
      handleHueMove(e);
    });
    dom.colorHueBar.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDraggingHue = true;
      handleHueMove(e);
    }, { passive: false });
  }

  // Window drag listeners for smooth dragging outside box boundaries
  window.addEventListener('mousemove', (e) => {
    if (isDraggingSv) handleSvMove(e);
    if (isDraggingHue) handleHueMove(e);
  });
  window.addEventListener('touchmove', (e) => {
    if (isDraggingSv || isDraggingHue) {
      if (e.cancelable) e.preventDefault();
      if (isDraggingSv) handleSvMove(e);
      if (isDraggingHue) handleHueMove(e);
    }
  }, { passive: false });
  window.addEventListener('mouseup', () => {
    isDraggingSv = false;
    isDraggingHue = false;
  });
  window.addEventListener('touchend', () => {
    isDraggingSv = false;
    isDraggingHue = false;
  });

  // HEX Input listener
  if (dom.pickerHexInput) {
    dom.pickerHexInput.addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        setColorFromHex(val, true);
      }
    });
  }

  // RGB Inputs listeners
  const handleRgbInputChange = () => {
    let r = Math.max(0, Math.min(255, parseInt(dom.pickerRInput.value, 10) || 0));
    let g = Math.max(0, Math.min(255, parseInt(dom.pickerGInput.value, 10) || 0));
    let b = Math.max(0, Math.min(255, parseInt(dom.pickerBInput.value, 10) || 0));
    const hex = rgbToHex(r, g, b);
    setColorFromHex(hex, true);
  };

  [dom.pickerRInput, dom.pickerGInput, dom.pickerBInput].forEach(inp => {
    if (inp) inp.addEventListener('input', handleRgbInputChange);
  });

  // Preset Mini-Dots
  document.querySelectorAll('.mini-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-color');
      if (c) setColorFromHex(c, true);
    });
  });

  // EyeDropper Tool
  if (dom.btnEyeDropper) {
    dom.btnEyeDropper.addEventListener('click', async () => {
      if (!window.EyeDropper) {
        toast('Eyedropper tool is supported in Chrome & Edge browsers.', 'info');
        return;
      }
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setColorFromHex(result.sRGBHex, true);
          toast(`Selected color: ${result.sRGBHex}`, 'success');
        }
      } catch (err) {
        // User cancelled eyedropper
      }
    });
  }

  // Initialize Color Picker with default color
  setColorFromHex(studioState.color, false);

  // Alignment
  document.querySelectorAll('input[name="textAlign"]').forEach(r => {
    r.addEventListener('change', (e) => {
      studioState.textAlign = e.target.value;
      renderPreview();
    });
  });

  // Letter Case
  document.querySelectorAll('input[name="letterCase"]').forEach(r => {
    r.addEventListener('change', (e) => {
      studioState.letterCase = e.target.value;
      updateNamesUI();
      renderPreview();
    });
  });

  // Shrink-to-fit
  dom.shrinkCheckbox.addEventListener('change', (e) => {
    studioState.shrinkToFit = e.target.checked;
    dom.maxWidthSliderBox.style.display = studioState.shrinkToFit ? 'flex' : 'none';
    renderPreview();
  });

  dom.maxWidthRange.addEventListener('input', (e) => {
    studioState.maxWidthFrac = parseInt(e.target.value, 10) / 100;
    dom.maxWidthLabel.textContent = `${e.target.value}%`;
    renderPreview();
  });

  // Position Alignment & Nudge Controls
  let nudgeStep = 0.5;
  const stepChips = document.querySelectorAll('#nudgeStepChips .step-chip');
  stepChips.forEach(chip => {
    chip.addEventListener('click', () => {
      stepChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      nudgeStep = parseFloat(chip.dataset.step) || 0.5;
    });
  });

  // Snap Centers
  dom.snapCenterBtn?.addEventListener('click', () => setCoordinates(50.0, 50.0));
  dom.nudgeCenterBtn?.addEventListener('click', () => setCoordinates(50.0, 50.0));
  dom.snapCenterXBtn?.addEventListener('click', () => setCoordinates(50.0, studioState.posYFrac * 100));
  dom.snapCenterYBtn?.addEventListener('click', () => setCoordinates(studioState.posXFrac * 100, 50.0));

  // Y-Axis controls (Up / Down)
  dom.nudgeUpBtn?.addEventListener('click', () => {
    setCoordinates(studioState.posXFrac * 100, (studioState.posYFrac * 100) - nudgeStep);
  });
  dom.nudgeDownBtn?.addEventListener('click', () => {
    setCoordinates(studioState.posXFrac * 100, (studioState.posYFrac * 100) + nudgeStep);
  });
  dom.posYInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setCoordinates(studioState.posXFrac * 100, val);
  });
  dom.posYRange?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setCoordinates(studioState.posXFrac * 100, val);
  });

  // X-Axis controls (Left / Right)
  dom.nudgeLeftBtn?.addEventListener('click', () => {
    setCoordinates((studioState.posXFrac * 100) - nudgeStep, studioState.posYFrac * 100);
  });
  dom.nudgeRightBtn?.addEventListener('click', () => {
    setCoordinates((studioState.posXFrac * 100) + nudgeStep, studioState.posYFrac * 100);
  });
  dom.posXInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setCoordinates(val, studioState.posYFrac * 100);
  });
  dom.posXRange?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setCoordinates(val, studioState.posYFrac * 100);
  });

  // Keyboard Arrow Keys Nudge Support
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    e.preventDefault();
    const mult = e.shiftKey ? 5 : 1;
    const step = nudgeStep * mult;

    if (e.key === 'ArrowUp') {
      setCoordinates(studioState.posXFrac * 100, (studioState.posYFrac * 100) - step);
    } else if (e.key === 'ArrowDown') {
      setCoordinates(studioState.posXFrac * 100, (studioState.posYFrac * 100) + step);
    } else if (e.key === 'ArrowLeft') {
      setCoordinates((studioState.posXFrac * 100) - step, studioState.posYFrac * 100);
    } else if (e.key === 'ArrowRight') {
      setCoordinates((studioState.posXFrac * 100) + step, studioState.posYFrac * 100);
    }
  });

  // Recipient Cycler Navigation
  dom.btnPrevRecipient.addEventListener('click', () => {
    if (studioState.currentIndex > 0) {
      studioState.currentIndex--;
      updateCyclerUI();
      renderPreview();
    }
  });

  dom.btnNextRecipient.addEventListener('click', () => {
    if (studioState.currentIndex < studioState.names.length - 1) {
      studioState.currentIndex++;
      updateCyclerUI();
      renderPreview();
    }
  });

  // High Res Preview in new tab
  dom.btnOpenFullResTest.addEventListener('click', async () => {
    if (!studioState.templateLoaded) {
      toast('Please upload a template first', 'warning');
      return;
    }
    const canvas = dom.renderEngineCanvas;
    canvas.width = studioState.templateWidth;
    canvas.height = studioState.templateHeight;
    const name = getCurrentRecipientName();
    await drawOnCanvas(canvas, name, false);
    const url = canvas.toDataURL('image/png');
    const w = window.open('');
    if (w) {
      w.document.write(`<html><body style="margin:0;background:#090c14;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${url}" style="max-width:96vw;max-height:96vh;border-radius:8px;box-shadow:0 15px 40px rgba(0,0,0,0.8);"/></body></html>`);
    }
  });

  // Export Format
  document.querySelectorAll('input[name="exportFormat"]').forEach(r => {
    r.addEventListener('change', (e) => {
      studioState.exportFormat = e.target.value;
    });
  });

  // Export Trigger
  const triggerExport = (mode) => {
    dom.progressContainer.style.display = 'block';
    dom.progressFillBar.style.width = '0%';
    dom.progressPercentNum.textContent = '0%';
    dom.progressLabel.textContent = `Exporting ${studioState.names.length} Certificates (${studioState.exportFormat.toUpperCase()})...`;

    dom.btnGenerateZip.disabled = true;
    dom.btnGenerateFolder.disabled = true;

    runBatchExport({
      mode,
      renderCanvas: dom.renderEngineCanvas,
      onProgress: (p) => {
        if (p.percent !== undefined) {
          dom.progressFillBar.style.width = `${p.percent}%`;
          dom.progressPercentNum.textContent = `${p.percent}%`;
        }
        if (p.fileName) {
          dom.progressCurrentFile.textContent = `Created ${p.index} of ${p.total}: ${p.fileName}`;
        } else if (p.status) {
          dom.progressCurrentFile.textContent = p.status;
        }
      },
      onFinished: (res) => {
        dom.btnGenerateZip.disabled = false;
        dom.btnGenerateFolder.disabled = false;
        if (!res.wasCancelled) {
          toast(`🎉 Finished ${res.completed} certificates in ${res.elapsed}s!`, 'success', 6000);
          dom.progressCurrentFile.textContent = `Completed ${res.completed} certificates in ${res.elapsed}s`;
        } else {
          toast('Export cancelled', 'info');
        }
      },
      onError: (err) => {
        dom.btnGenerateZip.disabled = false;
        dom.btnGenerateFolder.disabled = false;
        toast(err, 'error');
      }
    });
  };

  dom.btnGenerateZip.addEventListener('click', () => triggerExport('zip'));
  dom.btnGenerateFolder.addEventListener('click', () => triggerExport('folder'));
  dom.btnCancelGen.addEventListener('click', () => {
    studioState.cancelRequested = true;
    dom.progressCurrentFile.textContent = 'Cancelling export...';
  });
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
