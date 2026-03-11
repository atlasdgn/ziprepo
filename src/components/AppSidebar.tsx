import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const sidebarLinks = [
  {
    label: "Ana Sayfa",
    href: "/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Docs",
    href: "/docs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Firmalar",
    href: "/#carriers",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Fiyatlar",
    href: "/#pricing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    auth: true,
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  const filteredLinks = sidebarLinks.filter((l) => !l.auth || user);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-border/30 bg-background transition-all duration-300 ${
        collapsed ? "w-[52px]" : "w-[200px]"
      }`}
    >
      {/* Top: Logo toggle */}
      <div className="flex items-center justify-center h-14 border-b border-border/30 flex-shrink-0">
        <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#sidebarGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V22" stroke="url(#sidebarGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 9L11 12L7 15" stroke="url(#sidebarGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="sidebarGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(211,100%,60%)" />
                <stop offset="1" stopColor="hsl(195,100%,75%)" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 flex flex-col gap-1 p-2 pt-4">
        {filteredLinks.map((link) => {
          const isActive = link.href === "/"
            ? currentPath === "/"
            : currentPath.startsWith(link.href.replace("/#", ""));

          return (
            <NavLink
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all ${
                isActive
                  ? "text-foreground bg-foreground/[0.06]"
                  : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/[0.03]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              {!collapsed && <span className="font-medium">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Auth */}
      <div className="p-2 pb-4 border-t border-border/30">
        {user ? (
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-2">
                <p className="text-[11px] font-medium text-foreground/70 truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground/40 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/[0.03] transition-all w-full ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {!collapsed && <span className="font-medium">Çıkış Yap</span>}
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-foreground/[0.03] transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {!collapsed && <span className="font-medium">Giriş Yap</span>}
          </NavLink>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
