/**
 * StudentProfile — fully interactive Profile & Skills page.
 *
 * Features:
 *  • Avatar upload  — click the avatar ring (or camera overlay) to pick an image;
 *                     compressed to 120 px and stored in localStorage.
 *  • Inline editing — a single "Edit" toggle makes all fields writeable;
 *                     CGPA is validated (0.00–4.00); changes are saved to
 *                     localStorage and POSTed to the API when available.
 *  • Skill tags     — add (type + Enter) and remove (×) both verified and
 *                     technical-skill tags independently.
 *  • Documents tab  — drag-and-drop or click-to-upload for Resume (single,
 *                     PDF/DOC) and Certificates (multiple, PDF/JPG/PNG);
 *                     each file shows name, size, date, view/download, delete.
 */

import {
  useEffect, useRef, useState, useCallback, type ChangeEvent,
} from "react";
import { Card }   from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge }  from "../../ui/badge";
import { Input }  from "../../ui/input";
import { Label }  from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Progress } from "../../ui/progress";
import { SectionTitle } from "../../shared/SectionTitle";
import { toast } from "sonner";
import {
  Camera, Pencil, Check, X, Plus, Upload, FileText,
  Trash2, Eye, Download, GraduationCap, Sparkles,
  BadgeCheck, BookOpen, AlertCircle,
} from "lucide-react";
import { currentStudent } from "../../edu-data";

const API = "http://localhost/EduMatch/backend";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StudentData {
  name:               string;
  email:              string;
  cgpa:               number;
  university:         string;
  department:         string;
  research_interest:  string;
  technical_skills:   string;
  bio:                string;
}

interface ApiSkill {
  skill_name:       string;
  verified:         boolean;
  verified_by_name: string | null;
}

interface StoredFile {
  id:         string;
  name:       string;
  size:       number;
  type:       string;
  uploadedAt: string;
  dataUrl:    string;
}

type Props = { userId: number; profileId: number | null };

// ── Storage helpers ────────────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}

// ── Image compression utility ──────────────────────────────────────────────────

