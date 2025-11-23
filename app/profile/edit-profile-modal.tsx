"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { showSuccessNotification, showErrorNotification } from "@/lib/notification"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuth()
  const [username, setUsername] = useState(user?.username || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

      const updateData: any = { username }
      if (password) {
        updateData.password = password
      }

      const { error: updateError } = await supabase.from("users").update(updateData).eq("nis", user?.nis)

      if (updateError) {
        showErrorNotification("Gagal", "Tidak dapat memperbarui profil")
        return
      }

      // Update localStorage
      if (user) {
        const updatedUser = { ...user, username }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
