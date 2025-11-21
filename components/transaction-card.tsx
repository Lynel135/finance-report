"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/formatting"
import { TransactionDetailModal } from "./transaction-detail-modal"
import { Clock, User } from "lucide-react"

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

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const isIncome = transaction.type === "pemasukan"

  return (
    <>
      <Card
        onClick={() => setShowDetail(true)}
        className="p-4 border border-border cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <User size={14} />
              {transaction.username}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${isIncome ? "text-green-600" : "text-red-600"}`}>
              {isIncome ? "+" : "-"}
              {formatCurrency(transaction.nominal)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
              <Clock size={12} />
              {typeof transaction.created_at === "string"
                ? new Date(transaction.created_at).toLocaleDateString("id-ID")
                : transaction.created_at.toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>
      </Card>

      <TransactionDetailModal isOpen={showDetail} onClose={() => setShowDetail(false)} transaction={transaction} />
    </>
  )
}