async function compressAvatar(file: File, maxPx = 120): Promise<string> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Single uploaded-file row with view, download, delete actions. */
function FileRow({
  file,
  onDelete,
}: {
  file: StoredFile;
  onDelete: (id: string) => void;
}) {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  const isImage = /png|jpe?g|gif|webp/i.test(ext);

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border group"
      style={{ borderColor: "var(--edu-border)" }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
        style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)" }}
      >
        {ext === "PDF" ? <FileText size={18} /> : <BookOpen size={18} />}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: "var(--edu-dark)" }}>
          {file.name}
        </div>
        <div className="text-xs" style={{ color: "var(--edu-light)" }}>
          {formatBytes(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* View / open */}
        <a
          href={file.dataUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={isImage ? undefined : file.name}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="View"
        >
          <Eye size={15} style={{ color: "var(--edu-primary)" }} />
        </a>
        {/* Download */}
        <a
          href={file.dataUrl}
          download={file.name}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Download"
        >
          <Download size={15} style={{ color: "var(--edu-primary)" }} />
        </a>
        {/* Delete */}
        <button
          onClick={() => onDelete(file.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          title="Remove"
        >
          <Trash2 size={15} style={{ color: "var(--edu-danger)" }} />
        </button>
      </div>
    </div>
  );
}

/** Dropzone that accepts a file or emits drag events. */
function DropZone({
  accept,
  multiple = false,
  onFiles,
  label,
  sublabel,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
  label: string;
  sublabel: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  return (
    <label
      className="block rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors select-none"
      style={{
        borderColor: dragging ? "var(--edu-secondary)" : "var(--edu-border)",
        background:  dragging ? "rgba(87,197,182,0.06)" : "transparent",
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Upload
        className="mx-auto mb-2"
        size={24}
        style={{ color: dragging ? "var(--edu-secondary)" : "var(--edu-primary)" }}
      />
      <div className="font-semibold text-sm" style={{ color: "var(--edu-dark)" }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>{sublabel}</div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={e => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }}
      />
    </label>
  );
}

// ── Skill tag editor ───────────────────────────────────────────────────────────

function SkillTagEditor({
  skills,
  onChange,
  editing,
  colorClass = "rgba(26,95,122,0.1)",
  textColor = "var(--edu-primary)",
  verifiedMap,
}: {
  skills:       string[];
  onChange:     (s: string[]) => void;
  editing:      boolean;
  colorClass?:  string;
  textColor?:   string;
  verifiedMap?: Record<string, boolean>;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || skills.map(s => s.toLowerCase()).includes(v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...skills, v]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {skills.map(s => {
        const isVerified = verifiedMap?.[s] ?? false;
        return (
          <span
            key={s}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{ background: isVerified ? "rgba(40,167,69,0.12)" : colorClass, color: isVerified ? "var(--edu-success)" : textColor }}
          >
            {isVerified && <BadgeCheck size={12} />}
            {s}
            {editing && (
              <button
                className="ml-1 hover:opacity-70 transition-opacity"
                onClick={() => onChange(skills.filter(x => x !== s))}
                aria-label={`Remove ${s}`}
              >
                <X size={11} />
              </button>
            )}
          </span>
        );
      })}

      {editing && (
        <div className="flex items-center gap-1">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="Add skill…"
            className="h-7 text-xs w-32 rounded-full px-3"
          />
          <button
            onClick={add}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(26,95,122,0.1)", color: "var(--edu-primary)" }}
            title="Add"
          >
            <Plus size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StudentProfile({ userId, profileId }: Props) {
  // ── Data & edit state ──────────────────────────────────────────────────────
  const [apiData,   setApiData]   = useState<StudentData | null>(null);
  const [apiSkills, setApiSkills] = useState<ApiSkill[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Merged: API data overlaid with any saved edits
  const [draft, setDraft] = useState<StudentData>({
    name:               "",
    email:              "",
    cgpa:               0,
    university:         "",
    department:         "",
    research_interest:  "",
    technical_skills:   "",
    bio:                "",
  });

  // Skill lists (editable separately)
  const [platformSkills, setPlatformSkills] = useState<string[]>([]);
  const [techSkills,     setTechSkills]     = useState<string[]>([]);

  // Avatar
  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(null);
  const avatarInputRef              = useRef<HTMLInputElement>(null);

  // Files
  const [resume, setResume]   = useState<StoredFile[]>([]);
  const [certs,  setCerts]    = useState<StoredFile[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const storageKey  = `portal_profile_${userId}`;
    const skillsKey   = `portal_skills_${userId}`;
    const techKey     = `portal_techskills_${userId}`;
    const savedAvatar = localStorage.getItem(`portal_avatar_${userId}`);
    const savedResume = lsGet<StoredFile[]>(`portal_resume_${userId}`, []);
    const savedCerts  = lsGet<StoredFile[]>(`portal_certs_${userId}`,  []);

    if (savedAvatar) setAvatarUrl(savedAvatar);
    setResume(savedResume);
    setCerts(savedCerts);

    // Seed from mock if no backend profile
    const mockBase: StudentData = {
      name:               currentStudent.name,
      email:              currentStudent.email,
      cgpa:               currentStudent.cgpa,
      university:         currentStudent.university,
      department:         "Computer Science",
      research_interest:  currentStudent.interests.join(", "),
      technical_skills:   currentStudent.skills.join(", "),
      bio:                "Passionate about machine learning and distributed systems.",
    };

    if (!profileId) {
      const saved = lsGet<Partial<StudentData>>(storageKey, {});
      const merged = { ...mockBase, ...saved };
      setDraft(merged);
      setApiData(merged);
      const savedSkillNames = lsGet<string[]>(skillsKey, currentStudent.skills);
      const savedTech       = lsGet<string[]>(techKey,   currentStudent.skills);
      setPlatformSkills(savedSkillNames);
      setTechSkills(savedTech);
      setLoading(false);
      return;
    }

    fetch(`${API}/get_student_dashboard.php?student_id=${profileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const base: StudentData = {
            name:               d.student.name,
            email:              d.student.email,
            cgpa:               d.student.cgpa,
            university:         d.student.university,
            department:         d.student.department ?? "Computer Science",
            research_interest:  d.student.research_interest,
            technical_skills:   d.student.technical_skills,
            bio:                d.student.bio ?? "",
          };
          const saved = lsGet<Partial<StudentData>>(storageKey, {});
          const merged = { ...base, ...saved };
          setApiData(base);
          setDraft(merged);
          const rawSkills: ApiSkill[] = d.skills ?? [];
          setApiSkills(rawSkills);
          const savedNames = lsGet<string[]>(skillsKey, rawSkills.map((s: ApiSkill) => s.skill_name));
          const savedTech  = lsGet<string[]>(techKey,   (merged.technical_skills ?? "").split(",").map(s => s.trim()).filter(Boolean));
          setPlatformSkills(savedNames);
          setTechSkills(savedTech);
        } else {
          const saved  = lsGet<Partial<StudentData>>(storageKey, {});
          const merged = { ...mockBase, ...saved };
          setDraft(merged);
          setApiData(merged);
          setPlatformSkills(lsGet<string[]>(skillsKey, currentStudent.skills));
          setTechSkills(lsGet<string[]>(techKey, currentStudent.skills));
        }
      })
      .catch(() => {
        const saved  = lsGet<Partial<StudentData>>(storageKey, {});
        const merged = { ...mockBase, ...saved };
        setDraft(merged);
        setApiData(merged);
        setPlatformSkills(lsGet<string[]>(`portal_skills_${userId}`, currentStudent.skills));
        setTechSkills(lsGet<string[]>(`portal_techskills_${userId}`, currentStudent.skills));
      })
      .finally(() => setLoading(false));
  }, [userId, profileId]);

  // ── Validate ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    const cgpa = parseFloat(String(draft.cgpa));
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0)
      e.cgpa = "CGPA must be between 0.00 and 4.00";
    if (!draft.name.trim())
      e.name = "Name is required";
    if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) {
      toast.error("Fix the errors before saving.");
      return;
    }
    setSaving(true);
    const storageKey = `portal_profile_${userId}`;
    const skillsKey  = `portal_skills_${userId}`;
    const techKey    = `portal_techskills_${userId}`;
    lsSet(storageKey, draft);
    lsSet(skillsKey,  platformSkills);
    lsSet(techKey,    techSkills);

    // Attempt API save (fire-and-forget)
    if (profileId) {
      try {
        await fetch(`${API}/update_student_profile.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id:        profileId,
            cgpa:              parseFloat(String(draft.cgpa)),
            research_interest: draft.research_interest,
            technical_skills:  techSkills.join(", "),
            bio:               draft.bio,
          }),
        });
      } catch {
        // API unavailable — localStorage already saved
      }
    }
    setSaving(false);
    setEditing(false);
    setErrors({});
    toast.success("Profile saved!");
  }

  function handleCancel() {
    // Revert to last persisted state
    const saved = lsGet<Partial<StudentData>>(`portal_profile_${userId}`, {});
    setDraft({ ...(apiData ?? draft), ...saved });
    setPlatformSkills(lsGet<string[]>(`portal_skills_${userId}`, platformSkills));
    setTechSkills(lsGet<string[]>(`portal_techskills_${userId}`, techSkills));
    setErrors({});
    setEditing(false);
  }

  function set(field: keyof StudentData, value: string | number) {
    setDraft(d => ({ ...d, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  // ── Avatar upload ──────────────────────────────────────────────────────────
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 8_000_000) {
      toast.error("Image must be under 8 MB.");
      return;
    }
    try {
      const compressed = await compressAvatar(file, 120);
      setAvatarUrl(compressed);
      localStorage.setItem(`portal_avatar_${userId}`, compressed);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Could not process image.");
    }
    e.target.value = "";
  }

  // ── File helpers ───────────────────────────────────────────────────────────
  const MAX_FILE_BYTES = 5 * 1_048_576; // 5 MB

  async function addFiles(
    fileList: FileList,
    setter: React.Dispatch<React.SetStateAction<StoredFile[]>>,
    storageKey: string,
    replace = false,
  ) {
    const incoming = Array.from(fileList);
    const tooBig   = incoming.filter(f => f.size > MAX_FILE_BYTES);
    if (tooBig.length) {
      toast.error(`${tooBig.map(f => f.name).join(", ")} exceeded 5 MB limit.`);
    }
    const valid = incoming.filter(f => f.size <= MAX_FILE_BYTES);
    if (!valid.length) return;

    const stored: StoredFile[] = await Promise.all(
      valid.map(async f => ({
        id:         `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name:       f.name,
        size:       f.size,
        type:       f.type,
        uploadedAt: new Date().toISOString(),
        dataUrl:    await readAsDataUrl(f),
      })),
    );

    setter(prev => {
      const next = replace ? stored : [...prev, ...stored];
      lsSet(storageKey, next);
      return next;
    });
    toast.success(`${stored.length} file${stored.length > 1 ? "s" : ""} uploaded!`);
  }

  function deleteFile(
    id: string,
    setter: React.Dispatch<React.SetStateAction<StoredFile[]>>,
    storageKey: string,
  ) {
    setter(prev => {
      const next = prev.filter(f => f.id !== id);
      lsSet(storageKey, next);
      return next;
    });
    toast.success("File removed.");
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayName = draft.name || "Student";
  const inits = displayName.split(" ").map(p => p[0] ?? "").join("").slice(0, 2).toUpperCase();
  const verifiedMap: Record<string, boolean> = {};
  apiSkills.forEach(s => { verifiedMap[s.skill_name] = s.verified; });
  const cgpaNum = parseFloat(String(draft.cgpa));
  const cgpaPct = isNaN(cgpaNum) ? 0 : Math.min((cgpaNum / 4) * 100, 100);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: "var(--edu-light)" }}>
        Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionTitle title="Profile & Skills" sub="Keep your profile updated for better AI matches." />
        {editing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              style={{ background: "var(--edu-primary)" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? <span className="animate-pulse">Saving…</span>
                : <><Check size={14} className="mr-1" /> Save changes</>}
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="rounded-full"
            variant="outline"
            style={{ borderColor: "var(--edu-primary)", color: "var(--edu-primary)" }}
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} className="mr-1.5" /> Edit profile
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">

        {/* ── Left: Avatar card ──────────────────────────────────────────── */}
        <Card className="md:col-span-1 p-6 rounded-2xl bg-white edu-card-shadow border-0 flex flex-col items-center text-center gap-4">

          {/* Clickable avatar */}
          <div className="relative group">
            <Avatar className="w-24 h-24 ring-4" style={{ ringColor: "var(--edu-border)" }}>
              {avatarUrl
                ? <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                : <AvatarFallback className="edu-gradient text-white text-2xl font-bold">{inits}</AvatarFallback>}
            </Avatar>
            {/* Camera overlay */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center
                         bg-black/0 group-hover:bg-black/40 transition-colors"
              title="Change photo"
              aria-label="Upload avatar"
            >
              <Camera
                size={22}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {/* Small camera badge */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
              style={{ background: "var(--edu-primary)" }}
              title="Change photo"
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>

          <div>
            <h3 className="font-bold text-lg" style={{ color: "var(--edu-primary)" }}>
              {displayName}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "var(--edu-light)" }}>
              {draft.research_interest?.split(",")[0]?.trim() ?? "Researcher"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
              {draft.university}
            </p>
          </div>

          {/* CGPA progress ring (horizontal bar version) */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--edu-light)" }}>
              <span className="flex items-center gap-1">
                <GraduationCap size={11} /> CGPA
              </span>
              <span className="font-semibold" style={{ color: "var(--edu-primary)" }}>
                {isNaN(cgpaNum) ? "—" : cgpaNum.toFixed(2)} / 4.00
              </span>
            </div>
            <Progress
              value={cgpaPct}
              className="h-2"
              style={{ background: "var(--edu-border)" }}
            />
          </div>

          {/* Quick stats */}
          <div className="w-full grid grid-cols-2 gap-2 text-center">
            {[
              { icon: Sparkles,   label: "Skills",   value: (platformSkills.length + techSkills.length) },
              { icon: BookOpen,   label: "Docs",     value: resume.length + certs.length },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl py-2"
                style={{ background: "var(--edu-bg)" }}
              >
                <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: "var(--edu-primary)" }}>
                  <Icon size={13} />
                  <span className="text-xs" style={{ color: "var(--edu-light)" }}>{label}</span>
                </div>
                <div className="font-bold text-sm" style={{ color: "var(--edu-primary)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Verified badge count */}
          {apiSkills.filter(s => s.verified).length > 0 && (
            <div
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: "rgba(40,167,69,0.1)", color: "var(--edu-success)" }}
            >
              <BadgeCheck size={14} />
              {apiSkills.filter(s => s.verified).length} verified skill{apiSkills.filter(s => s.verified).length > 1 ? "s" : ""}
            </div>
          )}
        </Card>

        {/* ── Right: Tabs ────────────────────────────────────────────────── */}
        <Card className="md:col-span-2 p-6 rounded-2xl bg-white edu-card-shadow border-0">
          <Tabs defaultValue="personal">
            <TabsList className="mb-2">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* ── Personal tab ───────────────────────────────────────────── */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full Name" error={errors.name}>
                  <Input
                    value={draft.name}
                    onChange={e => set("name", e.target.value)}
                    readOnly={!editing}
                    className={`mt-1 ${!editing ? "bg-gray-50 cursor-default" : ""}`}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <Input
                    value={draft.email}
                    onChange={e => set("email", e.target.value)}
                    readOnly={!editing}
                    className={`mt-1 ${!editing ? "bg-gray-50 cursor-default" : ""}`}
                    type="email"
                  />
                </Field>
                <Field label="University">
                  <Input
                    value={draft.university}
                    onChange={e => set("university", e.target.value)}
                    readOnly={!editing}
                    className={`mt-1 ${!editing ? "bg-gray-50 cursor-default" : ""}`}
                  />
                </Field>
                <Field label="Department">
                  <Input
                    value={draft.department}
                    onChange={e => set("department", e.target.value)}
                    readOnly={!editing}
                    className={`mt-1 ${!editing ? "bg-gray-50 cursor-default" : ""}`}
                  />
                </Field>
              </div>
              <Field label="Bio / About">
                <textarea
                  value={draft.bio}
                  onChange={e => set("bio", e.target.value)}
                  readOnly={!editing}
                  rows={3}
                  className={`mt-1 w-full text-sm rounded-xl border px-3 py-2 resize-none
                    focus:outline-none focus:ring-2 focus:ring-[var(--edu-secondary)]
                    ${!editing ? "bg-gray-50 cursor-default" : "bg-white"}`}
                  style={{ borderColor: "var(--edu-border)", color: "var(--edu-dark)" }}
                  placeholder={editing ? "Tell supervisors and recruiters about yourself…" : "—"}
                />
              </Field>
            </TabsContent>

            {/* ── Academic tab ───────────────────────────────────────────── */}
            <TabsContent value="academic" className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="CGPA (0.00 – 4.00)" error={errors.cgpa}>
                  <Input
                    value={String(draft.cgpa)}
                    onChange={e => set("cgpa", e.target.value)}
                    readOnly={!editing}
                    type={editing ? "number" : "text"}
                    step="0.01"
                    min="0"
                    max="4"
                    className={`mt-1 ${!editing ? "bg-gray-50 cursor-default" : ""} ${errors.cgpa ? "border-red-400" : ""}`}
                  />
                </Field>
                <Field label="Research Interest">
                  <Input
                    value={draft.research_interest}
                    onChange={e => set("research_interest", e.target.value)}
                    readOnly={!editing}
                    className={`mt-1 ${!editing ? "bg-gray-50 cursor-default" : ""}`}
                    placeholder={editing ? "Machine Learning, NLP, …" : ""}
                  />
                </Field>
              </div>
              {!editing && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{ background: "rgba(26,95,122,0.05)", color: "var(--edu-light)" }}
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: "var(--edu-primary)" }} />
                  CGPA is used by the AI matching algorithm. Click <strong>Edit profile</strong> to update.
                </div>
              )}
            </TabsContent>

            {/* ── Skills tab ─────────────────────────────────────────────── */}
            <TabsContent value="skills" className="space-y-6 mt-4">
              {/* Platform / verified skills */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label>Platform Skills</Label>
                  {apiSkills.length > 0 && (
                    <Badge
                      className="text-xs"
                      style={{ background: "rgba(40,167,69,0.12)", color: "var(--edu-success)", border: "none" }}
                    >
                      {apiSkills.filter(s => s.verified).length} verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--edu-light)" }}>
                  Skills recorded from your activity. Verified skills boost your match score.
                </p>
                <SkillTagEditor
                  skills={platformSkills}
                  onChange={setPlatformSkills}
                  editing={editing}
                  verifiedMap={verifiedMap}
                />
              </div>

              {/* Technical / free-text skills */}
              <div>
                <Label>Technical Skills</Label>
                <p className="text-xs mt-0.5 mb-2" style={{ color: "var(--edu-light)" }}>
                  Tools, languages, and frameworks you know.
                </p>
                <SkillTagEditor
                  skills={techSkills}
                  onChange={setTechSkills}
                  editing={editing}
                  colorClass="rgba(87,197,182,0.18)"
                  textColor="var(--edu-primary)"
                />
              </div>

              {!editing && (
                <p className="text-xs" style={{ color: "var(--edu-light)" }}>
                  Click <strong>Edit profile</strong> to add or remove skills.
                </p>
              )}
            </TabsContent>

            {/* ── Documents tab ──────────────────────────────────────────── */}
            <TabsContent value="documents" className="space-y-6 mt-4">

              {/* Resume */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label>Resume</Label>
                    <p className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                      PDF, DOC, or DOCX · max 5 MB
                    </p>
                  </div>
                  {resume.length > 0 && (
                    <Badge style={{ background: "rgba(26,95,122,0.08)", color: "var(--edu-primary)", border: "none" }}>
                      {resume.length} file
                    </Badge>
                  )}
                </div>

                {resume.length > 0 ? (
                  <div className="space-y-2">
                    {resume.map(f => (
                      <FileRow
                        key={f.id}
                        file={f}
                        onDelete={id => deleteFile(id, setResume, `portal_resume_${userId}`)}
                      />
                    ))}
                    <DropZone
                      accept=".pdf,.doc,.docx,application/pdf,application/msword"
                      onFiles={fl => addFiles(fl, setResume, `portal_resume_${userId}`, true)}
                      label="Replace resume"
                      sublabel="Drag & drop or click — replaces the current file"
                    />
                  </div>
                ) : (
                  <DropZone
                    accept=".pdf,.doc,.docx,application/pdf,application/msword"
                    onFiles={fl => addFiles(fl, setResume, `portal_resume_${userId}`, true)}
                    label="Upload your resume"
                    sublabel="Drag & drop or click — PDF, DOC, or DOCX"
                  />
                )}
              </div>

              {/* Certificates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label>Certificates & Credentials</Label>
                    <p className="text-xs mt-0.5" style={{ color: "var(--edu-light)" }}>
                      PDF, JPG, PNG · max 5 MB each · multiple allowed
                    </p>
                  </div>
                  {certs.length > 0 && (
                    <Badge style={{ background: "rgba(87,197,182,0.15)", color: "var(--edu-primary)", border: "none" }}>
                      {certs.length} file{certs.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {certs.map(f => (
                    <FileRow
                      key={f.id}
                      file={f}
                      onDelete={id => deleteFile(id, setCerts, `portal_certs_${userId}`)}
                    />
                  ))}
                  <DropZone
                    accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                    multiple
                    onFiles={fl => addFiles(fl, setCerts, `portal_certs_${userId}`)}
                    label={certs.length > 0 ? "Add more certificates" : "Upload certificates"}
                    sublabel="Drag & drop or click — multiple files accepted"
                  />
                </div>
              </div>

            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// ── Tiny wrapper for labelled form fields ──────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label:     string;
  error?:    string;
  children:  React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--edu-danger)" }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}
