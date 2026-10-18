"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  FileCode,
  FileText,
  FileUp,
  HelpCircle,
  Layers,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { AnnouncementBar } from "@/components/navigation/announcement-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { SiteFooter } from "@/components/navigation/site-footer";
import { MobileTabBar } from "@/components/navigation/mobile-tab-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/data/site";

interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  projectTitle: "",
  projectType: "prototype",
  description: "",
  quantity: "1",
  dimensions: "",
  material: "PLA+ (High-Impact)",
  colorFinish: "Matte Black",
  application: "",
  timeline: "Standard (3–5 business days)",
  budget: "",
};

const PROJECT_TYPES = [
  { value: "prototype", label: "Functional Prototype / DFM" },
  { value: "mechanical", label: "Working / Replacement Part" },
  { value: "cad", label: "CAD 3D Modelling from Scratch" },
  { value: "figurine", label: "Figurine / Deity / Miniature" },
  { value: "gift", label: "Personalised Photo Lamp / Gift" },
  { value: "bulk", label: "Batch Production / Corporate Mementoes" },
  { value: "other", label: "Other / Specialty Project" },
];

const MATERIAL_OPTIONS = [
  "PLA+ (Smooth / High Detail / Aesthetic)",
  "PETG (Durable / Weather & Chemical Resistant)",
  "ABS / ASA (Automotive / High Heat Resistant)",
  "PETG-CF (Carbon-Fibre Stiff Structural)",
  "TPU (Flexible / Gaskets / Wheels)",
  "SLA High-Precision Resin (8K/12K Sharp Details)",
  "SLA Tough Engineering Resin",
  "Unsure / Need Engineer Recommendation",
];

const FINISH_OPTIONS = [
  "Cleaned & Support-Removed (Raw Print)",
  "Matte Black",
  "Warm Ivory / Off-White",
  "Burnt Orange (Promethix Accent)",
  "Sanded & Primer-Ready for Paint",
  "Translucent / Clear Resin",
];

