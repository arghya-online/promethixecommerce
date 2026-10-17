"use client";

import { FloppyDisk, Spinner, Trash, UploadSimple } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState } from "react";

type Banner = {
  _id: string;
  slot: "hero" | "promotion";
  title: string;
  subtitle: string;
  image: string;
  href: string;
  isActive: boolean;
  sortOrder: number;
};

type BannerManagerProps = {
  banners: Banner[];
  onBannersChange: (banners: Banner[]) => void;
};

const emptyForm = {
  slot: "promotion" as Banner["slot"],
  title: "",
  subtitle: "",
  image: "",
  href: "/shop",
  sortOrder: "0",
  isActive: true,
};

export function BannerManager({ banners, onBannersChange }: BannerManagerProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "promethix3d/banners");
      const response = await fetch("/api/cloudinary/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok || !data.success || typeof data.url !== "string") {
        throw new Error(data.message || "Banner upload failed.");
      }
      setForm((current) => ({ ...current, image: data.url }));
      setMessage("Banner image uploaded. Save the slot to publish it.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not upload banner image.");
    } finally {
      setSaving(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function saveBanner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!form.image) throw new Error("Upload a banner image before saving.");
      const response = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not save banner.");
      onBannersChange([...banners, data.banner]);
      setForm(emptyForm);
      setMessage("Banner slot saved.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not save banner.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBanner(banner: Banner) {
    if (!window.confirm(`Remove "${banner.title}" from the homepage?`)) return;
    try {
      const response = await fetch(`/api/banners/${banner._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not remove banner.");
      onBannersChange(banners.filter((item) => item._id !== banner._id));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not remove banner.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Homepage merchandising</p>
          <h2 className="font-heading">Banner slots</h2>
        </div>
        <span className="field-hint">Hero: 2400 × 1000 px · Promotion: 2400 × 900 px</span>
      </div>
      <p className="admin-note">Use these slots for the main landing image and rotating campaign artwork such as a Big Billion Days-style promotion. Upload new artwork here whenever a campaign changes.</p>
      {message ? <p className="admin-feedback admin-feedback-success" role="status">{message}</p> : null}
      {error ? <p className="admin-feedback admin-feedback-error" role="alert">{error}</p> : null}

      <form className="admin-product-form" onSubmit={(event) => void saveBanner(event)}>
        <div className="form-grid">
          <label>Slot<select value={form.slot} onChange={(event) => setForm({ ...form, slot: event.target.value as Banner["slot"] })}><option value="hero">Hero banner</option><option value="promotion">Promotion banner</option></select></label>
          <label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label>Link<input value={form.href} onChange={(event) => setForm({ ...form, href: event.target.value })} placeholder="/shop" /></label>
          <label>Order<input min="0" step="1" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></label>
        </div>
        <label>Supporting text<input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} /></label>
        <div className="admin-image-field">
          <label>Banner artwork <span className="field-hint">Recommended: JPG or WebP, landscape format</span></label>
          <div className="admin-image-actions">
            <button className="button button-secondary" type="button" onClick={() => imageInputRef.current?.click()} disabled={saving}><UploadSimple size={18} /> Upload artwork</button>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void uploadImage(event.target.files?.[0])} />
            {form.image ? <span className="field-hint">Image ready</span> : null}
          </div>
          {form.image ? <Image className="admin-banner-preview" src={form.image} alt="Banner preview" width={600} height={225} unoptimized /> : null}
        </div>
        <label className="admin-checkbox"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Visible on homepage</label>
        <button className="button button-primary" type="submit" disabled={saving}>{saving ? <Spinner className="spin" size={18} /> : <FloppyDisk size={18} />} Save banner slot</button>
      </form>

      <div className="admin-banner-list">
        {banners.map((banner) => (
          <div className="admin-banner-row" key={banner._id}>
            <Image src={banner.image} alt="" width={180} height={68} unoptimized />
            <div><strong>{banner.title}</strong><span>{banner.slot} · {banner.isActive ? "Visible" : "Hidden"}</span></div>
            <button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${banner.title}`} onClick={() => void deleteBanner(banner)}><Trash size={18} /></button>
          </div>
        ))}
        {banners.length === 0 ? <p className="field-hint">No banner slots created yet.</p> : null}
      </div>
    </section>
  );
}
