"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ReportsContent } from "./reports-content"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <div className="pb-20">
        <ReportsContent />
      </div>
      <BottomNavigation />
    </ProtectedRoute>
  )
}
