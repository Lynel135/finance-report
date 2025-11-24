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

  // ============================================================
  // ✅ FIXED: UPLOAD FOTO PROFIL
  // ============================================================
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

      // 1. Delete old photo from storage
      if (user?.photo_url) {
        const oldFileName = user.photo_url.split("/").pop()
        if (oldFileName) {
          await supabase.storage.from("profile-photos").remove([oldFileName])
        }
      }

      // 2. Upload new photo
      const ext = file.name.split(".").pop()
      const fileName = `${user?.nis}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        setError("Gagal upload foto")
        return
      }

      // 3. Get public URL
      const { data: publicData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName)

      const newUrl = publicData.publicUrl
      setPhotoUrl(newUrl)

      // 4. Update DB
      await supabase.from("users").update({ photo_url: newUrl }).eq("nis", user?.nis)

      // 5. Update local storage
      if (user) {
        const newUser = { ...user, photo_url: newUrl }
        localStorage.setItem("auth_user", JSON.stringify(newUser))
      }

      showSuccessNotification("Berhasil", "Foto profil berhasil diupload")
    } catch (err) {
      console.error("Error uploading photo:", err)
      setError("Gagal upload foto")
    } finally {
      setPhotoLoading(false)
    }
  }

  // ============================================================
  // ✅ FIXED: DELETE FOTO PROFIL
  // ============================================================
  const handleDeletePhoto = async () => {
    try {
      setPhotoLoading(true)

      if (user?.photo_url) {
        const fileName = user.photo_url.split("/").pop()
        if (fileName) {
          await supabase.storage.from("profile-photos").remove([fileName])
        }
      }

      await supabase.from("users").update({ photo_url: null }).eq("nis", user?.nis)

      setPhotoUrl("")

      if (user) {
        const newUser = { ...user, photo_url: null }
        localStorage.setItem("auth_user", JSON.stringify(newUser))
      }

      showSuccessNotification("Berhasil", "Foto profil berhasil dihapus")
    } catch (err) {
      console.error("Error deleting photo:", err)
      setError("Gagal menghapus foto")
    } finally {
      setPhotoLoading(false)
    }
  }

  // ============================================================
  // TIDAK DIUBAH — HANDLE SAVE PROFIL (USERNAME, BIO, PASSWORD)
  // ============================================================
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
      }
      if (password) {
        updateData.password = password
      }

      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("nis", user?.nis)

      if (updateError) {
        showErrorNotification("Gagal", "Tidak dapat memperbarui profil")
        return
      }

      if (user) {
        const updatedUser = { ...user, username, bio: bio || "no bio", photo_url: photoUrl }
        localStorage.setItem("auth_user", JSON.stringify(updatedUser))
      }

      showSuccessNotification("Berhasil", "Profil berhasil diperbarui")
      onClose()
    } catch (err) {
      console.error("Error updating profile:", err)
      showErrorNotification("Gagal", "Terjadi kesalahan saat memperbarui profil")
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // UI — TIDAK DIUBAH SAMA SEKALI
  // ============================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="edit-profile-modal-description">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Foto Profil</label>
            <div className="flex flex-col items-center gap-3">
              {photoUrl ? (
                <img
                  src={photoUrl || "/placeholder.svg"}
                  alt="Foto Profil"
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    console.log("[v0] Image failed to load:", photoUrl)
                    e.currentTarget.src = "/default-profile-avatar.png"
                  }}
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
                  <Button onClick={handleDeletePhoto} disabled={photoLoading} variant="destructive" size="sm">
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
              <p className="text-xs text-muted-foreground text-center">Max 512KB, JPG/PNG/WebP</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              disabled={loading}
              maxLength={500}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 resize-none"
              rows={3}
              placeholder="Tulis bio Anda..."
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password Baru (Opsional)</label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>
            <input
              type="password"
              placeholder="Konfirmasi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 bg-transparent">
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
