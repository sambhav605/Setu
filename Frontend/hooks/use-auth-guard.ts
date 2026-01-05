"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-utils"

/**
 * Hook to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 *
 * @param redirectTo - Optional path to redirect to after login (default: current page)
 * @returns Object with loading state and authenticated status
 */
export function useAuthGuard(redirectTo?: string) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated()

      if (!authenticated) {
        // Build redirect URL with return path
        const returnPath = redirectTo || window.location.pathname
        const loginUrl = `/login?redirect=${encodeURIComponent(returnPath)}`
        router.push(loginUrl)
      } else {
        setIsAuth(true)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router, redirectTo])

  return { isLoading, isAuthenticated: isAuth }
}
