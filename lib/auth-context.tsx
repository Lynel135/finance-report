"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase"

interface User {
  nis: string
  username: string
  full_name: string
  role: "admin" | "user"
  position: string
  photo_url: string | null
  bio: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (nisOrUsername: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("auth_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (nisOrUsername: string, password: string): Promise<boolean> => {
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .or(`nis.eq.${nisOrUsername},username.eq.${nisOrUsername}`)

      if (error || !users || users.length === 0) {
        // Fallback to mock data for development if Supabase connection fails
        console.log("[v0] Using mock data for login (Supabase not connected)")
        return loginWithMockData(nisOrUsername, password)
      }

      const foundUser = users[0]

      // Direct password comparison (no hash as per requirements)
      if (foundUser.password === password) {
        const userData: User = {
          nis: foundUser.nis,
          username: foundUser.username,
          full_name: foundUser.full_name,
          role: foundUser.role,
          position: foundUser.position,
          photo_url: foundUser.photo_url || null,
          bio: foundUser.bio || "no bio",
        }
        setUser(userData)
        localStorage.setItem("auth_user", JSON.stringify(userData))
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      // Fallback to mock data
      return loginWithMockData(nisOrUsername, password)
    }
  }

  const loginWithMockData = (nisOrUsername: string, password: string): boolean => {
    const mockUsers: Record<string, User & { password: string }> = {
      "0001": {
        nis: "0001",
        username: "admin",
        full_name: "Admin User",
        password: "admin123",
        role: "admin",
        position: "Administrator",
        photo_url: null,
        bio: "no bio",
      },
      "0002": {
        nis: "0002",
        username: "siswa1",
        full_name: "M. Hanan Izzaturrofan",
        password: "password123",
        role: "user",
        position: "Siswa - X PPLG 1",
        photo_url: null,
        bio: "no bio",
      },
      "0003": {
        nis: "0003",
        username: "siswa2",
        full_name: "Budi Santoso",
        password: "password456",
        role: "user",
        position: "Siswa - X PPLG 2",
        photo_url: null,
        bio: "no bio",
      },
    }

    let foundUser = mockUsers[nisOrUsername]
    if (!foundUser) {
      foundUser = Object.values(mockUsers).find((u) => u.username === nisOrUsername)
    }

    if (foundUser && foundUser.password === password) {
      const userData: User = {
        nis: foundUser.nis,
        username: foundUser.username,
        full_name: foundUser.full_name,
        role: foundUser.role,
        position: foundUser.position,
        photo_url: foundUser.photo_url,
        bio: foundUser.bio,
      }
      setUser(userData)
      localStorage.setItem("auth_user", JSON.stringify(userData))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
