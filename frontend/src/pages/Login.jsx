import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Erro. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function Login() {
  const { t } = useLang();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate("/backoffice"); }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate("/backoffice");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src="https://images.unsplash.com/photo-1628012209120-d9db7abf7eab" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0d3b54]/60" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-display text-4xl font-bold">Esforço Notável</h2>
          <p className="mt-3 text-white/80 max-w-md">{t("footer_desc")}</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#1a5f7a]">
              <Building2 className="w-5 h-5 text-[#1a5f7a]" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold text-[#0d3b54]">Esforço Notável</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1a5f7a] mt-0.5">Consultoria Imobiliária</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#0d3b54]" data-testid="login-title">{t("login_title")}</h1>
          <p className="mt-2 text-slate-500">{t("login_sub")}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("email")}</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-12" data-testid="login-email" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("password")}</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-12" data-testid="login-password" />
            </div>
            <button type="submit" disabled={busy} className="w-full bg-[#1a5f7a] hover:bg-[#0d3b54] disabled:opacity-60 text-white font-semibold rounded-lg py-3 transition-colors" data-testid="login-submit">
              {busy ? "..." : t("login_btn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
