"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowLeft, Mail, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [otp, setOtp] = useState(["", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (!email) {
      router.push("/auth/signup")
      return
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [email, router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 5) {
      toast.error("Please enter the complete 5-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
      })

      if (response.ok) {
        toast.success("Email verified successfully! Please sign in.")
        router.push("/auth/signin?message=Email verified successfully! Please sign in.")
      } else {
        const error = await response.json()
        toast.error(error.message || "Invalid OTP. Please try again.")
        // Clear OTP on error
        setOtp(["", "", "", "", ""])
        document.getElementById("otp-0")?.focus()
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast.success("New OTP sent to your email!")
        setCountdown(30)
        setOtp(["", "", "", "", ""])
        document.getElementById("otp-0")?.focus()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to resend OTP")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error("Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleEditEmail = () => {
    router.push("/auth/signup")
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/signup")}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign Up
          </Button>
        </div>

        {/* Main Card */}
        <Card className="w-full">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              QUICKCOURT
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-400 font-medium">
              VERIFY YOUR EMAIL
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Confirmation */}
            <div className="text-center">
              <p className="text-green-600 dark:text-green-400 text-sm">
                We've sent a code to your email:{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>

            {/* OTP Input Fields */}
            <div className="space-y-4">
              <Label htmlFor="otp-0" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter the 5-digit code
              </Label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-green-500 focus:ring-green-500"
                    placeholder=""
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.join("").length !== 5}
              className="w-full bg-white text-gray-900 border-2 border-white hover:bg-gray-50 hover:border-gray-200 font-semibold py-3"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>

            {/* Action Links */}
            <div className="space-y-3 text-center text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{" "}
                </span>
                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isResending}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-3 w-3 inline mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend OTP (${countdown}s)`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>

              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Wrong email?{" "}
                </span>
                <button
                  onClick={handleEditEmail}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Email
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Check your spam folder if you don't see the email</p>
        </div>
      </div>
    </div>
  )
} 