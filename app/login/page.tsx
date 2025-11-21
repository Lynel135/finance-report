"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { showSuccessNotification, showErrorNotification } from "@/lib/notification"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [nisOrUsername, setNisOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/dashboard")
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const success = await login(nisOrUsername, password)
    if (success) {
      showSuccessNotification("Login Berhasil", "Selamat datang kembali!")
      router.push("/dashboard")
    } else {
      setError("NIS/Username atau password salah")
      showErrorNotification("Login Gagal", "NIS/Username atau password salah")
      setPassword("")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">SELAMAT DATANG</h1>
            <p className="text-muted-foreground">Masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama atau NIS</label>
              <input
                type="text"
                placeholder="Nama atau NIS"
                value={nisOrUsername}
                onChange={(e) => setNisOrUsername(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="text-destructive text-sm text-center">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Demo Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>User: siswa1 / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
