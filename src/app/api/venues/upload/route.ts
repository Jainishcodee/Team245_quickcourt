import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "FACILITY_OWNER") {
      return NextResponse.json(
        { error: "Unauthorized. Only facility owners can upload venues." },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    
    // Extract form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const sportTypes = JSON.parse(formData.get("sportTypes") as string) as string[]
    const amenities = JSON.parse(formData.get("amenities") as string) as string[]
    const pricePerHour = formData.get("pricePerHour") as string
    const contactPhone = formData.get("contactPhone") as string
    const contactEmail = formData.get("contactEmail") as string
    const photos = formData.getAll("photos") as File[]

    // Validate required fields
    if (!name || !address || !city || sportTypes.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // For now, we'll store photos as base64 strings
    // In production, you'd upload to a cloud service like Cloudinary
    const photoUrls: string[] = []
    
    for (const photo of photos) {
      if (photo.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json(
          { error: "Photo size must be less than 5MB" },
          { status: 400 }
        )
      }
      
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = photo.type
      photoUrls.push(`data:${mimeType};base64,${base64}`)
    }

    // Create the facility
    const facility = await prisma.facility.create({
      data: {
        name,
        description: description || "",
        address,
        locationLat: null, // Will be added later with geocoding
        locationLng: null,
        status: "pending", // Requires admin approval
        ownerId: parseInt((session.user as any).id),
        adminComments: "Pending review",
      }
    })

    // Create sports for the facility
    for (const sportName of sportTypes) {
      // Check if sport exists, if not create it
      let sport = await prisma.sport.findUnique({
        where: { name: sportName }
      })
      
      if (!sport) {
        sport = await prisma.sport.create({
          data: { name: sportName }
        })
      }

      // Create facility-sport relationship
      await prisma.facilitySport.create({
        data: {
          facilityId: facility.id,
          sportId: sport.id
        }
      })
    }

    // Create amenities for the facility
    for (const amenityName of amenities) {
      // Check if amenity exists, if not create it
      let amenity = await prisma.amenity.findUnique({
        where: { name: amenityName }
      })
      
      if (!amenity) {
        amenity = await prisma.amenity.create({
          data: { name: amenityName }
        })
      }

      // Create facility-amenity relationship
      await prisma.facilityAmenity.create({
        data: {
          facilityId: facility.id,
          amenityId: amenity.id
        }
      })
    }

    // Create photos for the facility
    for (let i = 0; i < photoUrls.length; i++) {
      await prisma.facilityPhoto.create({
        data: {
          facilityId: facility.id,
          photoUrl: photoUrls[i],
          isPrimary: i === 0, // First photo is primary
          sortOrder: i,
          caption: `Venue photo ${i + 1}`
        }
      })
    }

    // Create a default court (you can expand this later)
    if (sportTypes.length > 0) {
      const firstSport = await prisma.sport.findUnique({
        where: { name: sportTypes[0] }
      })
      
      if (firstSport) {
        await prisma.court.create({
          data: {
            facilityId: facility.id,
            sportId: firstSport.id,
            name: `${name} - ${sportTypes[0]} Court`,
            pricePerHour: parseFloat(pricePerHour) || 500,
            isActive: true
          }
        })
      }
    }

    return NextResponse.json(
      { 
        message: "Venue uploaded successfully", 
        facilityId: facility.id,
        status: "pending"
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Venue upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 