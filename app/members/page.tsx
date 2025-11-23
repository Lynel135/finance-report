"use client"
import { ProtectedRoute } from "@/components/protected-route"
import { MembersContent } from "./members-content"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function MembersPage() {
  return (
    <ProtectedRoute>
      <div className="pb-32">
        <MembersContent />
      </div>
      <BottomNavigation />
    </ProtectedRoute>
  )
}
