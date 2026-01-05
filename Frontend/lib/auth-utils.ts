/**
 * Authentication utility functions for managing tokens and user data in localStorage
 */

export const AUTH_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const

/**
 * Store authentication data in localStorage
 */
export function setAuthData(accessToken: string, refreshToken?: string, user?: any) {
  if (typeof window === "undefined") return

  localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, accessToken)

  if (refreshToken) {
    localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken)
  }

  if (user) {
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user))
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN)
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN)
}

/**
 * Get user data from localStorage
 */
export function getUser(): any | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem(AUTH_KEYS.USER)
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData() {
  if (typeof window === "undefined") return

  localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(AUTH_KEYS.USER)
  localStorage.removeItem("know_rights_user_details") // Also clear user details from auth context
}

/**
 * Check if user is authenticated (has valid access token)
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}
