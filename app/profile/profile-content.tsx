"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { UserIcon, BookOpen, Edit2, LogOut } from "lucide-react"
import { EditProfileModal } from "./edit-profile-modal"
import { UserTransactionsModal } from "./user-transactions-modal"

export function ProfileContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTransactionsModal, setShowTransactionsModal] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <main className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
      </div>

      {/* Profile Avatar */}
      <div className="flex flex-col items-center py-8">
        {user?.photo_url ? (
          <img
            src={user.photo_url || "/placeholder.svg"}
            alt={user.full_name}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        ) : (
          <div className="w-24 h-24 bg-foreground rounded-full flex items-center justify-center mb-4">
            <UserIcon size={48} className="text-background" />
          </div>
        )}
        <h2 className="text-2xl font-bold text-center">{user?.full_name}</h2>
        <p className="text-muted-foreground text-center">{user?.position}</p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <UserIcon size={20} className="mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nama Lengkap</p>
              <p className="font-medium">{user?.full_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen size={20} className="mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Kelas/Jabatan</p>
              <p className="font-medium">{user?.position}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen size={20} className="mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">NIS</p>
              <p className="font-medium">{user?.nis}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen size={20} className="mt-1 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Bio</p>
              <p className="font-medium">{user?.bio || "no bio"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button onClick={() => setShowTransactionsModal(true)} className="w-full bg-primary hover:bg-primary/90">
          Lihat Laporan
        </Button>

        <Button onClick={() => setShowEditModal(true)} variant="outline" className="w-full">
          <Edit2 size={18} className="mr-2" />
          Edit Profil
        </Button>

        <Button onClick={handleLogout} variant="destructive" className="w-full">
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>

      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
      <UserTransactionsModal isOpen={showTransactionsModal} onClose={() => setShowTransactionsModal(false)} />
    </main>
  )
}
