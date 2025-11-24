"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { showSuccessNotification, showErrorNotification } from "@/lib/notification"
import { Upload, Trash2 } from "lucide-react"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [username, setUsername] = useState(user?.username || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [bio, setBio] = useState(user?.bio || "no bio")
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)

  // -------------------------------
  // SAVE PROFILE
  // -------------------------------
  const handleSave = async () => {
    setError("")

    if (!username.trim()) {
      setError("Username tidak boleh kosong")
      return
    }

    if (password && password !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    try {
      setLoading(true)

      const updateData: any = {
        username,
        bio: bio || "no bio",
        photo_url: photoUrl || null,
      }

      if (password) updateData.password = password

      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("nis", user?.nis)

      if (updateError) {
        console.error(updateError)
        showErrorNotification("Gagal", "Tidak dapat memperbarui profil")
        return
      }

      // update localStorage
      if (user) {
        const updated = { ...user, ...updateData }
        localStorage.setItem("auth_user", JSON.stringify(updated))
      }

      showSuccessNotification("Berhasil", "Profil berhasil diperbarui")
      onClose()
    } catch (err) {
      console.error(err)
      showErrorNotification("Gagal", "Terjadi kesalahan saat memperbarui profil")
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------
  // UPLOAD PHOTO
  // -------------------------------
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 512 * 1024) {
      setError("Ukuran file maksimal 512KB")
      return
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format file harus JPG, PNG, atau WebP")
      return
    }

    try {
      setPhotoLoading(true)
      setError("")

      // ---------------------------
      // HAPUS FOTO LAMA
      // ---------------------------
      if (user?.photo_url) {
        const path = user.photo_url.split("/public/")[1] // Ambil path setelah /public/
        if (path) {
          await supabase.storage.from("profile-photos").remove([path])
        }
      }

      // ---------------------------
      // UPLOAD FOTO BARU
      // ---------------------------
      const ext = file.name.split(".").pop()
      const fileName = `${user?.nis}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file)

      if (uploadError) {
        console.error(uploadError)
        setError("Gagal upload foto")
        return
      }

      // ---------------------------
      // GET PUBLIC URL
      // ---------------------------
      const { data: publicData } = await supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName)

      const finalUrl = publicData.publicUrl
      setPhotoUrl(finalUrl)

      // ---------------------------
      // UPDATE DB
      // ---------------------------
      await supabase.from("users")
        .update({ photo_url: finalUrl })
        .eq("nis", user?.nis)

      // update localStorage
      const updatedUser = { ...user, photo_url: finalUrl }
      localStorage.setItem("auth_user", JSON.stringify(updatedUser))

      showSuccessNotification("Berhasil", "Foto profil berhasil diupload")
    } catch (err) {
      console.error(err)
      setError("Gagal upload foto")
    } finally {
      setPhotoLoading(false)
    }
  }

  // -------------------------------
  // DELETE PHOTO
  // -------------------------------
  const handleDeletePhoto = async () => {
    try {
      setPhotoLoading(true)

      if (user?.photo_url) {
        const path = user.photo_url.split("/public/")[1]
        if (path) await supabase.storage.from("profile-photos").remove([path])
      }

      await supabase.from("users")
        .update({ photo_url: null })
        .eq("nis", user?.nis)

      setPhotoUrl("")

      const updated = { ...user, photo_url: null }
      localStorage.setItem("auth_user", JSON.stringify(updated))

      showSuccessNotification("Berhasil", "Foto profil berhasil dihapus")
    } catch (err) {
      console.error(err)
      setError("Gagal menghapus foto")
    } finally {
      setPhotoLoading(false)
    }
  }

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="edit-profile-modal-description">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Foto Profil</label>
            <div className="flex flex-col items-center gap-3">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto Profil"
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-profile-avatar.png")}
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Upload size={24} className="text-muted-foreground" />
                </div>
              )}

              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="flex-1"
                  size="sm"
                >
                  <Upload size={16} className="mr-1" />
                  Upload
                </Button>

                {photoUrl && (
                  <Button
                    onClick={handleDeletePhoto}
                    disabled={photoLoading}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={photoLoading}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground text-center">
                Max 512KB, JPG/PNG/WebP
              </p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password Baru (Opsional)</label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
            <input
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Batal
            </Button>

            <Button onClick={handleSave} disabled={loading || photoLoading} className="flex-1">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
