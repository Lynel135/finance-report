"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { LayoutGrid, BarChart3, Plus, User, Users } from "lucide-react"
import { useState } from "react"
import { TransactionModal } from "./transaction-modal"

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around py-4">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutGrid size={24} />
          <span className="text-xs">Dashboard</span>
        </Link>

        <Link
          href="/reports"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/reports") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart3 size={24} />
          <span className="text-xs">Laporan</span>
        </Link>

        <button
          onClick={() => setShowTransactionModal(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-lg text-white bg-primary"
        >
          <Plus size={28} />
          <span className="text-xs">Tambah</span>
        </button>

        <Link
          href="/members"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/members") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users size={24} />
          <span className="text-xs">Anggota</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User size={24} />
          <span className="text-xs">Profil</span>
        </Link>
      </div>

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        userId={user?.nis || ""}
        userRole={user?.role || "user"}
      />
    </>
  )
}
