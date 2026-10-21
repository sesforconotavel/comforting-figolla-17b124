import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, LogOut, Globe, MessageCircle, Building2, Menu, X } from "lucide-react";

export default function Navbar() {
  const { t, lang, toggle } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: t("nav_home"), testid: "nav-home" },
    { to: "/imoveis?operation=buy", label: t("nav_buy"), testid: "nav-buy" },
    { to: "/sobre", label: t("nav_about"), testid: "nav-about" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0" data-testid="nav-logo" onClick={() => setOpen(false)}>
          <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#1a5f7a] shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a5f7a]" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none min-w-0">
            <span className="font-display text-base sm:text-2xl font-bold text-[#0d3b54] truncate">Esforço Notável</span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#1a5f7a] mt-0.5 truncate">Consultoria Imobiliária</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#0d3b54]">
          {navLinks.map((l) => (
            <Link key={l.testid} to={l.to} className="hover:text-[#1a5f7a] transition-colors" data-testid={l.testid}>{l.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={toggle} data-testid="lang-toggle"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0d3b54] hover:text-[#1a5f7a] border border-slate-200 rounded-full px-2.5 sm:px-3 py-2 transition-colors">
            <Globe className="w-4 h-4" aria-hidden="true" /> {lang}
          </button>
          {user ? (
            <>
              <Link to="/backoffice" data-testid="nav-dashboard"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white bg-[#1a5f7a] hover:bg-[#0d3b54] rounded-full px-5 py-2.5 transition-colors">
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" /> {t("nav_dashboard")}
              </Link>
              <button onClick={handleLogout} data-testid="nav-logout"
                className="p-2 text-[#0d3b54] hover:text-[#1a5f7a] transition-colors" title={t("nav_logout")}>
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <a href="https://wa.me/351919389514" target="_blank" rel="noopener noreferrer" data-testid="nav-contact"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white bg-[#1a5f7a] hover:bg-[#0d3b54] rounded-full px-5 py-2.5 transition-colors">
              <MessageCircle className="w-4 h-4" aria-hidden="true" /> {t("nav_contact")}
            </a>
          )}
          <button onClick={() => setOpen((o) => !o)} data-testid="mobile-menu-toggle"
            className="md:hidden p-2 text-[#0d3b54]" aria-label="Menu">
            {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white" data-testid="mobile-menu">
          <div className="px-4 py-3 flex flex-col">
            {navLinks.map((l) => (
              <Link key={l.testid} to={l.to} onClick={() => setOpen(false)}
                className="py-3 text-base font-semibold text-[#0d3b54] border-b border-slate-100" data-testid={`m-${l.testid}`}>{l.label}</Link>
            ))}
            {user ? (
              <Link to="/backoffice" onClick={() => setOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1a5f7a] rounded-full px-5 py-3 transition-colors" data-testid="m-nav-dashboard">
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" /> {t("nav_dashboard")}
              </Link>
            ) : (
              <a href="https://wa.me/351919389514" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1a5f7a] rounded-full px-5 py-3 transition-colors" data-testid="m-nav-contact">
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> {t("nav_contact")}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
