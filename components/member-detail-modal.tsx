"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserIcon } from "lucide-react"

interface User {
  nis: string
  username: string
  full_name: string
  position: string
  bio: string
  photo_url: string | null
  role: string
}

interface MemberDetailModalProps {
  member: User
  isOpen: boolean
  onClose: () => void
}

export function MemberDetailModal({ member, isOpen, onClose }: MemberDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Anggota</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Photo */}
          <div className="flex justify-center">
            {member.photo_url ? (
              <img
                src={member.photo_url || "/placeholder.svg"}
                alt={member.full_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <UserIcon size={40} className="text-muted-foreground" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="text-center">
            <h3 className="text-lg font-bold">{member.full_name}</h3>
            <p className="text-sm text-muted-foreground">{member.position}</p>
          </div>

          {/* Details */}
          <div className="space-y-3 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="font-medium text-sm">{member.username}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">NIS</p>
              <p className="font-medium text-sm">{member.nis}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Jabatan</p>
              <p className="font-medium text-sm">{member.position}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Bio</p>
              <p className="font-medium text-sm">{member.bio || "no bio"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="font-medium text-sm capitalize">{member.role}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
