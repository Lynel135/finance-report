"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ProfileContent } from "./profile-content"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="pb-20">
        <ProfileContent />
      </div>
      <BottomNavigation />
    </ProtectedRoute>
  )
}
