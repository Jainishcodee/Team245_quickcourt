"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { signIn, signOut } from "next-auth/react"

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  const testUsers = [
    { email: "admin@quickcourt.com", password: "admin123", role: "Admin" },
    { email: "owner@quickcourt.com", password: "owner123", role: "Facility Owner" },
    { email: "user@quickcourt.com", password: "user123", role: "Regular User" },
  ]

  const handleTestLogin = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        alert(`Login failed: ${result.error}`)
      } else {
        alert("Login successful! Check the session data below.")
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        {/* Session Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Authenticated:</strong> {session ? "Yes" : "No"}</p>
            {session && (
              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-medium mb-2">Session Data:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Test Login Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testUsers.map((user) => (
              <div key={user.email} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{user.role}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Email: {user.email}<br />
                  Password: {user.password}
                </p>
                <Button 
                  onClick={() => handleTestLogin(user.email, user.password)}
                  className="w-full"
                >
                  Login as {user.role}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            {session ? (
              <Button onClick={() => signOut()} variant="outline">
                Sign Out
              </Button>
            ) : (
              <p className="text-gray-600">Sign in with one of the test accounts above</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
} 