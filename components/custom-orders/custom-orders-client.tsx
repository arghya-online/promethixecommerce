"use client";

import {
  ArrowRight,
  CheckCircle,
  Clock,
  Cube,
  FileCode,
  FileImage,
  Info,
  ShieldCheck,
  Spinner,
  Trash,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/navigation/site-header";

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
  material: "PLA",
  colorFinish: "Matte Black",
  application: "",
  timeline: "",
  budget: "",
};

const PROJECT_TYPES = [
  { value: "figurine", label: "Figurines & Collectibles" },
  { value: "gift", label: "Personalised Gifts" },
  { value: "decor", label: "Home & Desk Decor" },
  { value: "mechanical", label: "Mechanical & Robotics" },
  { value: "prototype", label: "Prototypes & Product Dev" },
  { value: "other", label: "Other / Custom Art" },
];

const MATERIAL_OPTIONS = [
  "PLA (Standard / Biodegradable)",
  "PLA+ (Higher Impact Strength)",
  "PETG (Durable & Weather Resistant)",
  "ABS / ASA (UV & Heat Resistant)",
  "TPU (Flexible Rubber-like)",
  "PETG-CF (Carbon Fiber Reinforced)",
  "SLA Standard Resin (Smooth Surface)",
  "SLA Tough / Engineering Resin",
  "SLA High-Detail Resin (Miniatures)",
  "Unsure / Need Engineering Advice",
];

const FINISH_OPTIONS = [
  "Raw Print (Layer-lines visible)",
  "Smooth / Cleaned",
  "Matte Black",
  "Natural Ivory / White",
  "Burnt Orange",
  "Silk Metallic (Silver / Gold)",
  "Translucent / Clear Resin",
  "Sanded & Ready for Paint",
];

