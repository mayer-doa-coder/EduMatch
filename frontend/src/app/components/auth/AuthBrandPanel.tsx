import { ArrowLeft, GraduationCap } from "lucide-react";

type Props = { onBack: () => void };

export function AuthBrandPanel({ onBack }: Props) {
  const stats = [{ k: "12.5K", v: "Students" }, { k: "840+", v: "Mentors" }, { k: "96%", v: "Match acc." }];
  return (
    <div className="hidden md:flex relative edu-gradient text-white p-10 flex-col justify-between">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 opacity-80 hover:opacity-100">
          <ArrowLeft size={18} /> Back to home
        </button>
        <div className="mt-12 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><GraduationCap /></div>
          <span style={{ fontWeight: 700, fontSize: "1.4rem" }}>EduMatch</span>
        </div>
        <h1 className="mt-10" style={{ fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.15 }}>
          Welcome to the AI-driven academic ecosystem.
        </h1>
        <p className="mt-4 opacity-90 max-w-md">
          One platform for thesis matching, skill growth, internship discovery, and verified credentials.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.v} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
            <div style={{ fontWeight: 700, fontSize: "1.4rem" }}>{s.k}</div>
            <div className="opacity-80 text-sm">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
