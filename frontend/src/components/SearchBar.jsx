import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function SearchBar({ variant = "hero" }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [operation, setOperation] = useState("buy");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("any");
  const [maxPrice, setMaxPrice] = useState("any");

  const submit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    params.set("operation", operation);
    if (location) params.set("city", location);
    if (type !== "any") params.set("property_type", type);
    if (maxPrice !== "any") params.set("max_price", maxPrice);
    navigate(`/imoveis?${params.toString()}`);
  };

  const priceOptions = operation === "rent"
    ? [500, 750, 1000, 1500, 2000, 3000]
    : [100000, 200000, 300000, 500000, 750000, 1000000];

  return (
    <div className={variant === "hero" ? "bg-white p-5 sm:p-6 rounded-xl shadow-2xl border border-white/20" : "bg-white p-4 rounded-xl border border-slate-200"} data-testid="search-bar">
      <Tabs value={operation} onValueChange={setOperation} className="w-full">
        <TabsList className="bg-slate-100 mb-4">
          <TabsTrigger value="buy" data-testid="tab-buy" className="data-[state=active]:bg-[#1a5f7a] data-[state=active]:text-white px-6 font-semibold">{t("tab_buy")}</TabsTrigger>
          <TabsTrigger value="rent" data-testid="tab-rent" className="data-[state=active]:bg-[#1a5f7a] data-[state=active]:text-white px-6 font-semibold">{t("tab_rent")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("search_location")}
          data-testid="search-location" className="h-12 border-slate-300" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-12 border-slate-300" data-testid="search-type"><SelectValue placeholder={t("search_type")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("any")}</SelectItem>
            <SelectItem value="apartment">{t("type_apartment")}</SelectItem>
            <SelectItem value="house">{t("type_house")}</SelectItem>
            <SelectItem value="land">{t("type_land")}</SelectItem>
            <SelectItem value="commercial">{t("type_commercial")}</SelectItem>
            <SelectItem value="garage">{t("type_garage")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={maxPrice} onValueChange={setMaxPrice}>
          <SelectTrigger className="h-12 border-slate-300" data-testid="search-price"><SelectValue placeholder={t("search_price")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("any")}</SelectItem>
            {priceOptions.map((p) => (
              <SelectItem key={p} value={String(p)}>{new Intl.NumberFormat("pt-PT").format(p)} €</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button type="submit" data-testid="search-submit"
          className="h-12 flex items-center justify-center gap-2 bg-[#1a5f7a] hover:bg-[#0d3b54] text-white font-semibold rounded-lg px-6 transition-colors">
          <Search className="w-5 h-5" aria-hidden="true" /> {t("search_btn")}
        </button>
      </form>
    </div>
  );
}
