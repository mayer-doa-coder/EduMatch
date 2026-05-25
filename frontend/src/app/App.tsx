import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { DashboardPage } from "./components/pages/DashboardPage";
import { Role } from "./components/edu-data";
import "../styles/index.css";

type View =
  | { name: "landing" }
  | { name: "login" }
  | { name: "register" }
  | { name: "dashboard"; role: Role };

export default function App() {
  const [view, setView] = useState<View>({ name: "landing" });

  return (
    <div className="size-full">
      {view.name === "landing" && (
        <LandingPage
          onGetStarted={() => setView({ name: "register" })}
          onLogin={() => setView({ name: "login" })}
        />
      )}
      {view.name === "login" && (
        <LoginPage
          onSwitch={() => setView({ name: "register" })}
          onAuthed={(role) => setView({ name: "dashboard", role })}
          onBack={() => setView({ name: "landing" })}
        />
      )}
      {view.name === "register" && (
        <RegisterPage
          onSwitch={() => setView({ name: "login" })}
          onAuthed={(role) => setView({ name: "dashboard", role })}
          onBack={() => setView({ name: "landing" })}
        />
      )}
      {view.name === "dashboard" && (
        <DashboardPage
          role={view.role}
          onLogout={() => setView({ name: "landing" })}
          onSwitchRole={(role) => setView({ name: "dashboard", role })}
        />
      )}
      <Toaster position="top-right" richColors />
    </div>
  );
}
