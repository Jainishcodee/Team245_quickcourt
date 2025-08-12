"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Wifi, 
  Car, 
  Shield, 
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Phone,
  Mail
} from "lucide-react"

interface Venue {
  id: string
  name: string
  description: string
  address: string
  city: string
  phone?: string
  email?: string
  sports: string[]
  amenities: string[]
  photos: { id: string; photoUrl: string; isPrimary: boolean }[]
  startingPrice: number
  rating: number
  reviewCount: number
  operatingHours: string
  courts: { id: string; name: string; pricePerHour: number; sport: string }[]
  reviews: { id: string; rating: number; comment: string; userName: string; createdAt: string }[]
}

const amenityIcons: { [key: string]: any } = {
  'Parking': Car,
  'WiFi': Wifi,
  'CCTV Surveillance': Shield,
  'Restroom': Users,
  'Centrally Air Conditioned Hall': Clock,
  'Seating Arrangement': Users,
  'Library': Users
}

export default function VenueDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(`/api/venues/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setVenue(data)
        } else {
          router.push('/venues')
        }
      } catch (error) {
        console.error('Error fetching venue:', error)
        router.push('/venues')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchVenue()
    }
  }, [params.id, router])

  const nextPhoto = () => {
    if (venue?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % venue.photos.length)
    }
  }

  const prevPhoto = () => {
    if (venue?.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + venue.photos.length) % venue.photos.length)
    }
  }

  const handleBookVenue = () => {
    router.push(`/bookings/new?venueId=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venue details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h2>
            <p className="text-gray-600 mb-4">The venue you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/venues')}>
              Back to Venues
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venues
        </Button>
      </div>

      {/* Photo Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
          {/* Main Photo */}
          <motion.div 
            className="lg:col-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowGallery(true)}
          >
            <img
              src={venue.photos[currentPhotoIndex]?.photoUrl || "/placeholder-venue.jpg"}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {venue.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </motion.div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 gap-4">
            {venue.photos.slice(1, 5).map((photo, index) => (
              <motion.div
                key={photo.id}
                className="relative rounded-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setCurrentPhotoIndex(index + 1)
                  setShowGallery(true)
                }}
              >
                <img
                  src={photo.photoUrl}
                  alt={`${venue.name} photo ${index + 2}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                {index === 3 && venue.photos.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{venue.photos.length - 5} more</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {venue.rating > 0 ? venue.rating : "New"} ({venue.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{venue.city}</span>
                </div>
              </div>
              <p className="text-gray-600 text-lg">{venue.description}</p>
            </div>

            {/* Sports Available */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Sports Available</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.sports.map((sport) => (
                    <motion.div
                      key={sport}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">
                          {sport.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{sport}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || Users
                    return (
                      <motion.div
                        key={amenity}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-900">{amenity}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Courts & Pricing */}
            {venue.courts && venue.courts.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Courts & Pricing</h3>
                  <div className="space-y-3">
                    {venue.courts.map((court) => (
                      <div key={court.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{court.name}</h4>
                          <p className="text-sm text-gray-600">{court.sport}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-green-600">₹{court.pricePerHour}</span>
                          <p className="text-sm text-gray-600">per hour</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {venue.reviews && venue.reviews.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Player Reviews & Ratings</h3>
                  <div className="space-y-4">
                    {venue.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{review.userName}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₹{venue.startingPrice}
                  </div>
                  <p className="text-gray-600">Starting from per hour</p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleBookVenue}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    size="lg"
                  >
                    Book This Venue
                  </Button>
                </motion.div>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{venue.operatingHours || "7:00 AM - 11:00 PM"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.address}</span>
                  </div>
                  {venue.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{venue.phone}</span>
                    </div>
                  )}
                  {venue.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{venue.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Screen Photo Gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <motion.img
                key={currentPhotoIndex}
                src={venue.photos[currentPhotoIndex]?.photoUrl}
                alt={`${venue.name} photo ${currentPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              />
              
              {venue.photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentPhotoIndex + 1} of {venue.photos.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}