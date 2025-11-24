"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function EditProfileModal({ user, isOpen, onClose, onUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || "");
  const [isLoading, setIsLoading] = useState(false);

  // =============================
  // 📌 HAPUS FOTO LAMA
  // =============================
  const deleteOldPhoto = async () => {
    try {
      if (!user?.photo_url) return;

      const path = user.photo_url.split("/object/public/profile-photos/")[1];
      if (!path) return;

      await supabase.storage.from("profile-photos").remove([path]);
    } catch (error) {
      console.log("Gagal hapus foto lama:", error);
    }
  };

  // =============================
  // 📌 UPLOAD FOTO BARU
  // =============================
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // 1️⃣ Hapus foto sebelumnya
      await deleteOldPhoto();

      // 2️⃣ Buat nama file
      const ext = file.name.split(".").pop();
      const fileName = `${user?.nis}/${Date.now()}.${ext}`;

      // 3️⃣ Upload ke Supabase
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file);

      if (uploadError) {
        alert("Gagal upload foto");
        console.log(uploadError);
        setIsLoading(false);
        return;
      }

      // 4️⃣ Ambil public URL
      const { data: publicData } = await supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      const finalUrl = publicData.publicUrl;
      setPhotoUrl(finalUrl);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  // =============================
  // 📌 HAPUS FOTO
  // =============================
  const handleDeletePhoto = async () => {
    setIsLoading(true);
    try {
      if (!user?.photo_url) return;

      const path = user.photo_url.split("/object/public/profile-photos/")[1];
      if (path) {
        await supabase.storage.from("profile-photos").remove([path]);
      }

      setPhotoUrl(null);
    } catch (error) {
      console.log("Gagal menghapus foto:", error);
    }
    setIsLoading(false);
  };

  // =============================
  // 📌 SIMPAN PROFIL
  // =============================
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: name,
          photo_url: photoUrl || null,
        })
        .eq("nis", user.nis);

      if (error) {
        alert("Gagal memperbarui profil");
        console.log(error);
        setIsLoading(false);
        return;
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  // =============================
  // 📌 RENDER MODAL
  // =============================
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Foto Profil */}
          <div className="flex flex-col items-center gap-2">
            {photoUrl ? (
              <img
                src={photoUrl}
                className="w-24 h-24 rounded-full object-cover border"
                alt="Profile"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                No Photo
              </div>
            )}

            <Input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={isLoading} />

            {photoUrl && (
              <Button variant="destructive" onClick={handleDeletePhoto} disabled={isLoading}>
                Hapus Foto
              </Button>
            )}
          </div>

          {/* Input Nama */}
          <div>
            <label className="text-sm font-medium">Nama</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
