import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email"

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(5, "OTP must be 5 digits"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = verifyOtpSchema.parse(body)

    // Find the verification record
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: validatedData.email,
        expiresAt: {
          gt: new Date() // OTP not expired
        }
      }
    })

    if (!verification) {
      return NextResponse.json({ 
        error: "OTP expired or not found. Please request a new one." 
      }, { status: 400 })
    }

    // Parse the stored data
    let storedData
    try {
      storedData = JSON.parse(verification.value)
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid verification data. Please sign up again." 
      }, { status: 400 })
    }

    // Verify OTP
    if (storedData.otp !== validatedData.otp) {
      return NextResponse.json({ 
        error: "Invalid OTP. Please try again." 
      }, { status: 400 })
    }

    // OTP is valid, create the user
    const userData = storedData.userData
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.fullName,
        role: userData.role,
        emailVerified: true, // Now verified
        isActive: true,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Create account
    await prisma.account.create({
      data: {
        id: `credentials_${user.id}`,
        accountId: user.id.toString(),
        providerId: "credentials",
        userId: user.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Send welcome email
    const welcomeEmailResult = await sendWelcomeEmail(userData.email, userData.fullName)
    
    if (!welcomeEmailResult.success) {
      console.error('Failed to send welcome email:', welcomeEmailResult.error)
      // Still continue with user creation
    }

    // Delete the verification record
    await prisma.verification.delete({
      where: { id: verification.id }
    })

    return NextResponse.json({ 
      message: "Email verified successfully! User account created.",
      userId: user.id
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.issues 
      }, { status: 400 })
    }
    console.error("OTP verification error:", error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 