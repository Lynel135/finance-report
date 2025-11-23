"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { UserIcon } from "lucide-react"
import { MemberDetailModal } from "@/components/member-detail-modal"

interface User {
  nis: string
  username: string
  full_name: string
  position: string
  bio: string
  photo_url: string | null
  role: string
}

export function MembersContent() {
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select("nis, username, full_name, position, bio, photo_url, role")
        .order("full_name")

      if (error) {
        console.error("Error fetching members:", error)
        return
      }

      setMembers(data || [])
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberClick = (member: User) => {
    setSelectedMember(member)
    setShowDetailModal(true)
  }

  if (loading) {
    return (
      <main className="p-4 space-y-6">
        <h1 className="text-3xl font-bold">Anggota</h1>
        <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
      </main>
    )
  }

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">Anggota</h1>

      {members.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Tidak ada anggota</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {members.map((member) => (
            <button key={member.nis} onClick={() => handleMemberClick(member)} className="text-left">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <CardContent className="p-4">
                  {/* Member Photo */}
                  <div className="flex justify-center mb-3">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url || "/placeholder.svg"}
                        alt={member.full_name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <UserIcon size={32} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <h3 className="font-semibold text-sm text-center line-clamp-2">{member.full_name}</h3>
                  <p className="text-xs text-muted-foreground text-center">{member.position}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {selectedMember && (
        <MemberDetailModal member={selectedMember} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
      )}
    </main>
  )
}
