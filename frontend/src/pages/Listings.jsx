import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { useLang } from "../context/LanguageContext";
import api from "../lib/api";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

export default function Listings() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const [operation, setOperation] = useState(searchParams.get("operation") || "all");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") || "any");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "any");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sort, setSort] = useState("recent");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (operation !== "all") params.operation = operation;
    if (propertyType !== "any") params.property_type = propertyType;
    if (city) params.city = city;
    if (bedrooms !== "any") params.bedrooms = bedrooms;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    params.sort = sort;
    params.limit = 24;
    try {
      const { data } = await api.get("/properties", { params });
      setData(data);
    } catch { setData({ items: [], total: 0 }); }
    setLoading(false);
  }, [operation, propertyType, city, bedrooms, minPrice, maxPrice, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyUrl = () => {
    const p = {};
    if (operation !== "all") p.operation = operation;
    if (city) p.city = city;
    if (propertyType !== "any") p.property_type = propertyType;
    setSearchParams(p);
  };

  const clearFilters = () => {
    setOperation("all"); setPropertyType("any"); setCity("");
    setBedrooms("any"); setMinPrice(""); setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 h-fit bg-white border border-slate-200 rounded-xl p-6 space-y-5" data-testid="filters-panel">
            <div className="flex items-center gap-2 text-[#0d3b54] font-display text-xl font-bold">
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" /> {t("filters")}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("operation")}</label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="mt-1.5" data-testid="filter-operation"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("any")}</SelectItem>
                  <SelectItem value="buy">{t("tab_buy")}</SelectItem>
                  <SelectItem value="rent">{t("tab_rent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("search_type")}</label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="mt-1.5" data-testid="filter-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("any")}</SelectItem>
                  <SelectItem value="apartment">{t("type_apartment")}</SelectItem>
                  <SelectItem value="house">{t("type_house")}</SelectItem>
                  <SelectItem value="land">{t("type_land")}</SelectItem>
                  <SelectItem value="commercial">{t("type_commercial")}</SelectItem>
                  <SelectItem value="garage">{t("type_garage")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("city")}</label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("search_location")} className="pl-9" data-testid="filter-city" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("bedrooms")}</label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger className="mt-1.5" data-testid="filter-bedrooms"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("any")}</SelectItem>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("min_price")}</label>
                <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="mt-1.5" data-testid="filter-min-price" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("max_price")}</label>
                <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1.5" data-testid="filter-max-price" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={applyUrl} className="flex-1 bg-[#1a5f7a] hover:bg-[#0d3b54] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors" data-testid="filter-apply">{t("apply")}</button>
              <button onClick={clearFilters} className="px-4 border border-slate-300 rounded-lg py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors" data-testid="filter-clear">{t("clear")}</button>
            </div>
          </aside>

          <main>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 font-medium" data-testid="results-count"><span className="text-[#0d3b54] font-bold">{data.total}</span> {t("results")}</p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-56" data-testid="sort-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("sort_recent")}</SelectItem>
                  <SelectItem value="price_asc">{t("sort_price_asc")}</SelectItem>
                  <SelectItem value="price_desc">{t("sort_price_desc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="py-24 text-center text-slate-400" data-testid="listings-loading">{t("loading")}</div>
            ) : data.items.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center text-slate-500" data-testid="listings-empty">{t("no_results")}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.items.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
