"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency, formatDateTimeIndonesia } from "@/lib/formatting"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: number
  nis: string
  full_name: string
  username: string
  nominal: number
  description: string
  type: "pemasukan" | "pengeluaran"
  status: "pending" | "approved" | "rejected"
  created_at: string | Date
}

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
  const createdDate =
    typeof transaction.created_at === "string" ? new Date(transaction.created_at) : transaction.created_at

  const statusColor =
    transaction.status === "approved"
      ? "bg-green-100 text-green-800"
      : transaction.status === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Nama Lengkap</label>
            <p className="font-medium">{transaction.full_name}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Username</label>
            <p className="font-medium">{transaction.username}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Nominal</label>
            <p className="font-medium text-lg">{formatCurrency(transaction.nominal)}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Keterangan</label>
            <p className="font-medium">{transaction.description}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Waktu dan Tanggal</label>
            <p className="font-medium">{formatDateTimeIndonesia(createdDate)}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <Badge className={`mt-1 ${statusColor}`}>{transaction.status}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
