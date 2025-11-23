"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction-card"
import { formatCurrency } from "@/lib/formatting"
import { Wallet, TrendingDown, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { showSuccessNotification, showErrorNotification } from "@/lib/notification"

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

export function DashboardContent() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [approvalLoading, setApprovalLoading] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
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
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching transactions:", error)
          setTransactions([])
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
          setTransactions(mappedData)
          setPendingTransactions(mappedData.filter((t) => t.status === "pending"))
        }
      } catch (error) {
        console.error("Error:", error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    if (user?.role === "admin") {
      setUserTransactions(transactions.filter((t) => t.status === "approved" || t.nis === user?.nis))
    } else {
      setUserTransactions(
        transactions.filter((t) => t.status === "approved" || (t.status === "pending" && t.nis === user?.nis)),
      )
    }
  }, [user, transactions])

  const handleApproveTransaction = async (transactionId: number) => {
    try {
      setApprovalLoading(true)
      const { error } = await supabase.from("transactions").update({ status: "approved" }).eq("id", transactionId)

      if (error) {
        showErrorNotification("Gagal", "Tidak dapat menyetujui transaksi")
      } else {
        showSuccessNotification("Berhasil", "Transaksi telah disetujui")
        // Refresh pending transactions
        const { data } = await supabase
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
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (data) {
          const mappedData = data.map((transaction: any) => ({
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
          setPendingTransactions(mappedData)
        }
      }
    } catch (error) {
      showErrorNotification("Gagal", "Terjadi kesalahan saat menyetujui transaksi")
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleRejectTransaction = async (transactionId: number) => {
    try {
      setApprovalLoading(true)
      const { error } = await supabase.from("transactions").update({ status: "rejected" }).eq("id", transactionId)

      if (error) {
        showErrorNotification("Gagal", "Tidak dapat menolak transaksi")
      } else {
        showSuccessNotification("Berhasil", "Transaksi telah ditolak dan akan dihapus dalam 1 hari")
        // Refresh pending transactions
        const { data } = await supabase
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
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (data) {
          const mappedData = data.map((transaction: any) => ({
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
          setPendingTransactions(mappedData)
        }
      }
    } catch (error) {
      showErrorNotification("Gagal", "Terjadi kesalahan saat menolak transaksi")
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleApproveAll = async () => {
    try {
      setApprovalLoading(true)
      const { error } = await supabase.from("transactions").update({ status: "approved" }).eq("status", "pending")

      if (error) {
        showErrorNotification("Gagal", "Tidak dapat menyetujui semua transaksi")
      } else {
        showSuccessNotification("Berhasil", `${pendingTransactions.length} transaksi telah disetujui`)
        setPendingTransactions([])
      }
    } catch (error) {
      showErrorNotification("Gagal", "Terjadi kesalahan saat menyetujui semua transaksi")
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleRejectAll = async () => {
    try {
      setApprovalLoading(true)
      const { error } = await supabase.from("transactions").update({ status: "rejected" }).eq("status", "pending")

      if (error) {
        showErrorNotification("Gagal", "Tidak dapat menolak semua transaksi")
      } else {
        showSuccessNotification("Berhasil", `${pendingTransactions.length} transaksi telah ditolak`)
        setPendingTransactions([])
      }
    } catch (error) {
      showErrorNotification("Gagal", "Terjadi kesalahan saat menolak semua transaksi")
    } finally {
      setApprovalLoading(false)
    }
  }

  const totalIncome =
    transactions
      .filter((t) => t.type === "pemasukan" && t.status === "approved")
      .reduce((sum, t) => sum + t.nominal, 0) || 0

  const totalExpense =
    transactions
      .filter((t) => t.type === "pengeluaran" && t.status === "approved")
      .reduce((sum, t) => sum + t.nominal, 0) || 0

  const totalBalance = totalIncome - totalExpense
  const displayedTransactions = showAllTransactions ? userTransactions : userTransactions.slice(0, 4)

  return (
    <main className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Halo, {user?.full_name}</p>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="text-primary" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pengeluaran</p>
                <p className="text-3xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full">
                <TrendingDown className="text-destructive" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Riwayat Transaksi</h2>
        <div className={`space-y-3 ${showAllTransactions ? "max-h-96 overflow-y-auto pr-2" : ""}`}>
          {displayedTransactions.length > 0 ? (
            displayedTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Tidak ada transaksi</p>
          )}
        </div>

        {userTransactions.length > 4 && (
          <Button
            onClick={() => setShowAllTransactions(!showAllTransactions)}
            variant="outline"
            className="w-full mt-4 gap-2"
          >
            {showAllTransactions ? (
              <>
                <ChevronUp size={18} />
                Tutup
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                Tampilkan Lebih Banyak
              </>
            )}
          </Button>
        )}
      </div>

      {/* Admin Approval Panel */}
      {user?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTransactions.length > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApproveAll}
                  disabled={approvalLoading}
                  className="flex-1 gap-2 bg-success hover:bg-success/90"
                >
                  <Check size={18} />
                  Setujui Semua
                </Button>
                <Button
                  onClick={handleRejectAll}
                  disabled={approvalLoading}
                  className="flex-1 gap-2 bg-destructive hover:bg-destructive/90"
                >
                  <X size={18} />
                  Tolak Semua
                </Button>
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {pendingTransactions.length > 0 ? (
                pendingTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-3 border rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.full_name} (@{transaction.username})
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${transaction.type === "pemasukan" ? "text-success" : "text-destructive"}`}
                      >
                        {transaction.type === "pemasukan" ? "+" : "-"} Rp {transaction.nominal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApproveTransaction(transaction.id)}
                        disabled={approvalLoading}
                        size="sm"
                        className="flex-1 gap-1 bg-success hover:bg-success/90"
                      >
                        <Check size={16} />
                        Setujui
                      </Button>
                      <Button
                        onClick={() => handleRejectTransaction(transaction.id)}
                        disabled={approvalLoading}
                        size="sm"
                        className="flex-1 gap-1 bg-destructive hover:bg-destructive/90"
                      >
                        <X size={16} />
                        Tolak
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Tidak ada transaksi yang menunggu</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
