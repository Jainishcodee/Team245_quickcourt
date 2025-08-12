import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendOtpEmail } from "@/lib/email"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "FACILITY_OWNER", "ADMIN"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: validatedData.email } 
    })
    
    if (existingUser) {
      return NextResponse.json({ 
        error: "User with this email already exists" 
      }, { status: 400 })
    }

    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    // Store OTP and user data in verification table
    await prisma.verification.create({
      data: {
        id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        identifier: validatedData.email,
        value: JSON.stringify({
          otp,
          userData: {
            fullName: validatedData.fullName,
            email: validatedData.email,
            password: validatedData.password,
            role: validatedData.role
          }
        }),
        expiresAt: otpExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Send OTP via email
    const emailResult = await sendOtpEmail(validatedData.email, otp, validatedData.fullName)
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error)
      // Still return success but log the email failure
    }

    return NextResponse.json({ 
      message: "OTP sent to your email. Please check and verify.",
      email: validatedData.email,
      // Remove this in production - only for testing
      otp: process.env.NODE_ENV === "development" ? otp : undefined
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.issues 
      }, { status: 400 })
    }
    console.error("Signup error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 