export function CustomOrdersClient() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 20MB limit.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/custom-orders/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success || !data.url) {
          throw new Error(data.message || `Failed to upload "${file.name}"`);
        }

        setFiles((current) => [
          ...current,
          {
            name: file.name,
            url: data.url,
            size: file.size,
          },
        ]);
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Error uploading attachment.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form,
        fileUrls: files.map((f) => f.url),
      };

      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit request.");
      }

      setSubmittedRef(data.referenceCode || "PX-RECEIVED");
      setForm(initialForm);
      setFiles([]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your custom order inquiry right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <SiteHeader />

      <main className="custom-orders-page">
        <Container className="custom-orders-container">
          {/* Header */}
          <header className="custom-orders-hero">
            <p className="eyebrow">CUSTOM 3D FABRICATION · DIRECT ENGINEERING</p>
            <h1 className="font-heading custom-orders-title">
              Got an idea? Let’s make it real.
            </h1>
            <p className="custom-orders-subtitle">
              From one-off functional prototypes and engineering components to personalized
              keepsakes and detailed figurines. Upload your CAD file, sketch, or just describe
              your concept — we consult on feasibility, materials, and dispatch to your doorstep.
            </p>

            <div className="custom-orders-badges">
              <span className="trust-badge">
                <ShieldCheck size={16} weight="fill" />
                NDA &amp; IP Protection Available
              </span>
              <span className="trust-badge">
                <Cube size={16} weight="fill" />
                FDM &amp; SLA High-Precision
              </span>
              <span className="trust-badge">
                <Clock size={16} weight="fill" />
                Quote within 24 Hours
              </span>
            </div>
          </header>

          {submittedRef ? (
            <div className="custom-success-card">
              <div className="custom-success-icon">
                <CheckCircle size={52} weight="fill" />
              </div>
              <p className="eyebrow">Request Received</p>
              <h2 className="font-heading">Your custom print request has been logged.</h2>
              <div className="custom-ref-box">
                <span>Request Reference ID:</span>
                <strong>{submittedRef}</strong>
              </div>
              <p className="custom-success-desc">
                Our engineering team in Kolkata has received your project details and attached
                files. We will review dimensions, slice geometry, and calculate material pricing.
                Expect a formal quote or consultation via email / phone within 24 business hours.
              </p>
              <div className="custom-success-actions">
                <Link href="/shop" className="button button-primary">
                  Explore Ready Products <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setSubmittedRef(null)}
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <div className="custom-orders-grid">
              {/* Form Side */}
              <form onSubmit={handleSubmit} className="custom-order-form">
                {/* Section 1: Contact Information */}
                <div className="form-section">
                  <div className="form-section-head">
                    <span className="form-step-num">01</span>
                    <div>
                      <h2 className="font-heading">Contact Details</h2>
                      <p>How we can send your quote and reach you with questions.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="field-group">
                      <span className="field-label">Full Name *</span>
                      <input
                        required
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        className="text-input"
                      />
                    </label>

                    <label className="field-group">
                      <span className="field-label">Email Address *</span>
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className="text-input"
                      />
                    </label>
                  </div>

                  <label className="field-group">
                    <span className="field-label">Phone / WhatsApp Number *</span>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="text-input"
                    />
                    <span className="field-help">
                      We share slice previews, production photos, and shipment tracking via WhatsApp.
                    </span>
                  </label>
                </div>

                {/* Section 2: Project Classification */}
                <div className="form-section">
                  <div className="form-section-head">
                    <span className="form-step-num">02</span>
                    <div>
                      <h2 className="font-heading">Project Scope</h2>
                      <p>Tell us what kind of object you need made.</p>
                    </div>
                  </div>

                  <label className="field-group">
                    <span className="field-label">Project Title</span>
                    <input
                      type="text"
                      name="projectTitle"
                      value={form.projectTitle}
                      onChange={handleChange}
                      placeholder="e.g. Robotic Arm Gripper Bracket / Custom Birthday Bust"
                      className="text-input"
                    />
                  </label>

                  <div className="field-group">
                    <span className="field-label">Product Category *</span>
                    <div className="category-chips">
                      {PROJECT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          className={`chip-button ${
                            form.projectType === type.value ? "is-selected" : ""
                          }`}
                          onClick={() =>
                            setForm((c) => ({ ...c, projectType: type.value }))
                          }
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="field-group">
                    <span className="field-label">Project Description &amp; Requirements *</span>
                    <textarea
                      required
                      rows={5}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe what the object is, how it should look or function, any mechanical stress or tolerances, and whether you already have a 3D CAD model or need 3D design assistance."
                      className="text-textarea"
                    />
                  </label>
                </div>

                {/* Section 3: Technical Specifications */}
                <div className="form-section">
                  <div className="form-section-head">
                    <span className="form-step-num">03</span>
                    <div>
                      <h2 className="font-heading">Specifications &amp; Materials</h2>
                      <p>Dimensions, preferred filaments/resins, and intended application.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="field-group">
                      <span className="field-label">Quantity</span>
                      <input
                        type="text"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 1 unit / 10 pcs batch"
                        className="text-input"
                      />
                    </label>

                    <label className="field-group">
                      <span className="field-label">Approximate Dimensions (L × W × H)</span>
                      <input
                        type="text"
                        name="dimensions"
                        value={form.dimensions}
                        onChange={handleChange}
                        placeholder="e.g. 150 × 80 × 50 mm"
                        className="text-input"
                      />
                    </label>
                  </div>

                  <div className="form-grid">
                    <label className="field-group">
                      <span className="field-label">Preferred Material</span>
                      <select
                        name="material"
                        value={form.material}
                        onChange={handleChange}
                        className="text-select"
                      >
                        {MATERIAL_OPTIONS.map((mat) => (
                          <option key={mat} value={mat}>
                            {mat}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field-group">
                      <span className="field-label">Colour &amp; Surface Finish</span>
                      <select
                        name="colorFinish"
                        value={form.colorFinish}
                        onChange={handleChange}
                        className="text-select"
                      >
                        {FINISH_OPTIONS.map((finish) => (
                          <option key={finish} value={finish}>
                            {finish}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="field-group">
                    <span className="field-label">Intended Application</span>
                    <input
                      type="text"
                      name="application"
                      value={form.application}
                      onChange={handleChange}
                      placeholder="e.g. Indoor decorative display / Outdoor functional drone mount / High heat environment"
                      className="text-input"
                    />
                  </label>
                </div>

                {/* Section 4: Attachments */}
                <div className="form-section">
                  <div className="form-section-head">
                    <span className="form-step-num">04</span>
                    <div>
                      <h2 className="font-heading">Reference Images &amp; Design Files</h2>
                      <p>Upload your 3D models (STL, OBJ, STEP), sketches, or reference photos.</p>
                    </div>
                  </div>

                  <div className="upload-dropzone">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".stl,.obj,.step,.stp,.3mf,.png,.jpg,.jpeg,.webp,.pdf"
                      className="sr-only"
                      id="file-upload-input"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />

                    <label htmlFor="file-upload-input" className="upload-box-label">
                      <div className="upload-icon-circle">
                        {uploading ? (
                          <Spinner size={24} className="spin" />
                        ) : (
                          <UploadSimple size={24} />
                        )}
                      </div>
                      <div className="upload-text-block">
                        <strong>
                          {uploading ? "Uploading attachments…" : "Click or drag files here to upload"}
                        </strong>
                        <span>
                          Supports 3D models (.STL, .OBJ, .STEP, .3MF), Images (.JPG, .PNG, .WebP), and PDFs up to 20MB
                        </span>
                      </div>
                    </label>
                  </div>

                  {uploadError ? (
                    <p className="form-alert form-alert--error" role="alert">
                      <WarningCircle size={16} />
                      {uploadError}
                    </p>
                  ) : null}

                  {files.length > 0 ? (
                    <div className="uploaded-files-list">
                      <span className="field-label">
                        Attached Files ({files.length}):
                      </span>
                      {files.map((file, idx) => (
                        <div key={idx} className="file-badge">
                          {file.name.endsWith(".stl") ||
                          file.name.endsWith(".obj") ||
                          file.name.endsWith(".step") ? (
                            <FileCode size={18} />
                          ) : (
                            <FileImage size={18} />
                          )}
                          <span className="file-badge-name">{file.name}</span>
                          <span className="file-badge-size">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            className="file-remove-btn"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => removeFile(idx)}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Section 5: Timeline & Budget */}
                <div className="form-section">
                  <div className="form-section-head">
                    <span className="form-step-num">05</span>
                    <div>
                      <h2 className="font-heading">Timeline &amp; Budget</h2>
                      <p>Helps us recommend the most cost-effective printing technology.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="field-group">
                      <span className="field-label">Target Delivery Timeline</span>
                      <input
                        type="text"
                        name="timeline"
                        value={form.timeline}
                        onChange={handleChange}
                        placeholder="e.g. Within 1 week / Flexible / Urgent (3 days)"
                        className="text-input"
                      />
                    </label>

                    <label className="field-group">
                      <span className="field-label">Budget Expectation</span>
                      <input
                        type="text"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="e.g. Under ₹1,500 / ₹3,000–₹5,000"
                        className="text-input"
                      />
                    </label>
                  </div>
                </div>

                {error ? (
                  <p className="form-alert form-alert--error" role="alert">
                    <WarningCircle size={18} />
                    {error}
                  </p>
                ) : null}

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="button button-primary button-large"
                  >
                    {submitting ? (
                      <>
                        <Spinner size={18} className="spin" />
                        Submitting Inquiry…
                      </>
                    ) : (
                      <>
                        Submit Custom Order Request
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="form-guarantee">
                    <Info size={14} />
                    No upfront payment required. You will receive a technical review and final price quotation before production begins.
                  </p>
                </div>
              </form>

              {/* Aside: Helpful information */}
              <aside className="custom-orders-sidebar">
                <div className="sidebar-card">
                  <h3 className="font-heading">How Custom Orders Work</h3>
                  <ol className="sidebar-steps">
                    <li>
                      <strong>1. Review &amp; Slice</strong>
                      <p>
                        We inspect geometry for printability, overhangs, wall thickness, and infill integrity.
                      </p>
                    </li>
                    <li>
                      <strong>2. Quotation &amp; Approval</strong>
                      <p>
                        You receive exact pricing based on filament/resin volume and print hours.
                      </p>
                    </li>
                    <li>
                      <strong>3. Print &amp; Post-Processing</strong>
                      <p>
                        Manufactured on tuned Bambu Lab / Creality FDM and high-resolution SLA resin printers.
                      </p>
                    </li>
                    <li>
                      <strong>4. Pan-India Dispatch</strong>
                      <p>
                        Protective bubble wrap &amp; rigid outer casing with real-time tracking to your city.
                      </p>
                    </li>
                  </ol>
                </div>

                <div className="sidebar-card">
                  <h3 className="font-heading">Materials Guide</h3>
                  <div className="material-quicklist">
                    <div className="mat-item">
                      <strong>PLA / PLA+</strong>
                      <span>Best for figurines, display models, cosplay, and decorative objects.</span>
                    </div>
                    <div className="mat-item">
                      <strong>PETG &amp; ABS</strong>
                      <span>Best for functional brackets, mechanical parts, enclosures, outdoor use.</span>
                    </div>
                    <div className="mat-item">
                      <strong>TPU</strong>
                      <span>Flexible, rubbery, shock-absorbing gaskets, tires, dampeners.</span>
                    </div>
                    <div className="mat-item">
                      <strong>High-Detail SLA Resin</strong>
                      <span>Ultra-smooth 0.05mm layer resolution for miniature figurines and jewelry.</span>
                    </div>
                  </div>
                </div>

                <div className="sidebar-card sidebar-card--contact">
                  <h4 className="font-heading">Need Quick Advice?</h4>
                  <p>
                    Have a quick question about CAD design or bulk batch orders?
                  </p>
                  <p className="sidebar-phone">
                    <strong>WhatsApp / Phone:</strong> +91 98327 69269
                  </p>
                  <p className="sidebar-email">
                    <strong>Email:</strong> promethix3d@gmail.com
                  </p>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
