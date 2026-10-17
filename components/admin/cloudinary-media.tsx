"use client";

import { Check, ImageSquare, Spinner, UploadSimple } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type CloudinaryFile = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  filePath: string;
};

export function CloudinaryMedia() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<CloudinaryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/cloudinary/files");
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setFiles(data.files as CloudinaryFile[]);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => void loadFiles(), 0);
    return () => window.clearTimeout(request);
  }, [loadFiles]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    setMessage("");

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "promethix3d/media");

      const response = await fetch("/api/cloudinary/upload", {
        body,
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      setMessage(`${file.name} uploaded successfully.`);
      await loadFiles();
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="admin-panel media-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Cloudinary media</p>
          <h2 className="font-heading">Image library</h2>
        </div>
        <button
          type="button"
          className="button button-primary media-upload-button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Spinner className="spin" size={18} /> : <UploadSimple size={18} />}
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />
      </div>
      {message ? <p className="media-message media-success"><Check size={16} /> {message}</p> : null}
      {error ? <p className="media-message media-error" role="alert">{error}</p> : null}
      {loading ? (
        <div className="detail-loading" role="status">Loading image library…</div>
      ) : files.length === 0 ? (
        <div className="media-empty"><ImageSquare size={28} /><p>No uploaded images yet.</p></div>
      ) : (
        <div className="media-grid">
          {files.map((file) => (
            <a href={file.url} target="_blank" rel="noreferrer" className="media-card" key={file.fileId}>
              <Image
                src={file.thumbnailUrl || file.url}
                alt={file.name}
                height={320}
                unoptimized
                width={320}
              />
              <span>{file.name}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
