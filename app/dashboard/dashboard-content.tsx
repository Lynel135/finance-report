"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction-card"
import { formatCurrency } from "@/lib/formatting"
import { Wallet, TrendingDown, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
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

export function DashboardContent() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [loading, setLoading] = useState(true)

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
          // Map the data to flatten the users relationship
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
      setUserTransactions(transactions)
    } else {
      setUserTransactions(transactions.filter((t) => t.nis === user?.nis))
    }
  }, [user, transactions])

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
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Tidak ada transaksi yang menunggu</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
