"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  isFirstTime: boolean
  details?: {
    nid?: string
    age?: number
    education?: string
    salary?: string
    disability?: { hasDisability: boolean; type?: string }
    address?: { province: string; district: string; municipality: string; ward: string }
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
  updateUserDetails: (details: User["details"]) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("know_rights_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string) => {
    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      role: "user",
      isFirstTime: true,
    }
    setUser(mockUser)
    localStorage.setItem("know_rights_user", JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("know_rights_user")
  }

  const updateUserDetails = async (details: User["details"]) => {
    if (!user) return
    const updatedUser = { ...user, details, isFirstTime: false }
    setUser(updatedUser)
    localStorage.setItem("know_rights_user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserDetails }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
