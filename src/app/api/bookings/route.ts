import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Fetch user bookings with related data
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId
      },
      include: {
        court: {
          include: {
            facility: {
              include: {
                photos: {
                  where: {
                    isPrimary: true
                  },
                  take: 1
                }
              }
            },
            sport: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    // Format the bookings for the frontend
    const formattedBookings = bookings.map(booking => {
      const startTime = booking.startTime.toTimeString().slice(0, 5) // HH:MM format
      const endTime = new Date(booking.startTime.getTime() * 60 * 60 * 1000)
        .toTimeString().slice(0, 5)

      return {
        id: booking.id,
        venueName: booking.court.facility.name,
        sport: booking.court.sport.name,
        court: booking.court.name,
        date: booking.startTime.toISOString().split('T')[0], // YYYY-MM-DD format
        time: `${startTime}-${endTime}`,
        // duration: `${booking.duration} hour${booking.duration > 1 ? 's' : ''}`,
        // amount: Number(booking.totalAmount),
        status: booking.status.toLowerCase(),
        venueImage: booking.court.facility.photos[0]?.photoUrl || "/placeholder-venue.jpg",
        createdAt: booking.createdAt,
        bookingDate: booking.startTime
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.booking.count({
      where: {
        userId: userId
      }
    })

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}