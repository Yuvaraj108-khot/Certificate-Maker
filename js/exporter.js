/* =========================================================================
   BATCH EXPORT ENGINE (ZIP & FOLDER)
   ========================================================================= */

import { studioState } from './state.js';
import { drawOnCanvas, formatCase, loadFontAsync } from './canvas.js';

export function sanitizeForFilesystem(name) {
  if (!name) return 'Certificate';
  let safe = name.replace(/[/\\?%*:|"<>]/g, '').trim();
  safe = safe.replace(/\s+/g, ' ');
  return safe || 'Certificate';
}

export async function runBatchExport({
  mode, // 'zip' | 'folder'
  renderCanvas,
  onProgress,
  onFinished,
  onError
}) {
  if (!studioState.templateLoaded || !studioState.templateImage) {
    if (onError) onError('Please upload your Canva certificate template in Step 1 first');
    return;
  }

  if (studioState.names.length === 0) {
    if (onError) onError('Please enter or upload recipient names in Step 2');
    return;
  }

  let folderHandle = null;
  if (mode === 'folder') {
    if (!('showDirectoryPicker' in window)) {
      if (onError) onError('File System Access API is not supported in this browser. Falling back to ZIP export.');
      mode = 'zip';
    } else {
      try {
        folderHandle = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'downloads' });
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (onError) onError('Could not open folder. Falling back to ZIP export.');
        mode = 'zip';
      }
    }
  }

  studioState.isGenerating = true;
  studioState.cancelRequested = false;

  renderCanvas.width = studioState.templateWidth;
  renderCanvas.height = studioState.templateHeight;

  const nameFreq = new Map();
  const zip = mode === 'zip' ? new JSZip() : null;
  const total = studioState.names.length;
  let completed = 0;
  const startTime = performance.now();

  await loadFontAsync(studioState.fontFamily, studioState.fontWeight);

  for (let i = 0; i < total; i++) {
    if (studioState.cancelRequested) {
      break;
    }

    const raw = studioState.names[i];
    const formatted = formatCase(raw, studioState.letterCase);
    const baseName = sanitizeForFilesystem(formatted);

    const count = (nameFreq.get(baseName) || 0) + 1;
    nameFreq.set(baseName, count);

    const fileName = count === 1
      ? `${baseName}.${studioState.exportFormat}`
      : `${baseName} (${count}).${studioState.exportFormat}`;

    const percent = Math.round(((i + 1) / total) * 100);
    if (onProgress) {
      onProgress({
        index: i + 1,
        total,
        percent,
        fileName,
        currentName: formatted
      });
    }

    // Render certificate at full original template resolution
    await drawOnCanvas(renderCanvas, formatted, false);

    if (studioState.exportFormat === 'png') {
      const blob = await new Promise(r => renderCanvas.toBlob(r, 'image/png'));
      if (mode === 'zip') {
        zip.file(fileName, blob);
      } else if (folderHandle) {
        const handle = await folderHandle.getFileHandle(fileName, { create: true });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      }
    } else {
      // PDF Export
      const orientation = studioState.templateWidth >= studioState.templateHeight ? 'landscape' : 'portrait';
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [studioState.templateWidth, studioState.templateHeight],
        compress: true
      });

      const imgData = renderCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, studioState.templateWidth, studioState.templateHeight);
      const pdfBlob = pdf.output('blob');

      if (mode === 'zip') {
        zip.file(fileName, pdfBlob);
      } else if (folderHandle) {
        const handle = await folderHandle.getFileHandle(fileName, { create: true });
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
      }
    }

    completed++;
    // Keep UI responsive during loop
    await new Promise(r => setTimeout(r, 0));
  }

  if (!studioState.cancelRequested && completed > 0) {
    if (mode === 'zip') {
      if (onProgress) onProgress({ status: 'Packaging ZIP archive...' });
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (m) => {
        if (onProgress) onProgress({ status: `Compressing ZIP: ${m.percent.toFixed(0)}%` });
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificates_${studioState.exportFormat.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    if (onFinished) onFinished({ completed, elapsed, wasCancelled: false });
  } else if (studioState.cancelRequested) {
    if (onFinished) onFinished({ completed, elapsed: 0, wasCancelled: true });
  }

  studioState.isGenerating = false;
}
