"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionCard } from "@/components/transaction-card"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

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

interface UserTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserTransactionsModal({ isOpen, onClose }: UserTransactionsModalProps) {
  const { user } = useAuth()
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserTransactions = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("transactions")
          .select(`
            id,
            nis,
            nominal,
            description,
            type,
            status,
            created_at,
            users (full_name, username)
          `)
          .eq("nis", user?.nis)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching user transactions:", error)
          setUserTransactions([])
        } else {
          const mappedData = (data || []).map((transaction: any) => ({
            id: transaction.id,
            nis: transaction.nis,
            full_name: transaction.users?.full_name || "",
            username: transaction.users?.username || "",
            nominal: transaction.nominal,
            description: transaction.description,
            type: transaction.type,
            status: transaction.status,
            created_at: transaction.created_at,
          }))
          setUserTransactions(mappedData)
        }
      } catch (error) {
        console.error("Error:", error)
        setUserTransactions([])
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && user) {
      fetchUserTransactions()
    }
  }, [isOpen, user])

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
            <p className="text-center text-muted-foreground py-8">{loading ? "Memuat..." : "Belum ada transaksi"}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
