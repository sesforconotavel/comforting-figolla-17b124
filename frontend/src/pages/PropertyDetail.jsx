import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatPrice } from "../components/PropertyCard";
import VideoPlayer from "../components/VideoPlayer";
import { useLang } from "../context/LanguageContext";
import api from "../lib/api";
import { BedDouble, Bath, Maximize, MapPin, ArrowLeft, Zap, Check, Hash, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const [p, setP] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    api.get(`/properties/${id}`).then(({ data }) => setP(data)).catch(() => setP(false));
  }, [id]);

  if (p === null) return <div><Navbar /><div className="py-32 text-center text-slate-400">{t("loading")}</div></div>;
  if (p === false) return <div><Navbar /><div className="py-32 text-center text-slate-500">404</div></div>;

  const images = p.images?.length ? p.images : ["https://images.unsplash.com/photo-1564703048291-bcf7f001d83d"];
  const typeLabel = t(`type_${p.property_type}`);

  const AGENCY_PHONE = "351919389514";
  const waMessage = t("wa_message").replace("{title}", p.title).replace("{ref}", p.reference || "");
  const waHref = `https://wa.me/${AGENCY_PHONE}?text=${encodeURIComponent(waMessage)}`;
  const waLabel = p.operation === "rent" ? t("btn_rent_wa") : t("btn_buy_wa");

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/imoveis" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a5f7a] mb-6 hover:gap-3 transition-all" data-testid="back-link">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t("back")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video group">
              <img src={images[active]} alt={p.title} className="w-full h-full object-cover" data-testid="detail-main-image" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActive((a) => (a - 1 + images.length) % images.length)} data-testid="gallery-prev"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-white/85 hover:bg-white text-[#0d3b54] shadow-md transition-colors" aria-label="Anterior">
                    <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                  </button>
                  <button onClick={() => setActive((a) => (a + 1) % images.length)} data-testid="gallery-next"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-white/85 hover:bg-white text-[#0d3b54] shadow-md transition-colors" aria-label="Seguinte">
                    <ChevronRight className="w-6 h-6" aria-hidden="true" />
                  </button>
                  <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/60 rounded-full px-3 py-1" data-testid="gallery-counter">
                    {active + 1} / {images.length}
                  </span>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setActive(i)} data-testid={`gallery-dot-${i}`}
                        className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"}`} aria-label={`Foto ${i + 1}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {p.videos?.length > 0 && (
              <div className="mt-4 space-y-4" data-testid="detail-videos">
                {p.videos.map((v, i) => (
                  <VideoPlayer key={i} url={v} index={i} />
                ))}
              </div>
            )}

            <div className="mt-8">
              <span className="text-xs font-bold uppercase tracking-wider text-white bg-[#1a5f7a] rounded-md px-2.5 py-1">
                {p.operation === "rent" ? t("tab_rent") : t("tab_buy")} · {typeLabel}
              </span>
              <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-[#0d3b54] break-words" data-testid="detail-title">{p.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-slate-500"><MapPin className="w-4 h-4" aria-hidden="true" /> {p.address || `${p.zone ? p.zone + ", " : ""}${p.city}`}</p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: BedDouble, label: t("beds"), val: p.bedrooms },
                  { icon: Bath, label: t("baths"), val: p.bathrooms },
                  { icon: Maximize, label: t("area"), val: p.area },
                  { icon: Zap, label: t("energy"), val: p.energy_certificate || "—" },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <s.icon className="w-5 h-5 text-[#1a5f7a] mx-auto mb-2" aria-hidden="true" />
                    <p className="font-bold text-[#0d3b54]">{s.val}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {p.description && (
                <div className="mt-8">
                  <h2 className="font-display text-2xl font-bold text-[#0d3b54] mb-3">{t("description")}</h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{p.description}</p>
                </div>
              )}

              {p.features?.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-2xl font-bold text-[#0d3b54] mb-3">{t("features")}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {p.features.map((f, i) => (
                      <span key={i} className="flex items-center gap-2 text-sm text-slate-700"><Check className="w-4 h-4 text-[#1a5f7a]" aria-hidden="true" /> {f}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-8 flex items-center gap-1.5 text-sm text-slate-400"><Hash className="w-4 h-4" aria-hidden="true" /> {t("reference")}: {p.reference}</p>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 bg-white border border-slate-200 rounded-xl p-6">
              <p className="font-display text-4xl font-black text-[#0d3b54]" data-testid="detail-price">{formatPrice(p.price, p.operation)}</p>
              <a href={waHref} target="_blank" rel="noopener noreferrer" data-testid="whatsapp-buy-btn"
                className="mt-5 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-lg py-3.5 transition-colors">
                <MessageCircle className="w-5 h-5" aria-hidden="true" /> {waLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
