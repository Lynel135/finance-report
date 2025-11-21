"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userRole: "admin" | "user"
}

export function TransactionModal({ isOpen, onClose, userId, userRole }: TransactionModalProps) {
  const [nominal, setNominal] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"pemasukan" | "pengeluaran">("pemasukan")

  const handleSave = async () => {
    if (!nominal || !description) {
      alert("Harap isi semua field")
      return
    }

    const transactionData = {
      nis: userId,
      nominal: Number.parseFloat(nominal),
      description,
      type,
      status: userRole === "admin" ? "approved" : "pending",
      created_at: new Date(),
    }

    // TODO: Implement API call to save transaction
    console.log("Transaction data:", transactionData)

    // Reset form and close modal
    setNominal("")
    setDescription("")
    setType("pemasukan")
    onClose()
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
                />
                <span>Pemasukan</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pengeluaran"
                  checked={type === "pengeluaran"}
                  onChange={(e) => setType(e.target.value as "pemasukan" | "pengeluaran")}
                />
                <span>Pengeluaran</span>
              </label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
