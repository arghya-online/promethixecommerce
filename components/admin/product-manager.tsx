"use client";

import { FloppyDisk, PencilSimple, Plus, Spinner, Trash, UploadSimple, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Category, Product } from "@/components/catalog/product-types";

type ProductManagerProps = {
  categories: Category[];
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  onCategoriesChange: (categories: Category[]) => void;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  dimensions: string;
  material: string;
  price: string;
  stock: string;
  category: string;
  images: string;
  isActive: boolean;
};

const emptyForm: ProductForm = {
  category: "",
  description: "",
  dimensions: "",
  material: "",
  images: "",
  isActive: true,
  name: "",
  price: "",
  stock: "0",
  slug: "",
};

function formFromProduct(product: Product): ProductForm {
  return {
    category: typeof product.category === "string" ? product.category : product.category?._id ?? "",
    description: product.description ?? "",
    dimensions: product.dimensions ?? "",
    material: product.material ?? "",
    images: (product.images ?? []).join("\n"),
    isActive: product.isActive ?? true,
    name: product.name ?? "",
    price: String(product.price ?? ""),
    stock: String(product.stock ?? 0),
    slug: product.slug ?? "",
  };
}

function productPayload(form: ProductForm) {
  return {
    category: form.category,
    description: form.description.trim(),
    dimensions: form.dimensions.trim(),
    material: form.material.trim(),
    images: form.images.split("\n").map((image) => image.trim()).filter(Boolean),
    isActive: form.isActive,
    name: form.name.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    slug: form.slug.trim(),
  };
}

