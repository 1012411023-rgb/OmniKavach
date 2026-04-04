import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Image, X, File, CheckCircle2, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const ACCEPTED_TYPES = {
  'application/pdf': { label: 'PDF', icon: FileText, color: 'text-red-500' },
  'image/png': { label: 'PNG', icon: Image, color: 'text-blue-500' },
  'image/jpeg': { label: 'JPEG', icon: Image, color: 'text-amber-500' },
  'image/jpg': { label: 'JPG', icon: Image, color: 'text-amber-500' },
  'image/webp': { label: 'WEBP', icon: Image, color: 'text-purple-500' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Clinical keywords to detect in extracted text
const CLINICAL_KEYWORDS = [
  'sepsis', 'septic shock', 'lactate', 'hypotension', 'hypotensive',
  'vasopressor', 'norepinephrine', 'antibiotics', 'creatinine', 'oliguria',
  'tachycardia', 'fever', 'leukocytosis', 'organ dysfunction', 'intubated',
  'ventilator', 'ards', 'pneumonia', 'aki', 'hyperkalemia', 'hyponatremia',
  'blood culture', 'procalcitonin', 'sofa score', 'qsofa', 'map',
  'cvp', 'svo2', 'cardiac output', 'ejection fraction', 'bnp',
  'troponin', 'hemoglobin', 'platelets', 'inr', 'ptt', 'fibrinogen',
  'd-dimer', 'blood pressure', 'heart rate', 'respiratory rate',
  'oxygen saturation', 'spo2', 'fio2', 'peep', 'tidal volume',
  'urine output', 'fluid resuscitation', 'bolus', 'infusion',
  'sedation', 'analgesia', 'paralytic', 'prone position',
  'dialysis', 'crrt', 'rrt', 'ecmo', 'iabp',
  'chest x-ray', 'ct scan', 'mri', 'ultrasound', 'echocardiogram',
  'diagnosis', 'prognosis', 'treatment', 'medication', 'dosage',
  'admission', 'discharge', 'transfer', 'consult', 'assessment',
];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Extract text from a PDF file using pdf.js
 */
async function extractPDFText(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.({ stage: `Reading page ${i}/${totalPages}`, percent: Math.round((i / totalPages) * 100) });
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}

/**
 * Extract text from an image using Tesseract.js OCR
 */
async function extractImageText(file, onProgress) {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress?.({ stage: 'OCR Processing', percent: Math.round(m.progress * 100) });
      }
    },
  });

  const imageUrl = URL.createObjectURL(file);
  try {
    const { data: { text } } = await worker.recognize(imageUrl);
    return text.trim();
  } finally {
    URL.revokeObjectURL(imageUrl);
    await worker.terminate();
  }
}

/**
 * Find clinical keywords in text
 */
function findClinicalKeywords(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const keyword of CLINICAL_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  }
  return [...new Set(found)];
}

