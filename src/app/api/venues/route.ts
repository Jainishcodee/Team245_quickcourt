import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport")
    const city = searchParams.get("city")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Check if user is authenticated and get their role
    let userRole = null
    let userId = null
    
    try {
      const session = await auth()
      if (session?.user) {
        userRole = (session.user as any).role
        userId = (session.user as any).id
      }
    } catch (error) {
      // User not authenticated, continue as public user
    }

    // Build where clause
    const where: any = {
      OR: [
        { status: "approved" }, // Always show approved venues
        // Show pending venues only to their owners or admins
        ...(userRole === "FACILITY_OWNER" || userRole === "ADMIN" ? [
          { 
            status: "pending",
            ...(userRole === "FACILITY_OWNER" ? { ownerId: userId } : {})
          }
        ] : [])
      ]
    }

    if (sport) {
      where.facilitySports = {
        some: {
          sport: {
            name: {
              contains: sport,
              mode: "insensitive"
            }
          }
        }
      }
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive"
      }
    }

    // Fetch venues with related data
    const venues = await prisma.facility.findMany({
      where,
      include: {
        facilitySports: {
          include: {
            sport: true
          }
        },
        facilityAmenities: {
          include: {
            amenity: true
          }
        },
        photos: {
          where: {
            isPrimary: true
          },
          take: 1
        },
        courts: {
          take: 1,
          orderBy: {
            pricePerHour: "asc"
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    // Calculate average ratings and format data
    const formattedVenues = venues.map(venue => {
      const avgRating = venue.reviews.length > 0
        ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length
        : 0

      const startingPrice = venue.courts.length > 0
        ? venue.courts[0].pricePerHour
        : 500 // Default price

      return {
        id: venue.id,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        city: venue.address.split(',').pop()?.trim() || "Unknown",
        sports: venue.facilitySports.map(fs => fs.sport.name),
        amenities: venue.facilityAmenities.map(fa => fa.amenity.name),
        photoUrl: venue.photos[0]?.photoUrl || "/placeholder-venue.jpg",
        startingPrice: startingPrice,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: venue._count.reviews,
        createdAt: venue.createdAt,
        status: venue.status, // Include status for UI feedback
        isOwner: userRole === "FACILITY_OWNER" && venue.ownerId === userId
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.facility.count({ where })

    return NextResponse.json({
      venues: formattedVenues,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching venues:", error)
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    )
  }
} 