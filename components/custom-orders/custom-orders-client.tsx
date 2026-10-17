"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  projectType: "figurine",
  description: "",
  dimensions: "",
  timeline: "",
  budget: "",
};

const projectTypes = [
  { value: "figurine", label: "Figurine / collectible" },
  { value: "gift", label: "Gift / personal item" },
  { value: "decor", label: "Home decor" },
  { value: "mechanical", label: "Mechanical / functional" },
  { value: "robotics", label: "Robotics / prototype" },
  { value: "prototype", label: "Prototype / product development" },
  { value: "other", label: "Other" },
];

export function CustomOrdersClient() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit order request.");
      }

      setForm(initialForm);
      setSuccess(data.message || "Your custom order request was sent successfully.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting your request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-[#0b0f14] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-12">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-[#96e0ff]">
            Custom fabrication
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
            Bring your print idea to life.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Share your concept, requirements, and timeline. We’ll review the request and get back to
            you with feasibility, materials, and next steps.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-[#1f2a36] bg-[#101922] p-6">
            <h2 className="text-xl font-semibold text-white">What we can help with</h2>
            <ul className="mt-5 space-y-4 text-sm text-slate-300">
              <li>• Concept development and prototyping</li>
              <li>• Small-batch production and functional parts</li>
              <li>• Branded gifts, displays, and collectible designs</li>
              <li>• Material and finishing guidance</li>
            </ul>
            <div className="mt-8 rounded-2xl border border-[#204d66] bg-[#0d1720] p-4 text-sm text-slate-200">
              Typical turnaround: 1–3 weeks depending on complexity and finishing requirements.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[#1f2a36] bg-[#0f1720] p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Full name</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                  placeholder="Jane Smith"
                  required
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                  placeholder="jane@example.com"
                  required
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Phone</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                  placeholder="(555) 123-4567"
                  required
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Project type</span>
                <select
                  name="projectType"
                  value={form.projectType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                >
                  {projectTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Project description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                placeholder="Tell us what you want to build, use case, style, and any key details."
                required
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-3">
              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Dimensions</span>
                <input
                  name="dimensions"
                  value={form.dimensions}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                  placeholder="e.g. 12 x 6 x 8 cm"
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Timeline</span>
                <input
                  name="timeline"
                  value={form.timeline}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                  placeholder="e.g. 2–3 weeks"
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block">Budget</span>
                <input
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#2c3c4e] bg-[#0b1017] px-3 py-3 text-white outline-none transition focus:border-[#7dd3fc]"
                  placeholder="e.g. $300–$800"
                />
              </label>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#96e0ff] px-5 py-3 font-medium text-[#07141d] transition hover:bg-[#b7ebff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending request..." : "Request a custom quote"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
