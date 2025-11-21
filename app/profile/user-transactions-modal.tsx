"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionCard } from "@/components/transaction-card"
import { useAuth } from "@/lib/auth-context"

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

const mockTransactions: Transaction[] = [
  {
    id: 1,
    nis: "0002",
    full_name: "M. Hanan Izzaturrofan",
    username: "siswa1",
    nominal: 5000,
    description: "Pembayaran Kas Mingguan",
    type: "pemasukan",
    status: "approved",
    created_at: new Date("2024-11-03"),
  },
  {
    id: 2,
    nis: "0002",
    full_name: "M. Hanan Izzaturrofan",
    username: "siswa1",
    nominal: 5000,
    description: "Pembayaran Kas Mingguan",
    type: "pemasukan",
    status: "approved",
    created_at: new Date("2024-11-03"),
  },
  {
    id: 3,
    nis: "0002",
    full_name: "M. Hanan Izzaturrofan",
    username: "siswa1",
    nominal: 5000,
    description: "Pembayaran Kas Mingguan",
    type: "pemasukan",
    status: "approved",
    created_at: new Date("2024-11-03"),
  },
]

interface UserTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserTransactionsModal({ isOpen, onClose }: UserTransactionsModalProps) {
  const { user } = useAuth()

  // Filter transactions for current user
  const userTransactions = mockTransactions.filter((t) => t.nis === user?.nis)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Laporan Transaksi Saya</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {userTransactions.length > 0 ? (
            userTransactions.map((transaction) => <TransactionCard key={transaction.id} transaction={transaction} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
