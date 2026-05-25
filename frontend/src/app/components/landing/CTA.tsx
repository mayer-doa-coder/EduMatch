import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

type Props = { onGetStarted: () => void; onLogin: () => void };

export function LandingCTA({ onGetStarted, onLogin }: Props) {
  return (
    <section className="px-6 pb-20">
      <div className="max-w-7xl mx-auto rounded-3xl edu-gradient text-white p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Start your AI-powered academic journey today</h2>
          <p className="mt-2 opacity-90">Free for students. Built for the modern university.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onGetStarted} className="rounded-full h-12 px-6" style={{ background: "var(--edu-accent)" }}>Get Started <ArrowRight className="ml-2" size={18} /></Button>
          <Button variant="outline" onClick={onLogin} className="rounded-full h-12 px-6 bg-transparent text-white border-white hover:bg-white/10">Log in</Button>
        </div>
      </div>
    </section>
  );
}
