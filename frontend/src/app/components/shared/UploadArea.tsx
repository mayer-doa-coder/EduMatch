/**
 * UploadArea — shared drag-and-drop file upload widget.
 *
 * Props:
 *   label        — area heading
 *   accept       — file-input accept string (default: all)
 *   multiple     — allow multi-file selection (default: false)
 *   maxMb        — max size per file in MB (default: 5)
 *   onFiles      — called with accepted File[] after validation
 *   files        — currently displayed files (controlled, optional)
 *   onRemove     — called with index to remove a file (optional)
 *
 * When `files` is not provided the component manages its own list.
 */

import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { Upload, FileText, X, Eye, Download } from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  name:    string;
  size:    number;
  type:    string;
  dataUrl: string;
}

export interface UploadAreaProps {
  label:     string;
  accept?:   string;
  multiple?: boolean;
  maxMb?:    number;
  onFiles?:  (files: File[]) => void;
  files?:    UploadedFile[];
  onRemove?: (index: number) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1_048_576)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

export function UploadArea({
  label,
  accept = "*",
  multiple = false,
  maxMb = 5,
  onFiles,
  files: controlled,
  onRemove,
}: UploadAreaProps) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [internal, setInternal] = useState<UploadedFile[]>([]);

  const files   = controlled ?? internal;
  const maxBytes = maxMb * 1_048_576;

  const processFiles = useCallback(
    async (raw: FileList) => {
      const list      = Array.from(raw);
      const tooBig    = list.filter(f => f.size > maxBytes);
      const accepted  = list.filter(f => f.size <= maxBytes);

      if (tooBig.length) {
        toast.error(`${tooBig.map(f => f.name).join(", ")} exceeded ${maxMb} MB.`);
      }
      if (!accepted.length) return;

      const stored: UploadedFile[] = await Promise.all(
        accepted.map(async f => ({
          name:    f.name,
          size:    f.size,
          type:    f.type,
          dataUrl: await readAsDataUrl(f),
        })),
      );

      if (controlled == null) {
        setInternal(prev => multiple ? [...prev, ...stored] : stored);
      }
      onFiles?.(accepted);
      toast.success(`${stored.length} file${stored.length > 1 ? "s" : ""} uploaded!`);
    },
    [controlled, maxBytes, maxMb, multiple, onFiles],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    if (onRemove) {
      onRemove(idx);
    } else {
      setInternal(prev => prev.filter((_, i) => i !== idx));
    }
    toast.success("File removed.");
  }

  return (
    <div className="space-y-2">
      {/* Uploaded file list */}
      {files.map((f, idx) => (
        <div
          key={`${f.name}-${idx}`}
          className="flex items-center gap-3 p-3 rounded-xl border group"
          style={{ borderColor: "var(--edu-border)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}
          >
            <FileText size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "var(--edu-dark)" }}>
              {f.name}
            </div>
            <div className="text-xs" style={{ color: "var(--edu-light)" }}>{fmt(f.size)}</div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={f.dataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-100"
              title="View"
            >
              <Eye size={14} style={{ color: "var(--edu-primary)" }} />
            </a>
            <a
              href={f.dataUrl}
              download={f.name}
              className="p-1.5 rounded hover:bg-gray-100"
              title="Download"
            >
              <Download size={14} style={{ color: "var(--edu-primary)" }} />
            </a>
            <button
              onClick={() => removeFile(idx)}
              className="p-1.5 rounded hover:bg-red-50"
              title="Remove"
            >
              <X size={14} style={{ color: "var(--edu-danger)" }} />
            </button>
          </div>
        </div>
      ))}

      {/* Drop zone */}
      <label
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed
                   p-7 text-center cursor-pointer transition-colors select-none"
        style={{
          borderColor: dragging ? "var(--edu-secondary)" : "var(--edu-border)",
          background:  dragging ? "rgba(87,197,182,0.06)" : "transparent",
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={e => { e.preventDefault(); inputRef.current?.click(); }}
      >
        <Upload
          size={24}
          style={{ color: dragging ? "var(--edu-secondary)" : "var(--edu-primary)" }}
        />
        <div>
          <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>{label}</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
            Drag & drop or <span style={{ color: "var(--edu-primary)", textDecoration: "underline" }}>browse</span>
            {" · "}max {maxMb} MB
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
