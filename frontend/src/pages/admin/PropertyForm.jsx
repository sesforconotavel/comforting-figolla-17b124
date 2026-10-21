import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import api from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Plus, Loader2, Star, Film, GripVertical, Eye } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import VideoPlayer from "../../components/VideoPlayer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const empty = {
  title: "", description: "", operation: "buy", property_type: "apartment",
  price: "", city: "", zone: "", address: "", bedrooms: 0, bathrooms: 0,
  area: "", energy_certificate: "", features: [], images: [], videos: [],
  featured: false, status: "draft",
};

export default function PropertyForm() {
  const { t } = useLang();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const fileRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    if (id) {
      api.get(`/properties/${id}`).then(({ data }) => {
        setForm({ ...empty, ...data, price: data.price, area: data.area });
      }).catch(() => {});
    }
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
      toast.success("OK");
    } catch { toast.error("Erro no upload"); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingVideo(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setForm((f) => ({ ...f, videos: [...f.videos, data.url] }));
      }
      toast.success("OK");
    } catch { toast.error("Erro no upload do vídeo"); }
    setUploadingVideo(false);
    if (videoRef.current) videoRef.current.value = "";
  };

  const addUrl = () => {
    if (!imageUrl.trim()) return;
    set("images", [...form.images, imageUrl.trim()]);
    setImageUrl("");
  };

  const addVideoUrl = () => {
    if (!videoUrl.trim()) return;
    set("videos", [...form.videos, videoUrl.trim()]);
    setVideoUrl("");
  };

  const removeImage = (i) => set("images", form.images.filter((_, idx) => idx !== i));
  const removeVideo = (i) => set("videos", form.videos.filter((_, idx) => idx !== i));

  const [dragIndex, setDragIndex] = useState(null);
  const dragIndexRef = useRef(null);
  const startDrag = (i, e) => {
    dragIndexRef.current = i;
    setDragIndex(i);
    if (e?.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); }
  };
  const moveImage = (from, to) => {
    if (from === to || from == null || to == null) return;
    setForm((f) => {
      const arr = [...f.images];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...f, images: arr };
    });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    set("features", [...form.features, featureInput.trim()]);
    setFeatureInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      area: parseFloat(form.area) || 0,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
    };
    try {
      if (id) await api.put(`/properties/${id}`, payload);
      else await api.post("/properties", payload);
      toast.success(t("saved"));
      navigate("/backoffice");
    } catch (err) {
      toast.error("Erro ao guardar");
    } finally { setBusy(false); }
  };

  const label = "text-xs font-bold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-[#0d3b54] text-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link to="/backoffice" className="flex items-center gap-2 hover:text-white/80 transition-colors" data-testid="form-back"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t("back")}</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-[#0d3b54] mb-8" data-testid="form-title">{id ? t("edit_property") : t("new_property")}</h1>

        <form onSubmit={submit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <label className={label}>{t("title")}</label>
              <Input required value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" data-testid="field-title" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>{t("operation")}</label>
                <Select value={form.operation} onValueChange={(v) => set("operation", v)}>
                  <SelectTrigger className="mt-1.5" data-testid="field-operation"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">{t("tab_buy")}</SelectItem>
                    <SelectItem value="rent">{t("tab_rent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={label}>{t("search_type")}</label>
                <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                  <SelectTrigger className="mt-1.5" data-testid="field-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">{t("type_apartment")}</SelectItem>
                    <SelectItem value="house">{t("type_house")}</SelectItem>
                    <SelectItem value="land">{t("type_land")}</SelectItem>
                    <SelectItem value="commercial">{t("type_commercial")}</SelectItem>
                    <SelectItem value="garage">{t("type_garage")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={label}>{t("price")}</label>
                <Input required type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="mt-1.5" data-testid="field-price" />
              </div>
              <div>
                <label className={label}>{t("city")}</label>
                <Input required value={form.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" data-testid="field-city" />
              </div>
              <div>
                <label className={label}>{t("zone")}</label>
                <Input value={form.zone} onChange={(e) => set("zone", e.target.value)} className="mt-1.5" data-testid="field-zone" />
              </div>
            </div>
            <div>
              <label className={label}>{t("address")}</label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} className="mt-1.5" data-testid="field-address" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={label}>{t("bedrooms")}</label>
                <Input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className="mt-1.5" data-testid="field-bedrooms" />
              </div>
              <div>
                <label className={label}>{t("baths")}</label>
                <Input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className="mt-1.5" data-testid="field-bathrooms" />
              </div>
              <div>
                <label className={label}>{t("area")}</label>
                <Input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className="mt-1.5" data-testid="field-area" />
              </div>
              <div>
                <label className={label}>{t("energy")}</label>
                <Input value={form.energy_certificate} onChange={(e) => set("energy_certificate", e.target.value)} placeholder="A+, B, C..." className="mt-1.5" data-testid="field-energy" />
              </div>
            </div>
            <div>
              <label className={label}>{t("description")}</label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className="mt-1.5" data-testid="field-description" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <label className={label}>{t("features")}</label>
            <div className="flex gap-2">
              <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }} placeholder="Ex: Garagem, Varanda, Elevador" data-testid="field-feature-input" />
              <button type="button" onClick={addFeature} className="px-4 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" data-testid="add-feature"><Plus className="w-4 h-4" aria-hidden="true" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.features.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-[#1a5f7a]/10 text-[#1a5f7a] text-sm font-medium rounded-full px-3 py-1">
                  {f} <button type="button" onClick={() => set("features", form.features.filter((_, idx) => idx !== i))}><X className="w-3.5 h-3.5" aria-hidden="true" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className={label}>{t("images")}</label>
              {form.images.length > 1 && <span className="text-xs text-slate-400 flex items-center gap-1"><GripVertical className="w-3.5 h-3.5" aria-hidden="true" /> {t("reorder_hint")}</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg py-6 text-slate-500 hover:border-[#1a5f7a] hover:text-[#1a5f7a] transition-colors" data-testid="upload-btn">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Upload className="w-5 h-5" aria-hidden="true" />}
                {t("upload_images")}
              </button>
              <input ref={fileRef} type="file" multiple hidden onChange={handleUpload} data-testid="file-input" />
              <div className="flex gap-2">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={t("image_url")} data-testid="field-image-url" />
                <button type="button" onClick={addUrl} className="px-4 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" data-testid="add-image-url"><Plus className="w-4 h-4" aria-hidden="true" /></button>
              </div>
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} draggable
                    onDragStart={(e) => startDrag(i, e)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); moveImage(dragIndexRef.current, i); dragIndexRef.current = null; setDragIndex(null); }}
                    onDragEnd={() => { dragIndexRef.current = null; setDragIndex(null); }}
                    className={`relative aspect-video rounded-lg overflow-hidden border border-slate-200 group cursor-move transition-opacity ${dragIndex === i ? "opacity-40" : ""}`}
                    data-testid={`img-preview-${i}`}>
                    <img src={img} alt="" className="w-full h-full object-cover pointer-events-none" />
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] font-bold uppercase tracking-wide text-white bg-[#1a5f7a] rounded px-1.5 py-0.5">Capa</span>}
                    <span className="absolute top-1 left-1 bg-black/50 text-white rounded p-0.5"><GripVertical className="w-3.5 h-3.5" aria-hidden="true" /></span>
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`remove-img-${i}`}>
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <label className={label}>{t("videos")}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg py-6 text-slate-500 hover:border-[#1a5f7a] hover:text-[#1a5f7a] transition-colors" data-testid="upload-video-btn">
                {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <Film className="w-5 h-5" aria-hidden="true" />}
                {t("upload_videos")}
              </button>
              <input ref={videoRef} type="file" multiple hidden onChange={handleVideoUpload} data-testid="video-input" />
              <div className="flex gap-2">
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder={t("video_url")} data-testid="field-video-url" />
                <button type="button" onClick={addVideoUrl} className="px-4 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" data-testid="add-video-url"><Plus className="w-4 h-4" aria-hidden="true" /></button>
              </div>
            </div>
            {form.videos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.videos.map((vid, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200" data-testid={`video-preview-${i}`}>
                    <VideoPlayer url={vid} index={i} />
                    <button type="button" onClick={() => removeVideo(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 z-10" data-testid={`remove-video-${i}`}>
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className={`w-5 h-5 ${form.status === "active" ? "text-green-600" : "text-slate-400"}`} aria-hidden="true" />
                <span className="font-semibold text-[#0d3b54]">{t("publish_label")}</span>
              </div>
              <Switch checked={form.status === "active"} onCheckedChange={(v) => set("status", v ? "active" : "draft")} data-testid="field-status" />
            </div>
            <p className="text-sm text-slate-500">{t("publish_hint")}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className={`w-5 h-5 ${form.featured ? "text-amber-400 fill-amber-400" : "text-slate-400"}`} aria-hidden="true" />
              <span className="font-semibold text-[#0d3b54]">{t("featured_label")}</span>
            </div>
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} data-testid="field-featured" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="bg-[#1a5f7a] hover:bg-[#0d3b54] disabled:opacity-60 text-white font-semibold rounded-lg px-8 py-3 transition-colors" data-testid="form-submit">
              {busy ? "..." : t("save")}
            </button>
            <button type="button" onClick={() => navigate("/backoffice")} className="border border-slate-300 rounded-lg px-8 py-3 font-semibold text-slate-600 hover:bg-slate-50 transition-colors" data-testid="form-cancel">{t("cancel")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
