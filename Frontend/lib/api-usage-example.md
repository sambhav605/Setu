# API Client Usage Guide

This guide shows how to use the API client for making authenticated requests to the Nepal Justice Weaver backend.

## Backend API Information

- **Base URL:** `http://localhost:8000`
- **API Prefix:** `/api/v1`
- **Authentication:** Supabase Auth with JWT tokens

## Basic Setup

The API client is already configured and can be imported from `@/lib/api-client`:

```typescript
import { apiClient } from "@/lib/api-client"
import { setAuthData, getAccessToken, clearAuthData } from "@/lib/auth-utils"
```

## Authentication

### Register (Sign Up)
**Endpoint:** `POST /api/v1/auth/signup`

The registration now accepts only basic information:

```typescript
import { apiClient } from "@/lib/api-client"
import { setAuthData } from "@/lib/auth-utils"

try {
  const response = await apiClient.register(
    "john@example.com",      // email
    "securePassword123",      // password (min 6 characters)
    "John Doe"                // full_name
  )

  // Response: { access_token, refresh_token?, user }
  setAuthData(response.access_token, response.refresh_token, response.user)

  console.log("Registered successfully:", response.user)
} catch (error) {
  console.error("Registration failed:", error.message)
}
```

### Login
**Endpoint:** `POST /api/v1/auth/login`

```typescript
import { apiClient } from "@/lib/api-client"
import { setAuthData } from "@/lib/auth-utils"

try {
  const response = await apiClient.login(
    "john@example.com",
    "securePassword123"
  )

  // Store authentication data
  setAuthData(response.access_token, response.refresh_token, response.user)

  console.log("Logged in successfully:", response.user)
} catch (error) {
  console.error("Login failed:", error.message)
}
```

### Logout
```typescript
import { clearAuthData } from "@/lib/auth-utils"

// Clear all authentication data from localStorage
clearAuthData()

// Optionally redirect to login page
router.push("/login")
```

## Protected Features

These features require authentication (access token must be stored in localStorage).

### 1. Letter Generation
**Endpoint:** `POST /api/v1/letter/generate` (requires auth)

Generate legal letters based on user input:

```typescript
try {
  const response = await apiClient.post("/api/v1/letter/generate", {
    letterType: "complaint",
    recipientName: "District Court",
    subject: "Property Dispute",
    details: "Description of the legal matter..."
  })

  console.log("Generated letter:", response)
} catch (error) {
  console.error("Letter generation failed:", error.message)
}
```

### 2. Law Explanation Chatbot
**Endpoint:** `POST /api/v1/law-explanation/chat` (requires auth)

Get explanations about Nepali laws:

```typescript
try {
  const response = await apiClient.post("/api/v1/law-explanation/chat", {
    query: "What are my rights as a tenant in Nepal?",
    context: "rental agreement dispute"
  })

  console.log("Chatbot response:", response)
} catch (error) {
  console.error("Chatbot request failed:", error.message)
}
```

### 3. Bias Detection
**Endpoint:** `POST /api/v1/bias-detection/analyze` (requires auth)

Analyze legal documents or text for potential bias:

```typescript
try {
  const response = await apiClient.post("/api/v1/bias-detection/analyze", {
    text: "Legal document text to analyze for bias...",
    documentType: "court_decision"
  })

  console.log("Bias analysis:", response)
} catch (error) {
  console.error("Bias detection failed:", error.message)
}
```

## Generic Protected Requests

The API client provides generic methods for protected endpoints:

### GET Request
```typescript
try {
  const data = await apiClient.get("/api/v1/some-endpoint")
  console.log("Data:", data)
} catch (error) {
  console.error("Failed:", error.message)
}
```

### POST Request
```typescript
try {
  const result = await apiClient.post("/api/v1/some-endpoint", {
    field1: "value1",
    field2: "value2"
  })
  console.log("Result:", result)
} catch (error) {
  console.error("Failed:", error.message)
}
```

### PUT Request
```typescript
try {
  const updated = await apiClient.put("/api/v1/some-endpoint", {
    field: "updated value"
  })
  console.log("Updated:", updated)
} catch (error) {
  console.error("Failed:", error.message)
}
```

### DELETE Request
```typescript
try {
  const result = await apiClient.delete("/api/v1/some-endpoint")
  console.log("Deleted:", result)
} catch (error) {
  console.error("Failed:", error.message)
}
```

## Using in React Components

### Example: Fetching Data on Component Mount
```typescript
"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.get("/users/me")
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return <div>Welcome, {profile?.name}</div>
}
```

### Example: Form Submission
```typescript
"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"

export default function CreateQueryForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await apiClient.post("/legal-queries", {
        title,
        description
      })
      console.log("Query created:", result)
      // Reset form or redirect
      setTitle("")
      setDescription("")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  )
}
```

## Authentication Utilities

The `@/lib/auth-utils` module provides helper functions for managing authentication:

### Store Authentication Data
```typescript
import { setAuthData } from "@/lib/auth-utils"

// Store access token, refresh token, and user info
setAuthData(accessToken, refreshToken, userData)
```

### Get Access Token
```typescript
import { getAccessToken } from "@/lib/auth-utils"

const token = getAccessToken()
if (token) {
  console.log("User is authenticated")
}
```

### Get Refresh Token
```typescript
import { getRefreshToken } from "@/lib/auth-utils"

const refreshToken = getRefreshToken()
```

### Get User Data
```typescript
import { getUser } from "@/lib/auth-utils"

const user = getUser()
if (user) {
  console.log("User email:", user.email)
}
```

### Check Authentication Status
```typescript
import { isAuthenticated } from "@/lib/auth-utils"

if (isAuthenticated()) {
  // User has valid access token
  // Allow access to protected features
} else {
  // Redirect to login
  router.push("/login")
}
```

### Clear Authentication (Logout)
```typescript
import { clearAuthData } from "@/lib/auth-utils"

// Remove all auth data from localStorage
clearAuthData()
```

## Token Storage Details

Authentication data is stored in localStorage with these keys:
- `access_token` - JWT access token from Supabase
- `refresh_token` - JWT refresh token (optional)
- `user` - JSON stringified user object

The access token is automatically:
- Stored when you register or login
- Included in all authenticated requests with the `Authorization: Bearer <token>` header
- Retrieved from localStorage for each protected request

## Error Handling

The API client throws errors with meaningful messages:
- **Network errors**: Connection failures
- **API errors**: Returns the `detail` field from backend response
- **Validation errors**: Invalid input or missing required fields
- **Authentication errors**: Invalid or expired token (401)

Always wrap API calls in try-catch blocks to handle errors gracefully:

```typescript
try {
  const result = await apiClient.post("/api/v1/some-endpoint", data)
} catch (error) {
  if (error instanceof Error) {
    // Display user-friendly error message
    toast.error(error.message)
  }
}
```

## Environment Variables

Set the backend URL in your `.env.local` file:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

If not set, it defaults to `http://localhost:8000`.

## Summary

**Registration Flow:**
1. User fills out registration form with name, email, password
2. Form validates password match and minimum length
3. Call `apiClient.register(email, password, name)`
4. Store tokens with `setAuthData(access_token, refresh_token, user)`
5. Redirect to dashboard

**Login Flow:**
1. User enters email and password
2. Call `apiClient.login(email, password)`
3. Store tokens with `setAuthData(access_token, refresh_token, user)`
4. Redirect to dashboard

**Using Protected Features:**
1. Check authentication with `isAuthenticated()`
2. Make API calls to letter generation, chatbot, or bias detection endpoints
3. API client automatically includes the Bearer token
4. Handle success/error responses appropriately
