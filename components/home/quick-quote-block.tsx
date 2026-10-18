"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ACCEPTED_FORMATS = [
  "STL",
  "STEP",
  "STP",
  "OBJ",
  "3MF",
  "PDF",
  "JPG",
  "PNG",
];

export function QuickQuoteBlock() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFileName(e.dataTransfer.files[0].name);
      setTimeout(() => {
        router.push("/custom-orders");
      }, 600);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      setTimeout(() => {
        router.push("/custom-orders");
      }, 600);
    }
  };

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-[#f7f3ec] via-[#ede7dc] to-[#f7f3ec] border-b border-border/80 relative overflow-hidden" aria-label="Quick Quote Estimator">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-radial-warmth pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-surface border-border shadow-sm rounded-2xl overflow-hidden hover:border-[#ff7336]/30 transition-colors">
            <CardContent className="p-6 sm:p-10 text-center space-y-6">
              <div className="space-y-2 max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff7336]">
                  Instant File Upload
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground">
                  Get a Free Quote in 24 Hours
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted">
                  Drop your 3D CAD model, 2D sketch, or reference photo below. Our engineering team reviews feasibility and replies with a fixed, transparent quote.
                </p>
              </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-secondary/40 bg-secondary/20"
              }`}
            >
              <input
                type="file"
                id="quick-quote-file-input"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".stl,.step,.stp,.obj,.3mf,.pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                aria-label="Upload CAD file or sketch for quote"
              />

              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>

              {selectedFileName ? (
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-primary flex items-center justify-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{selectedFileName}</span>
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Redirecting to custom order configuration...
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Click to browse or drag and drop your file here
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Supported: {ACCEPTED_FORMATS.join(", ")} (up to 50MB)
                  </p>
                </div>
              )}
            </div>

            {/* CTA & Trust badges */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-4 text-xs text-foreground-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Reply in 24 hours</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>NDA &amp; Confidential</span>
                </span>
              </div>

              <Button
                onClick={() => router.push("/custom-orders")}
                size="lg"
                className="bg-[#ff7336] hover:bg-[#ff824c] text-white font-semibold shadow-xs w-full sm:w-auto"
              >
                <span>Request My Free Quote</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </section>
);
}
