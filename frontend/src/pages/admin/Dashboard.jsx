import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../components/PropertyCard";
import api from "../../lib/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, Home, KeyRound, LogOut, ExternalLink, Star, Eye, EyeOff } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";

export default function Dashboard() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, buy: 0, rent: 0 });

  const load = useCallback(async () => {
    const [list, s] = await Promise.all([
      api.get("/admin/properties"),
      api.get("/stats"),
    ]);
    setItems(list.data.items);
    setStats(s.data);
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const remove = async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      toast.success(t("deleted"));
      load();
    } catch { toast.error("Erro"); }
  };

  const toggleFeatured = async (p) => {
    try {
      await api.patch(`/properties/${p.id}/featured`, { featured: !p.featured });
      setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: !p.featured } : x)));
    } catch { toast.error("Erro"); }
  };

  const toggleStatus = async (p) => {
    const next = p.status === "active" ? "draft" : "active";
    try {
      await api.patch(`/properties/${p.id}/status`, { status: next });
      setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
      toast.success(next === "active" ? t("published") : t("draft"));
    } catch { toast.error("Erro"); }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const statCards = [
    { icon: Building2, label: t("total_props"), val: stats.total },
    { icon: Home, label: t("for_sale"), val: stats.buy },
    { icon: KeyRound, label: t("for_rent"), val: stats.rent },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-[#0d3b54] text-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold">Esforço Notável · {t("nav_dashboard")}</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" aria-hidden="true" /> Site</Link>
            <span className="hidden sm:inline text-white/70">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-white/80 transition-colors" data-testid="dash-logout"><LogOut className="w-4 h-4" aria-hidden="true" /> {t("nav_logout")}</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-[#0d3b54]" data-testid="dashboard-title">{t("dashboard_title")}</h1>
          <Link to="/backoffice/novo" data-testid="add-property-btn" className="flex items-center gap-2 bg-[#1a5f7a] hover:bg-[#0d3b54] text-white font-semibold rounded-lg px-5 py-2.5 transition-colors">
            <Plus className="w-4 h-4" aria-hidden="true" /> {t("add_property")}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1a5f7a]/10 flex items-center justify-center">
                <s.icon className="w-6 h-6 text-[#1a5f7a]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-3xl font-black text-[#0d3b54]" data-testid={`stat-${i}`}>{s.val}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500" data-testid="dash-empty">{t("no_results")}</div>
        ) : (
        <>
          <div className="md:hidden space-y-3" data-testid="properties-cards">
            {items.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4" data-testid={`card-${p.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => navigate(`/backoffice/editar/${p.id}`)} className="text-left font-semibold text-[#0d3b54] hover:underline break-words" data-testid={`m-title-${p.id}`}>{p.title}</button>
                  <button onClick={() => toggleFeatured(p)} className={`p-1 shrink-0 transition-colors ${p.featured ? "text-amber-400" : "text-slate-300 hover:text-amber-400"}`} title={t("featured_label")} data-testid={`m-feature-${p.id}`}>
                    <Star className={`w-5 h-5 ${p.featured ? "fill-amber-400" : ""}`} aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-500">{p.city} · {p.operation === "rent" ? t("tab_rent") : t("tab_buy")}</p>
                <p className="mt-1 font-display text-lg font-bold text-[#0d3b54]">{formatPrice(p.price, p.operation)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <button onClick={() => toggleStatus(p)} data-testid={`m-status-${p.id}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 transition-colors ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "active" ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />}
                    {p.status === "active" ? t("published") : t("draft")}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/backoffice/editar/${p.id}`)} className="p-2 text-slate-500 hover:text-[#1a5f7a] transition-colors" data-testid={`m-edit-${p.id}`}><Pencil className="w-4 h-4" aria-hidden="true" /></button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-2 text-slate-500 hover:text-red-600 transition-colors" data-testid={`m-delete-${p.id}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("confirm_delete")}</AlertDialogTitle>
                          <AlertDialogDescription>{p.title}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(p.id)} className="bg-red-600 hover:bg-red-700" data-testid={`m-confirm-delete-${p.id}`}>{t("delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm" data-testid="properties-table">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">{t("title")}</th>
                  <th className="px-5 py-3 hidden md:table-cell">{t("city")}</th>
                  <th className="px-5 py-3">{t("operation")}</th>
                  <th className="px-5 py-3">{t("status_col")}</th>
                  <th className="px-5 py-3">{t("price")}</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-${p.id}`}>
                    <td className="px-5 py-4 font-medium">
                      <button onClick={() => navigate(`/backoffice/editar/${p.id}`)} className="text-slate-800 hover:text-[#1a5f7a] hover:underline text-left transition-colors" data-testid={`title-${p.id}`}>{p.title}</button>
                    </td>
                    <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{p.city}</td>
                    <td className="px-5 py-4"><span className="text-xs font-semibold text-[#1a5f7a]">{p.operation === "rent" ? t("tab_rent") : t("tab_buy")}</span></td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStatus(p)} data-testid={`status-${p.id}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 transition-colors ${p.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                        title={p.status === "active" ? t("unpublish_action") : t("publish_action")}>
                        {p.status === "active" ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />}
                        {p.status === "active" ? t("published") : t("draft")}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#0d3b54]">{formatPrice(p.price, p.operation)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleFeatured(p)} className={`p-2 transition-colors ${p.featured ? "text-amber-400" : "text-slate-400 hover:text-amber-400"}`} title={t("featured_label")} data-testid={`feature-${p.id}`}>
                          <Star className={`w-4 h-4 ${p.featured ? "fill-amber-400" : ""}`} aria-hidden="true" />
                        </button>
                        <button onClick={() => navigate(`/backoffice/editar/${p.id}`)} className="p-2 text-slate-500 hover:text-[#1a5f7a] transition-colors" data-testid={`edit-${p.id}`}><Pencil className="w-4 h-4" aria-hidden="true" /></button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 text-slate-500 hover:text-red-600 transition-colors" data-testid={`delete-${p.id}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("confirm_delete")}</AlertDialogTitle>
                              <AlertDialogDescription>{p.title}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(p.id)} className="bg-red-600 hover:bg-red-700" data-testid={`confirm-delete-${p.id}`}>{t("delete")}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
        )}
        </div>
      </div>
  );
}
