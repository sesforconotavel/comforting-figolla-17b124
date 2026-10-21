import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { MapPin, Mail, Phone, Building2 } from "lucide-react";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer id="contacto" className="bg-[#0d3b54] text-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/70">
              <Building2 className="w-5 h-5 text-white" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-bold text-white">Esforço Notável</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 mt-0.5">Consultoria Imobiliária</span>
            </span>
          </div>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed">{t("footer_desc")}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 border border-white/20 rounded-full px-3 py-1.5" data-testid="ami-license">
            Licença AMI 9718
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">{t("nav_properties")}</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/imoveis?operation=buy" className="hover:text-white transition-colors">{t("nav_buy")}</Link></li>
            <li><Link to="/imoveis?operation=rent" className="hover:text-white transition-colors">{t("nav_rent")}</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">{t("nav_login")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Contactos</p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" aria-hidden="true" /> Castelo Branco, Portugal</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" aria-hidden="true" /> geral@esforconotavel.pt</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" aria-hidden="true" /> +351 919 389 514</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Esforço Notável Consultoria. {t("footer_rights")}
      </div>
    </footer>
  );
}