export function ProductManager({ categories, products, onProductsChange, onCategoriesChange }: ProductManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSlugDirty, setIsSlugDirty] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "" });
  const [categorySaving, setCategorySaving] = useState(false);

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: !isSlugDirty ? generateSlug(name) : current.slug,
    }));
  }

  function startCreate() {
    setEditingId("");
    setIsSlugDirty(false);
    setForm({ ...emptyForm, category: categories[0]?._id ?? "" });
    setError("");
    setMessage("");
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setIsSlugDirty(true);
    setForm(formFromProduct(product));
    setError("");
    setMessage("");
  }

  function cancelEdit() {

    setEditingId(null);
    setError("");
  }

  function generateCategorySlug(name: string) {
    return generateSlug(name);
  }

  async function createCategory() {
    setCategorySaving(true);
    setError("");
    try {
      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description: categoryForm.description.trim(),
        image: "",
        isActive: true,
      };
      if (!payload.name || !payload.slug || !payload.description) {
        throw new Error("Category name, slug, and description are required.");
      }
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not create category.");
      const created = data.category as Category;
      onCategoriesChange([created, ...categories]);
      setForm((current) => ({ ...current, category: created._id }));
      setCategoryForm({ name: "", slug: "", description: "" });
      setCreatingCategory(false);
      setMessage(`Category "${created.name}" created and selected.`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not create category.");
    } finally {
      setCategorySaving(false);
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", "promethix3d/products");

        const response = await fetch("/api/cloudinary/upload", {
          body,
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok || !data.success || typeof data.url !== "string") {
          throw new Error(data.message || `Image upload failed (${response.status}).`);
        }
        uploadedUrls.push(data.url);
      }

      const existing = productPayload(form).images;
      setForm((current) => ({ ...current, images: [...existing, ...uploadedUrls].join("\n") }));
      setMessage(`${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} uploaded. Save the product to apply them.`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not upload product images.");
    } finally {
      setSaving(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }


  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = productPayload(form);
      if (!payload.name) throw new Error("Product name is required.");
      if (!payload.slug) throw new Error("Product slug is required.");
      if (!payload.category) throw new Error("Please select a category.");
      if (!payload.description) throw new Error("Product description is required.");
      if (!Number.isFinite(payload.price) || payload.price < 0) throw new Error("Please provide a valid price.");
      if (!Number.isInteger(payload.stock) || payload.stock < 0) throw new Error("Stock must be a non-negative whole number.");

      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: editingId ? "PATCH" : "POST",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        let errorMsg = data.message || "Could not save the product.";
        if (data.errors?.fieldErrors) {
          const fieldMsgs = Object.entries(data.errors.fieldErrors)
            .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
            .join("; ");
          if (fieldMsgs) errorMsg = `${errorMsg} (${fieldMsgs})`;
        }
        throw new Error(errorMsg);
      }

      const savedProduct = (data.product ?? data) as Product;
      const nextProducts = editingId
        ? products.map((product) => product._id === savedProduct._id ? savedProduct : product)
        : [savedProduct, ...products];
      onProductsChange(nextProducts);
      setEditingId(null);
      setForm(emptyForm);
      setMessage(editingId ? "Product updated." : "Product created.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not save the product.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    setDeletingId(product._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not delete the product.");
      onProductsChange(products.filter((item) => item._id !== product._id));
      if (editingId === product._id) cancelEdit();
      setMessage("Product deleted.");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not delete the product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <p className="eyebrow">Catalogue management</p>
          <h2 className="font-heading">Products</h2>
        </div>
        <button className="button button-primary" type="button" onClick={startCreate}>
          <Plus size={18} /> Add product
        </button>
      </div>

      {message ? <p className="admin-feedback admin-feedback-success" role="status">{message}</p> : null}
      {error ? <p className="admin-feedback admin-feedback-error" role="alert">{error}</p> : null}

      {editingId !== null ? (
        <form className="admin-product-form" onSubmit={(event) => void saveProduct(event)}>
          <div className="admin-form-heading">
            <h3 className="font-heading">{editingId ? "Edit product" : "New product"}</h3>
            <button className="icon-button" type="button" aria-label="Cancel editing" onClick={cancelEdit}><X size={20} /></button>
          </div>
          <div className="form-grid">
            <label>Product name<input required value={form.name ?? ""} onChange={(event) => handleNameChange(event.target.value)} /></label>
            <label>Slug<input required value={form.slug ?? ""} onChange={(event) => { setIsSlugDirty(true); setForm({ ...form, slug: event.target.value }); }} /></label>
            <label>Price (INR)<input required min="0" step="0.01" type="number" value={form.price ?? ""} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
            <label>Stock<input required min="0" step="1" type="number" value={form.stock ?? "0"} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></label>
            <label>Category
              <div className="category-select-row">
                <select required value={form.category ?? ""} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="">Choose category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
                <button className="button button-secondary category-create-toggle" type="button" onClick={() => setCreatingCategory((value) => !value)}>{creatingCategory ? "Close" : "New category"}</button>
              </div>
            </label>
            <label>Dimensions<span className="field-hint">Example: 120 × 80 × 40 mm</span><input value={form.dimensions ?? ""} placeholder="120 × 80 × 40 mm" onChange={(event) => setForm({ ...form, dimensions: event.target.value })} /></label>
            <label>Material<span className="field-hint">Example: PLA / Standard Resin</span><input value={form.material ?? ""} placeholder="PLA" onChange={(event) => setForm({ ...form, material: event.target.value })} /></label>
          </div>
          {creatingCategory ? (
            <div className="inline-category-form">
              <p className="eyebrow">Create category</p>
              <div className="form-grid">
                <label>Name<input required value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value, slug: current.slug || generateCategorySlug(event.target.value) }))} /></label>
                <label>Slug<input required value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} /></label>
              </div>
              <label>Description<textarea required rows={2} value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} /></label>
              <button className="button button-secondary" type="button" disabled={categorySaving} onClick={() => void createCategory()}>{categorySaving ? "Creating…" : "Create and select category"}</button>
            </div>
          ) : null}
          <label>Description<textarea required rows={4} value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <div className="admin-image-field">
            <label>Product images <span className="field-hint">Recommended: 1200 × 1200 px square images · upload or paste URLs below</span></label>
            <div className="admin-image-actions">
              <button className="button button-secondary" type="button" onClick={() => imageInputRef.current?.click()} disabled={saving}>
                <UploadSimple size={18} /> Upload images
              </button>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(event) => void uploadImages(event.target.files)} />
              <span className="field-hint">{productPayload(form).images.length} image{productPayload(form).images.length === 1 ? "" : "s"} selected</span>
            </div>
            {productPayload(form).images.length > 0 ? (
              <div className="admin-image-preview">
                {productPayload(form).images.map((image, index) => (
                  <div className="admin-image-preview-item" key={`${image}-${index}`}>
                    <Image src={image} alt={`Product preview ${index + 1}`} width={96} height={96} unoptimized />
                    <button type="button" className="icon-button" aria-label={`Remove image ${index + 1}`} onClick={() => setForm((current) => ({ ...current, images: productPayload(current).images.filter((_, imageIndex) => imageIndex !== index).join("\n") }))}><X size={16} /></button>
                  </div>
                ))}
              </div>
            ) : null}
            <textarea rows={3} value={form.images ?? ""} aria-label="Product image URLs" onChange={(event) => setForm({ ...form, images: event.target.value })} />
          </div>
          <label className="admin-checkbox"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Visible in shop</label>
          <button className="button button-primary" type="submit" disabled={saving || categories.length === 0}>
            {saving ? <Spinner className="spin" size={18} /> : <FloppyDisk size={18} />} {saving ? "Saving…" : "Save product"}
          </button>
          {categories.length === 0 ? <p className="field-hint">Create a category before adding a product.</p> : null}
        </form>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No products found. Click &quot;Add product&quot; above to create one.</td></tr>
            ) : (
              products.map((product) => {
                const categoryName = typeof product.category === "object" && product.category?.name
                  ? product.category.name
                  : categories.find((c) => c._id === product.category)?.name ?? "—";
                const firstImage = product.images?.[0];

                return (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={product.name}
                            width={40}
                            height={40}
                            unoptimized
                            style={{ objectFit: "cover", borderRadius: "2px", border: "1px solid var(--border)" }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, background: "var(--surface-subtle)", border: "1px solid var(--border)" }} />
                        )}
                        <div>
                          <strong>{product.name}</strong>
                          <div className="field-hint">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>{categoryName}</td>
                    <td>₹{product.price.toLocaleString("en-IN")}</td>
                    <td>{product.stock}</td>
                    <td><span className={product.isActive ? "status-tag status-paid" : "status-tag"}>{product.isActive ? "Active" : "Hidden"}</span></td>
                    <td className="admin-row-actions">
                      <button className="icon-button" type="button" aria-label={`Edit ${product.name}`} onClick={() => startEdit(product)}><PencilSimple size={18} /></button>
                      <button className="icon-button icon-button-danger" type="button" aria-label={`Delete ${product.name}`} disabled={deletingId === product._id} onClick={() => void deleteProduct(product)}>{deletingId === product._id ? <Spinner className="spin" size={18} /> : <Trash size={18} />}</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