export function CustomOrdersClient() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        if (file.size > 25 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 25MB limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/custom-orders/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.url) {
          throw new Error(data.message || `Failed to upload "${file.name}"`);
        }

        setFiles((curr) => [
          ...curr,
          { name: file.name, url: data.url, size: file.size },
        ]);
        toast.success(`Uploaded "${file.name}"`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading file.";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (idx: number) => {
    setFiles((curr) => curr.filter((_, i) => i !== idx));
    toast.info("File removed");
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!form.projectTitle.trim()) {
        toast.error("Please provide a brief project title.");
        return false;
      }
      if (!form.description.trim() || form.description.trim().length < 10) {
        toast.error("Please describe your project (minimum 10 characters).");
        return false;
      }
    }
    if (s === 2) {
      // Step 2 specs are optional or prefilled
      return true;
    }
    if (s === 3) {
      if (!form.name.trim()) {
        toast.error("Please enter your name.");
        return false;
      }
      if (!form.email.trim() || !form.email.includes("@")) {
        toast.error("Please enter a valid email address.");
        return false;
      }
      if (!form.phone.trim()) {
        toast.error("Please enter your phone / WhatsApp number.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((curr) => Math.min(curr + 1, 4));
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setStep((curr) => Math.max(curr - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(3)) return;
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        fileUrls: files.map((f) => f.url),
      };

      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit custom order request.");
      }

      const ref = data.referenceCode || "PX-RECEIVED";
      setSubmittedRef(ref);
      toast.success("Quote request submitted successfully!", {
        description: `Reference Code: ${ref}. Our engineers will contact you within 24 hours.`,
      });
      setForm(initialForm);
      setFiles([]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit request.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        {/* Engineering Studio Hero Band */}
        <section className="bg-gradient-to-b from-[#eee8dc] via-[#f7f4ed] to-background bg-cad-grid relative border-b border-border py-12 md:py-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-56 bg-radial-warmth pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 shadow-xs">
              <Wrench className="w-3.5 h-3.5" />
              Direct Engineering Consultation
            </span>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground">
              Custom 3D Printing &amp; CAD
            </h1>
            <p className="text-sm sm:text-base text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              Have an invention, broken part, or digital CAD file? Upload your files or sketch, and our Kolkata engineers will review feasibility, select the optimal polymer, and provide a fixed quote.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs text-foreground-muted">
              <span className="flex items-center gap-1.5 bg-surface/90 border border-border px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                NDA &amp; Confidential
              </span>
              <span className="flex items-center gap-1.5 bg-surface/90 border border-border px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Quote in 24 Hours
              </span>
              <span className="flex items-center gap-1.5 bg-surface/90 border border-border px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-xs">
                <Layers className="w-3.5 h-3.5 text-primary" />
                FDM &amp; 8K/12K SLA Resin
              </span>
            </div>
          </div>
        </section>

        {/* Stepper Form Section on warm sand canvas */}
        <section className="py-10 md:py-16 bg-gradient-to-b from-[#f7f4ed] via-[#f2ece2] to-[#f7f4ed] bg-cad-dots relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {submittedRef ? (
            /* Success Screen */
            <Card className="bg-surface border-border shadow-md rounded-2xl overflow-hidden p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                  Inquiry Received!
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted">
                  Thank you! Our engineering team in Kolkata is already reviewing your details and file geometry.
                </p>
              </div>

              <div className="bg-secondary/60 rounded-xl p-4 border border-border/80 inline-block">
                <span className="text-[11px] text-foreground-subtle uppercase tracking-wider block">
                  Reference Code
                </span>
                <span className="font-mono font-bold text-lg text-primary">
                  {submittedRef}
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white">
                  <a
                    href={`https://wa.me/919832769269?text=Hi%20Promethix3D%2C%20I%20just%20submitted%20a%20quote%20request%20with%20reference%20${encodeURIComponent(submittedRef)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Our Engineers</span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSubmittedRef(null)}
                  className="w-full sm:w-auto"
                >
                  Submit Another Request
                </Button>
              </div>
            </Card>
          ) : (
            /* Stepper Form */
            <Card className="bg-surface border-border shadow-sm rounded-2xl overflow-hidden">
              {/* Stepper Progress Bar */}
              <div className="border-b border-border bg-secondary/30 px-6 py-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { num: 1, label: "Project Scope" },
                    { num: 2, label: "Specs & Files" },
                    { num: 3, label: "Your Info" },
                    { num: 4, label: "Review & Send" },
                  ].map((s) => (
                    <div
                      key={s.num}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-1 ${
                        step === s.num
                          ? "text-primary font-bold"
                          : step > s.num
                          ? "text-foreground font-medium"
                          : "text-foreground-subtle"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-mono ${
                          step === s.num
                            ? "bg-primary text-white"
                            : step > s.num
                            ? "bg-emerald-600 text-white"
                            : "bg-border text-foreground-muted"
                        }`}
                      >
                        {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                      </span>
                      <span className="text-[11px] sm:text-xs tracking-tight">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <CardContent className="p-6 sm:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Project Scope */}
                  {step === 1 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground">
                          Step 1: Tell us about what you want to create
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Describe your goal, idea, or replacement requirement.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Project Title <span className="text-primary">*</span>
                          </label>
                          <Input
                            type="text"
                            name="projectTitle"
                            value={form.projectTitle}
                            onChange={handleChange}
                            placeholder="e.g. Obsolete washing machine gear / Drone mounting bracket"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">
                              Category / Purpose
                            </label>
                            <select
                              name="projectType"
                              value={form.projectType}
                              onChange={handleChange}
                              className="w-full bg-background border border-border rounded-lg text-xs p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {PROJECT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">
                              Estimated Quantity
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max="1000"
                              name="quantity"
                              value={form.quantity}
                              onChange={handleChange}
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Detailed Description <span className="text-primary">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Explain what the part does, where it mounts, any known dimensions, or if you need CAD modelling assistance."
                            className="w-full bg-background border border-border rounded-lg text-xs p-3 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Specs & Files */}
                  {step === 2 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground">
                          Step 2: Material Preferences &amp; File Attachments
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Upload 3D files (STL/STEP) or sketches. If you don&apos;t have files, skip to the next step.
                        </p>
                      </div>

                      {/* File Upload Drop Zone */}
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Upload 3D CAD or Reference Photos (Optional)</span>
                          <span className="text-foreground-subtle font-normal">
                            STL, STEP, STP, OBJ, 3MF, PDF, JPG, PNG (Max 25MB)
                          </span>
                        </label>

                        <div className="border-2 border-dashed border-border hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40 rounded-xl p-6 text-center transition-colors relative">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            accept=".stl,.step,.stp,.obj,.3mf,.pdf,.jpg,.jpeg,.png"
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            {uploading ? (
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : (
                              <UploadCloud className="w-8 h-8 text-primary" />
                            )}
                            <p className="text-xs font-semibold text-foreground">
                              {uploading
                                ? "Uploading to secure server..."
                                : "Click to browse or drop your CAD models and sketches"}
                            </p>
                            <p className="text-[11px] text-foreground-muted">
                              Multiple files supported · All uploads kept confidential
                            </p>
                          </div>
                        </div>

                        {uploadError && (
                          <p className="text-xs text-destructive">{uploadError}</p>
                        )}

                        {/* Uploaded File List */}
                        {files.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="text-xs font-bold text-foreground">
                              Attached Files ({files.length}):
                            </span>
                            <div className="space-y-1.5">
                              {files.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-surface border border-border rounded-lg p-2.5 text-xs shadow-xs"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FileCode className="w-4 h-4 text-primary shrink-0" />
                                    <span className="font-medium text-foreground truncate">
                                      {file.name}
                                    </span>
                                    <span className="text-[10px] text-foreground-subtle shrink-0">
                                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => removeFile(idx)}
                                    className="text-foreground-muted hover:text-destructive h-7 w-7"
                                    aria-label="Remove file"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Technical Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Preferred Material
                          </label>
                          <select
                            name="material"
                            value={form.material}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg text-xs p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {MATERIAL_OPTIONS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Color &amp; Finish
                          </label>
                          <select
                            name="colorFinish"
                            value={form.colorFinish}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg text-xs p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {FINISH_OPTIONS.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Approx. Dimensions (L × W × H in mm)
                          </label>
                          <Input
                            type="text"
                            name="dimensions"
                            value={form.dimensions}
                            onChange={handleChange}
                            placeholder="e.g. 120 × 45 × 30 mm"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Operating Environment / Load
                          </label>
                          <Input
                            type="text"
                            name="application"
                            value={form.application}
                            onChange={handleChange}
                            placeholder="e.g. Outdoor heat, motor vibration, indoor decorative"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Your Info */}
                  {step === 3 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground">
                          Step 3: Where should we send your quote?
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          We will never spam or share your contact information.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-semibold text-foreground">
                            Full Name <span className="text-primary">*</span>
                          </label>
                          <Input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Email Address <span className="text-primary">*</span>
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Phone / WhatsApp <span className="text-primary">*</span>
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Desired Timeline
                          </label>
                          <select
                            name="timeline"
                            value={form.timeline}
                            onChange={handleChange}
                            className="w-full bg-background border border-border rounded-lg text-xs p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="Standard (3–5 business days)">
                              Standard (3–5 business days)
                            </option>
                            <option value="Urgent / Rush (24–48 hours)">
                              Urgent / Rush (24–48 hours)
                            </option>
                            <option value="Flexible / Research Prototype">
                              Flexible / Research Prototype
                            </option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Target Budget (Optional)
                          </label>
                          <Input
                            type="text"
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            placeholder="e.g. ₹1,500 – ₹3,000"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review & Send */}
                  {step === 4 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground">
                          Step 4: Review Your Consultation Request
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Please verify your project details before submitting.
                        </p>
                      </div>

                      <div className="bg-secondary/40 rounded-xl p-5 border border-border space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                              Project Title
                            </span>
                            <p className="font-bold text-foreground text-sm mt-0.5">
                              {form.projectTitle || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                              Category &amp; Quantity
                            </span>
                            <p className="font-medium text-foreground mt-0.5">
                              {form.projectType} · {form.quantity} unit(s)
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                              Description
                            </span>
                            <p className="text-foreground-muted mt-0.5 leading-relaxed">
                              {form.description}
                            </p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                              Material &amp; Finish
                            </span>
                            <p className="font-medium text-foreground mt-0.5">
                              {form.material} ({form.colorFinish})
                            </p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                              Contact
                            </span>
                            <p className="font-medium text-foreground mt-0.5">
                              {form.name} · {form.email} · {form.phone}
                            </p>
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-foreground-subtle uppercase">
                              Files Attached
                            </span>
                            <p className="font-medium text-foreground mt-0.5">
                              {files.length > 0
                                ? `${files.length} file(s) uploaded`
                                : "No files attached (will discuss via WhatsApp)"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
                          {error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stepper Navigation Buttons */}
                  <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="text-xs font-semibold"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {step < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-primary hover:bg-accent-strong text-white text-xs font-semibold px-6"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-primary hover:bg-accent-strong text-white text-xs font-semibold px-8 shadow-xs"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            <span>Submitting Quote Request...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            <span>Submit for 24h Free Quote</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
        </section>
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}
