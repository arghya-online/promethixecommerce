"use client";

import { Check, ImageSquare, Spinner, UploadSimple } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type ImageKitFile = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  filePath: string;
};

type UploadAuth = {
  expire: number;
  publicKey: string;
  signature: string;
  token: string;
};

export function ImageKitMedia() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ImageKitFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/imagekit/files");
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setFiles(data.files as ImageKitFile[]);
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
      const authResponse = await fetch("/api/imagekit/auth");
      const authData = await authResponse.json();
      if (!authResponse.ok || !authData.success) throw new Error(authData.message);

      const authentication = authData.authenticationParameters as UploadAuth;
      const body = new FormData();
      body.append("file", file);
      body.append("fileName", file.name);
      body.append("publicKey", authentication.publicKey);
      body.append("signature", authentication.signature);
      body.append("expire", String(authentication.expire));
      body.append("token", authentication.token);
      body.append("folder", "/promethix3d");

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        body,
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        const providerMessage =
          typeof data.message === "string"
            ? data.message
            : typeof data.help === "string"
              ? data.help
              : "Image upload failed.";
        throw new Error(`ImageKit upload failed (${response.status}): ${providerMessage}`);
      }

      setMessage(`${file.name} uploaded.`);
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
          <p className="eyebrow">ImageKit media</p>
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
