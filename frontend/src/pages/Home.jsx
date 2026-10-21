import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import { useLang } from "../context/LanguageContext";
import api from "../lib/api";
import { ArrowRight, ShieldCheck, TrendingUp, Handshake } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1628012209120-d9db7abf7eab";

export default function Home() {
  const { t } = useLang();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/properties", { params: { featured: true, limit: 6 } })
      .then(({ data }) => {
        if (data.items.length) { setFeatured(data.items); return; }
        return api.get("/properties", { params: { limit: 6 } }).then(({ data }) => setFeatured(data.items));
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <Navbar />
      <section className="relative">
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d3b54]/85 via-[#0d3b54]/55 to-[#0d3b54]/20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-44">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/75 mb-5">{t("hero_overline")}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white max-w-3xl leading-[1.1]" data-testid="hero-title">
            {t("hero_pre")}<span className="italic font-bold text-white/95">{t("hero_highlight")}</span>.
          </h1>
          <p className="mt-6 text-lg text-white/85 max-w-xl leading-relaxed">{t("hero_subtitle")}</p>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 -mt-24 z-20">
          <SearchBar variant="hero" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: t("feat1_t"), desc: t("feat1_d") },
            { icon: TrendingUp, title: t("feat2_t"), desc: t("feat2_d") },
            { icon: Handshake, title: t("feat3_t"), desc: t("feat3_d") },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <f.icon className="w-8 h-8 text-[#1a5f7a] mb-3" aria-hidden="true" />
              <h3 className="font-display text-xl font-bold text-[#0d3b54]">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0d3b54]">{t("featured")}</h2>
            <p className="mt-2 text-slate-600">{t("featured_sub")}</p>
          </div>
          <Link to="/imoveis" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#1a5f7a] hover:gap-3 transition-all" data-testid="view-all-link">
            {t("view_all")} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center text-slate-500" data-testid="home-empty">
            {t("no_results")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
