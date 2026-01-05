const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: Record<string, any>
  requiresAuth?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = "GET", body, requiresAuth = false } = options

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      const token = this.getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (body && method !== "GET") {
      config.body = JSON.stringify(body)
    }

    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || `API Error: ${response.status}`)
      }

      return data as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("An unexpected error occurred")
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ access_token: string; refresh_token?: string; user: any }> {
    return this.request("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    })
  }

  async register(email: string, password: string, full_name: string): Promise<{ access_token: string; refresh_token?: string; user: any }> {
    return this.request("/api/v1/auth/signup", {
      method: "POST",
      body: { email, password, full_name },
    })
  }

  // Protected endpoints
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      requiresAuth: true,
    })
  }

  async post<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body,
      requiresAuth: true,
    })
  }

  async put<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
      requiresAuth: true,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      requiresAuth: true,
    })
  }
}

export const apiClient = new ApiClient(API_URL)
