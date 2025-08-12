import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const venueId = params.id

    if (!venueId) {
      return NextResponse.json(
        { error: "Venue ID is required" },
        { status: 400 }
      )
    }

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

    // Build where clause - only show approved venues to public users
    const where: any = {
      id: venueId,
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

    // Fetch venue with all related data
    const venue = await prisma.facility.findFirst({
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
          orderBy: [
            { isPrimary: "desc" },
            { createdAt: "asc" }
          ]
        },
        courts: {
          orderBy: {
            pricePerHour: "asc"
          },
          include: {
            sport: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 10 // Limit to 10 most recent reviews
        },
        owner: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    })

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found or access denied" },
        { status: 404 }
      )
    }

    // Calculate average rating
    const avgRating = venue.reviews.length > 0
      ? venue.reviews.reduce((sum, review) => sum + review.rating, 0) / venue.reviews.length
      : 0

    // Get starting price from courts
    const startingPrice = venue.courts.length > 0
      ? Math.min(...venue.courts.map(court => court.pricePerHour.toNumber()))
      : 500 // Default price

    // Format the response
    const formattedVenue = {
      id: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      city: venue.address.split(',').pop()?.trim() || "Unknown",
      phone: venue.owner?.phone || null,
      email: venue.owner?.email || null,
      sports: venue.facilitySports.map(fs => fs.sport.name),
      amenities: venue.facilityAmenities.map(fa => fa.amenity.name),
      photos: venue.photos.map(photo => ({
        id: photo.id,
        photoUrl: photo.photoUrl,
        isPrimary: photo.isPrimary
      })),
      startingPrice: startingPrice,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: venue._count.reviews,
      operatingHours: "7:00 AM - 11:00 PM", // Default operating hours
      courts: venue.courts.map(court => ({
        id: court.id,
        name: court.name,
        pricePerHour: court.pricePerHour,
        sport: court.sport?.name || "General"
      })),
      reviews: venue.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.user?.name || "Anonymous",
        createdAt: review.createdAt.toISOString()
      })),
      status: venue.status,
      isOwner: userRole === "FACILITY_OWNER" && venue.ownerId === userId,
      createdAt: venue.createdAt
    }

    return NextResponse.json(formattedVenue)

  } catch (error) {
    console.error("Error fetching venue details:", error)
    return NextResponse.json(
      { error: "Failed to fetch venue details" },
      { status: 500 }
    )
  }
}