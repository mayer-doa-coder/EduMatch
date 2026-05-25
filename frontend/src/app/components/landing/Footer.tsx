import { Button } from "../ui/button";
import { GraduationCap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-white" style={{ borderColor: "var(--edu-border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl edu-gradient flex items-center justify-center"><GraduationCap className="text-white" size={20} /></div>
            <span style={{ color: "var(--edu-primary)", fontWeight: 700 }}>EduMatch</span>
          </div>
          <p style={{ color: "var(--edu-light)" }}>The AI-driven thesis & internship ecosystem for modern universities.</p>
        </div>
        <div>
          <h4 style={{ color: "var(--edu-primary)" }}>Product</h4>
          <ul className="mt-3 space-y-2" style={{ color: "var(--edu-light)" }}>
            <li>Features</li><li>Pricing</li><li>Universities</li><li>Roadmap</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: "var(--edu-primary)" }}>Company</h4>
          <ul className="mt-3 space-y-2" style={{ color: "var(--edu-light)" }}>
            <li>About</li><li>Contact</li><li>Privacy Policy</li><li>Terms</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: "var(--edu-primary)" }}>Stay updated</h4>
          <p className="mt-3 text-sm" style={{ color: "var(--edu-light)" }}>Get product updates and case studies in your inbox.</p>
          <div className="mt-3 flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-xl border bg-white" style={{ borderColor: "var(--edu-border)" }} placeholder="you@university.edu" />
            <Button style={{ background: "var(--edu-primary)" }}>Join</Button>
          </div>
        </div>
      </div>
      <div className="border-t py-5 text-center text-sm" style={{ borderColor: "var(--edu-border)", color: "var(--edu-light)" }}>
        © {new Date().getFullYear()} EduMatch. All rights reserved.
      </div>
    </footer>
  );
}
