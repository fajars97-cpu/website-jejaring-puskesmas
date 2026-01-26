// src/features/admin-jejaring/cloudinary.js
export async function uploadToCloudinary(file, { signal } = {}) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary env belum diset. Pastikan VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET ada di .env"
    );
  }
  if (!file) throw new Error("File belum dipilih.");

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  const res = await fetch(url, { method: "POST", body: form, signal });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Upload gagal.");
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}