export default function NoteParser({ patientId, onParseComplete }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseResults, setParseResults] = useState(null);
  const [progress, setProgress] = useState(null); // { fileName, stage, percent }
  const [expandedResults, setExpandedResults] = useState({}); // track which results show full text
  const inputRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const newFiles = [];
    for (const file of incoming) {
      if (!ACCEPTED_TYPES[file.type]) {
        newFiles.push({ file, error: 'Unsupported file type. Use PDF, PNG, JPEG, or WEBP.' });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        newFiles.push({ file, error: `File exceeds ${formatSize(MAX_FILE_SIZE)} limit.` });
        continue;
      }
      // Generate preview for images
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      newFiles.push({ file, error: null, preview, status: 'ready' });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // Real parsing with OCR + PDF extraction
  const handleParse = async () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length === 0) return;

    setParsing(true);
    setParseResults(null);
    setExpandedResults({});

    // Update statuses
    setFiles((prev) =>
      prev.map((f) => (f.error ? f : { ...f, status: 'parsing' }))
    );

    const results = [];

    for (let i = 0; i < validFiles.length; i++) {
      const entry = validFiles[i];
      const fileName = entry.file.name;

      setProgress({ fileName, stage: 'Starting...', percent: 0 });

      try {
        let extractedText = '';

        if (entry.file.type === 'application/pdf') {
          extractedText = await extractPDFText(entry.file, (p) =>
            setProgress({ fileName, ...p })
          );
        } else {
          // Image file — use OCR
          extractedText = await extractImageText(entry.file, (p) =>
            setProgress({ fileName, ...p })
          );
        }

        const clinicalKeywords = findClinicalKeywords(extractedText);
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

        results.push({
          name: fileName,
          extractedText,
          clinicalKeywords,
          wordCount,
          type: entry.file.type === 'application/pdf' ? 'PDF' : 'Image (OCR)',
          success: true,
        });
      } catch (err) {
        console.error(`Failed to parse ${fileName}:`, err);
        results.push({
          name: fileName,
          extractedText: '',
          clinicalKeywords: [],
          wordCount: 0,
          type: entry.file.type === 'application/pdf' ? 'PDF' : 'Image (OCR)',
          success: false,
          error: err.message || 'Extraction failed',
        });
      }
    }

    setFiles((prev) =>
      prev.map((f) => (f.error ? f : { ...f, status: 'done' }))
    );
    setParseResults(results);
    setParsing(false);
    setProgress(null);

    if (onParseComplete) onParseComplete(results);
  };

  const toggleExpanded = (index) => {
    setExpandedResults((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const validCount = files.filter((f) => !f.error).length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
          ${dragActive
            ? 'border-[var(--accent)] bg-[var(--accent-bg)] scale-[1.01]'
            : 'border-[var(--border-hover)] hover:border-[var(--accent)] bg-[var(--bg-secondary)]'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors
            ${dragActive ? 'bg-[var(--accent-bg)]' : 'bg-[var(--bg)]'}`}>
            <Upload className={`w-5 h-5 transition-colors ${dragActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
          </div>

          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            {dragActive ? 'Drop files here' : 'Drag & drop clinical documents'}
          </p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-1">
            PDF, PNG, JPEG, WEBP up to 10 MB — or <span className="text-[var(--accent)] underline">browse</span>
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-2 font-mono">
            Images → OCR &middot; PDFs → text parsing
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {files.length} file{files.length > 1 ? 's' : ''} attached
          </p>

          {files.map((entry, idx) => {
            const meta = ACCEPTED_TYPES[entry.file.type];
            const Icon = meta?.icon || File;
            const color = meta?.color || 'text-slate-400';

            return (
              <div
                key={`${entry.file.name}-${idx}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all
                  ${entry.error
                    ? 'bg-red-50/60 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                    : entry.status === 'done'
                      ? 'bg-emerald-50/60 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
              >
                {/* Preview or Icon */}
                {entry.preview ? (
                  <img
                    src={entry.preview}
                    alt={entry.file.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-600"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                    {entry.file.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {meta?.label || 'FILE'} &middot; {formatSize(entry.file.size)}
                    {entry.file.type.startsWith('image/') && ' · OCR'}
                  </p>
                  {entry.error && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {entry.error}
                    </p>
                  )}
                </div>

                {/* Status */}
                {entry.status === 'parsing' && <Loader2 className="w-4 h-4 text-blue-500 dark:text-cyan-400 animate-spin flex-shrink-0" />}
                {entry.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}

                {/* Remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Indicator */}
      {progress && (
        <div className="rounded-xl border border-blue-200 dark:border-cyan-500/30 bg-blue-50/60 dark:bg-cyan-500/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-blue-700 dark:text-cyan-300 truncate flex-1">
              {progress.fileName}
            </span>
            <span className="text-[10px] font-mono text-blue-500 dark:text-cyan-400 ml-2">
              {progress.percent}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-blue-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-[10px] text-blue-600/70 dark:text-cyan-300/60 mt-1.5 font-mono">
            {progress.stage}
          </p>
        </div>
      )}

      {/* Parse Button */}
      {validCount > 0 && !parsing && (
        <button
          onClick={handleParse}
          disabled={parsing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all
            bg-blue-600 dark:bg-cyan-500 border-blue-600 dark:border-cyan-500 text-white hover:bg-blue-700 dark:hover:bg-cyan-600"
        >
          <FileText className="w-3.5 h-3.5" /> Parse {validCount} Clinical Document{validCount > 1 ? 's' : ''}
        </button>
      )}

      {parsing && (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all
            bg-blue-50 dark:bg-cyan-500/10 border-blue-200 dark:border-cyan-500/30 text-blue-400 dark:text-cyan-500 cursor-not-allowed"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting text from {validCount} file{validCount > 1 ? 's' : ''}...
        </button>
      )}

      {/* Parse Results */}
      {parseResults && (
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Extraction Complete — {parseResults.length} file{parseResults.length > 1 ? 's' : ''} processed
          </p>

          {parseResults.map((r, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3.5 space-y-3 ${
                r.success
                  ? 'bg-emerald-50/60 dark:bg-emerald-500/8 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-red-50/60 dark:bg-red-500/8 border-red-200 dark:border-red-500/30'
              }`}
            >
              {/* File header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{r.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono">
                    {r.type} · {r.wordCount} words
                  </span>
                </div>
                {r.success && (
                  <button
                    onClick={() => toggleExpanded(i)}
                    className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    {expandedResults[i] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {expandedResults[i] ? 'Hide text' : 'Show extracted text'}
                  </button>
                )}
              </div>

              {/* Error message */}
              {!r.success && (
                <div className="flex items-center gap-2 text-[11px] text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Extraction failed: {r.error}</span>
                </div>
              )}

              {/* Extracted text preview */}
              {r.success && expandedResults[i] && (
                <div className="bg-white/80 dark:bg-slate-900/60 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700/40 max-h-48 overflow-y-auto">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {r.extractedText || '(No text extracted)'}
                  </p>
                </div>
              )}

              {/* Clinical keywords found */}
              {r.success && r.clinicalKeywords.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1.5">
                    Clinical Keywords Detected ({r.clinicalKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {r.clinicalKeywords.map((kw, j) => (
                      <span
                        key={j}
                        className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono border border-emerald-200 dark:border-emerald-500/30"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {r.success && r.clinicalKeywords.length === 0 && r.wordCount > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  No clinical keywords detected in extracted text
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
