import { useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight, GraduationCap, Menu, X } from "lucide-react";

type Props = { onGetStarted: () => void; onLogin: () => void };

export function LandingNavbar({ onGetStarted, onLogin }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b" style={{ borderColor: "var(--edu-border)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span style={{ color: "var(--edu-primary)", fontWeight: 700, fontSize: "1.15rem" }}>EduMatch</span>
        </div>
        <div className="hidden md:flex items-center gap-8" style={{ color: "var(--edu-light)" }}>
          <a href="#features" className="hover:text-[color:var(--edu-primary)] transition">Features</a>
          <a href="#how" className="hover:text-[color:var(--edu-primary)] transition">How it Works</a>
          <a href="#roles" className="hover:text-[color:var(--edu-primary)] transition">Roles</a>
          <a href="#faq" className="hover:text-[color:var(--edu-primary)] transition">FAQ</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" onClick={onLogin} style={{ color: "var(--edu-primary)" }}>Log in</Button>
          <Button onClick={onGetStarted} className="rounded-full" style={{ background: "var(--edu-primary)" }}>
            Get Started <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(v => !v)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3 bg-white border-t" style={{ borderColor: "var(--edu-border)" }}>
          <a href="#features" onClick={() => setOpen(false)}>Features</a>
          <a href="#how" onClick={() => setOpen(false)}>How it Works</a>
          <a href="#roles" onClick={() => setOpen(false)}>Roles</a>
          <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onLogin}>Log in</Button>
            <Button className="flex-1" onClick={onGetStarted} style={{ background: "var(--edu-primary)" }}>Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
