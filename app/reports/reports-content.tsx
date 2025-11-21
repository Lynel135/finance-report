"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionCard } from "@/components/transaction-card"
import { formatCurrency } from "@/lib/formatting"
import { useState, useEffect } from "react"
import { Wallet, TrendingDown, TrendingUp } from "lucide-react"
import * as XLSX from "xlsx"
import { showSuccessNotification, showErrorNotification } from "@/lib/notification"
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

export function ReportsContent() {
  const { user } = useAuth()
  const [filterType, setFilterType] = useState<"all" | "pemasukan" | "pengeluaran">("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
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
          .eq("status", "approved")
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

  const approvedTransactions = transactions

  const totalIncome =
    approvedTransactions.filter((t) => t.type === "pemasukan").reduce((sum, t) => sum + t.nominal, 0) || 0
  const totalExpense =
    approvedTransactions.filter((t) => t.type === "pengeluaran").reduce((sum, t) => sum + t.nominal, 0) || 0
  const totalBalance = totalIncome - totalExpense

  const filteredTransactions =
    filterType === "all" ? approvedTransactions : approvedTransactions.filter((t) => t.type === filterType)

  const exportToExcel = (type: "pemasukan" | "pengeluaran" | "all") => {
    try {
      let data = approvedTransactions

      if (type !== "all") {
        data = data.filter((t) => t.type === type)
      }

      const excelData = data.map((t) => ({
        "Nama Lengkap": t.full_name,
        Username: t.username,
        Nominal: t.nominal,
        Keterangan: t.description,
        Tanggal: new Date(t.created_at).toLocaleDateString("id-ID"),
      }))

      const totalNominal = data.reduce((sum, t) => sum + t.nominal, 0) || 0
      excelData.push({
        "Nama Lengkap": "",
        Username: "TOTAL",
        Nominal: totalNominal,
        Keterangan: "",
        Tanggal: "",
      })

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan")

      const fileName = `Laporan-${type}-${new Date().toLocaleDateString("id-ID")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      showSuccessNotification("Berhasil", `Laporan ${type} berhasil diexport`)
    } catch (error) {
      console.error("Export error:", error)
      showErrorNotification("Gagal", "Tidak dapat mengexport file Excel")
    }
  }

  return (
    <main className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laporan</h1>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
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

        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pemasukan</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="text-success" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => setFilterType("pengeluaran")}
          className={`w-full ${
            filterType === "pengeluaran"
              ? "bg-destructive hover:bg-destructive/90 text-white"
              : "bg-destructive/20 hover:bg-destructive/30 text-destructive"
          }`}
        >
          Lihat Data Pengeluaran
        </Button>

        <Button
          onClick={() => setFilterType("pemasukan")}
          className={`w-full ${
            filterType === "pemasukan"
              ? "bg-success hover:bg-success/90 text-white"
              : "bg-success/20 hover:bg-success/30 text-success"
          }`}
        >
          Lihat Data Pemasukan
        </Button>

        <Button
          onClick={() => setFilterType("all")}
          className={`w-full ${
            filterType === "all"
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-primary/20 hover:bg-primary/30 text-primary"
          }`}
        >
          Lihat Data Gabungan
        </Button>
      </div>

      {/* Transaction List with Scroll */}
      <div>
        <h2 className="text-xl font-bold mb-4">Riwayat</h2>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Tidak ada transaksi</p>
          )}
        </div>
      </div>

      {/* Export Button */}
      <Button
        onClick={() =>
          exportToExcel(filterType === "pemasukan" ? "pemasukan" : filterType === "pengeluaran" ? "pengeluaran" : "all")
        }
        className="w-full bg-success hover:bg-success/90 text-white"
      >
        Export To Excel
      </Button>
    </main>
  )
}
