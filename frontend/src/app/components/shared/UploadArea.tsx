import { Upload } from "lucide-react";
import { toast } from "sonner";

export function UploadArea({ label }: { label: string }) {
  return (
    <label className="block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover-lift" style={{ borderColor: "var(--edu-border)" }}>
      <Upload className="mx-auto mb-2" style={{ color: "var(--edu-primary)" }} />
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div className="text-sm" style={{ color: "var(--edu-light)" }}>Click or drop your file here</div>
      <input type="file" className="hidden" onChange={() => toast.success("Uploaded (demo)")} />
    </label>
  );
}
