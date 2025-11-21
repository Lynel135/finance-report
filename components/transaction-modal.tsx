"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { showSuccessNotification, showErrorNotification } from "@/lib/notification"
import { logTransaction } from "@/lib/logger"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userRole: "admin" | "user"
  onTransactionAdded?: () => void
}

export function TransactionModal({ isOpen, onClose, userId, userRole, onTransactionAdded }: TransactionModalProps) {
  const [nominal, setNominal] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"pemasukan" | "pengeluaran">("pemasukan")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!nominal || !description) {
      showErrorNotification("Error", "Harap isi semua field")
      return
    }

    setLoading(true)

    const transactionData = {
      nis: userId,
      nominal: Number.parseFloat(nominal),
      description,
      type,
      status: userRole === "admin" ? "approved" : "pending",
      created_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from("transactions").insert([transactionData]).select()

      if (error) {
        console.error("Supabase error:", error)
        logTransaction({ ...transactionData, error: error.message })
        showErrorNotification("Gagal", "Tidak dapat menambahkan transaksi ke database")
        return
      }

      logTransaction(transactionData)

      if (userRole === "admin") {
        showSuccessNotification("Berhasil", "Transaksi telah ditambahkan dan langsung disetujui")
      } else {
        showSuccessNotification("Berhasil", "Transaksi telah ditambahkan dan menunggu persetujuan")
      }

      // Reset form and close modal
      setNominal("")
      setDescription("")
      setType("pemasukan")
      onClose()
      onTransactionAdded?.()
    } catch (error) {
      console.error("Error adding transaction:", error)
      showErrorNotification("Error", "Terjadi kesalahan saat menambahkan transaksi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nominal</label>
            <input
              type="number"
              placeholder="Nominal"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Keterangan</label>
            <textarea
              placeholder="Keterangan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Jenis</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pemasukan"
                  checked={type === "pemasukan"}
                  onChange={(e) => setType(e.target.value as "pemasukan" | "pengeluaran")}
                  disabled={loading}
                />
                <span>Pemasukan</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pengeluaran"
                  checked={type === "pengeluaran"}
                  onChange={(e) => setType(e.target.value as "pemasukan" | "pengeluaran")}
                  disabled={loading}
                />
                <span>Pengeluaran</span>
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
