"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { BottomNavigation } from "@/components/bottom-navigation"
import { DashboardContent } from "./dashboard-content"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="pb-20">
        <DashboardContent />
      </div>
      <BottomNavigation />
    </ProtectedRoute>
  )
}
