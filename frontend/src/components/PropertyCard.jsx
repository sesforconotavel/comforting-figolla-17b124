import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { BedDouble, Bath, Maximize, MapPin, Star } from "lucide-react";

export const formatPrice = (price, operation) => {
  const p = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price || 0);
  return operation === "rent" ? `${p}/mês` : p;
};

export default function PropertyCard({ property, index = 0 }) {
  const { t } = useLang();
  const img = property.images?.[0] || "https://images.unsplash.com/photo-1564703048291-bcf7f001d83d";
  return (
    <Link to={`/imovel/${property.id}`} data-testid={`property-card-${property.id}`}
      className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow] duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={img} alt={property.title} loading="lazy" decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider text-white bg-[#1a5f7a] rounded-md px-2.5 py-1">
          {property.operation === "rent" ? t("tab_rent") : t("tab_buy")}
        </span>
        {property.featured && (
          <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0d3b54] bg-amber-400 rounded-md px-2 py-1" data-testid="featured-badge">
            <Star className="w-3 h-3 fill-[#0d3b54]" aria-hidden="true" /> {t("featured_badge")}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="font-display text-2xl font-bold text-[#0d3b54]">{formatPrice(property.price, property.operation)}</p>
        <h3 className="mt-1 text-base font-semibold text-slate-800 line-clamp-1">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {property.zone ? `${property.zone}, ` : ""}{property.city}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-[#1a5f7a]" aria-hidden="true" /> {property.bedrooms}</span>
          <span className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-[#1a5f7a]" aria-hidden="true" /> {property.bathrooms}</span>
          <span className="flex items-center gap-1.5"><Maximize className="w-4 h-4 text-[#1a5f7a]" aria-hidden="true" /> {property.area} m²</span>
        </div>
      </div>
    </Link>
  );
}
