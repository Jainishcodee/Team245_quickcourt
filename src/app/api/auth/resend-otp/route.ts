import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { sendOtpEmail } from "@/lib/email"

const resendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resendOtpSchema.parse(body)

    // Check if there's an existing verification record
    const existingVerification = await prisma.verification.findFirst({
      where: {
        identifier: validatedData.email,
      }
    })

    // Generate new 5-digit OTP
    const newOtp = Math.floor(10000 + Math.random() * 90000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    if (existingVerification) {
      // Update existing verification with new OTP
      await prisma.verification.update({
        where: { id: existingVerification.id },
        data: {
          value: newOtp,
          expiresAt: otpExpiry,
          updatedAt: new Date(),
        }
      })
    } else {
      // Create new verification record
      await prisma.verification.create({
        data: {
          id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          identifier: validatedData.email,
          value: newOtp,
          expiresAt: otpExpiry,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
    }

    // Send OTP via email
    const emailResult = await sendOtpEmail(validatedData.email, newOtp, "User")
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error)
      // Still return success but log the email failure
    }

    return NextResponse.json({ 
      message: "New OTP sent to your email.",
      // Remove this in production - only for testing
      otp: process.env.NODE_ENV === "development" ? newOtp : undefined
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.issues 
      }, { status: 400 })
    }
    console.error("Resend OTP error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 