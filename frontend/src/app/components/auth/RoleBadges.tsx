import { Award, BookOpen, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { Role, ROLES } from "../edu-data";

const roleIcon: Record<Role, React.ElementType> = {
  student:    GraduationCap,
  supervisor: BookOpen,
  admin:      ShieldCheck,
  company:    Building2,
  alumni:     Award,
};

type Props = {
  role: Role;
  onChange: (r: Role) => void;
  /** Restrict which roles are shown. Defaults to all ROLES. */
  allowedRoles?: readonly Role[];
};

export function RoleBadges({ role, onChange, allowedRoles = ROLES }: Props) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {allowedRoles.map(r => {
        const Icon   = roleIcon[r];
        const active = role === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm capitalize transition"
            style={{
              background:   active ? "var(--edu-primary)" : "white",
              color:        active ? "white" : "var(--edu-primary)",
              borderColor:  active ? "var(--edu-primary)" : "var(--edu-border)",
            }}
          >
            <Icon size={14} /> {r}
          </button>
        );
      })}
    </div>
  );
}
