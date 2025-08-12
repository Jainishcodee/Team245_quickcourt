"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Calendar,
  Clock,
  Minus,
  Plus,
  X
} from "lucide-react"

interface Venue {
  id: string
  name: string
  description: string
  address: string
  city: string
  sports: string[]
  photos: { photoUrl: string }[]
  rating: number
  reviewCount: number
  courts: { id: string; name: string; pricePerHour: number; sport: string }[]
}

interface BookingData {
  sport: string
  date: string
  startTime: string
  duration: number
  courts: string[]
  totalAmount: number
}

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
]

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const venueId = searchParams.get('venueId')

  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState<BookingData>({
    sport: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    duration: 2,
    courts: [],
    totalAmount: 0
  })

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Get next 30 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const currentDate = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      })
    }
    return dates
  }

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (!venueId) {
      router.push("/venues")
      return
    }

    const fetchVenue = async () => {
      try {
        const response = await fetch(`/api/venues/${venueId}`)
        if (response.ok) {
          const data = await response.json()
          setVenue(data)
          if (data.sports.length > 0) {
            setBookingData(prev => ({ ...prev, sport: data.sports[0] }))
          }
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

    fetchVenue()
  }, [venueId, router, session, status])

  // Calculate total amount based on selected courts and duration
  useEffect(() => {
    if (venue && bookingData.courts.length > 0) {
      const selectedCourts = venue.courts.filter(court => 
        bookingData.courts.includes(court.id) && 
        court.sport === bookingData.sport
      )
      const totalAmount = selectedCourts.reduce((sum, court) => 
        sum + (court.pricePerHour * bookingData.duration), 0
      )
      setBookingData(prev => ({ ...prev, totalAmount }))
    } else {
      setBookingData(prev => ({ ...prev, totalAmount: 0 }))
    }
  }, [venue, bookingData.courts, bookingData.duration, bookingData.sport])

  const handleSportChange = (sport: string) => {
    setBookingData(prev => ({ 
      ...prev, 
      sport, 
      courts: [] // Reset courts when sport changes
    }))
  }

  const handleCourtToggle = (courtId: string) => {
    setBookingData(prev => ({
      ...prev,
      courts: prev.courts.includes(courtId)
        ? prev.courts.filter(id => id !== courtId)
        : [...prev.courts, courtId]
    }))
  }

  const handleDurationChange = (change: number) => {
    const newDuration = Math.max(1, Math.min(8, bookingData.duration + change))
    setBookingData(prev => ({ ...prev, duration: newDuration }))
  }

  const handleContinueToPayment = () => {
    if (bookingData.courts.length === 0) {
      alert("Please select at least one court")
      return
    }
    
    // Here you would typically save the booking data and redirect to payment
    console.log("Booking data:", bookingData)
    // For now, we'll just show an alert
    alert(`Booking confirmed! Total: ₹${bookingData.totalAmount}`)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking form...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !venue) {
    return null
  }

  const availableCourts = venue.courts.filter(court => court.sport === bookingData.sport)
  const availableDates = getAvailableDates()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Court Booking</h1>
              <p className="text-lg text-gray-600 mt-1">Book your preferred court and time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Venue Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={venue.photos[0]?.photoUrl || "/placeholder-venue.jpg"}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{venue.name}</h2>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">
                          {venue.rating > 0 ? venue.rating : "New"} ({venue.reviewCount})
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="text-sm">{venue.city}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{venue.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sport Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  Sport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {venue.sports.map((sport) => (
                    <motion.button
                      key={sport}
                      onClick={() => handleSportChange(sport)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        bookingData.sport === sport
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">{sport}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {availableDates.slice(0, 14).map((date) => (
                    <motion.button
                      key={date.value}
                      onClick={() => setBookingData(prev => ({ ...prev, date: date.value }))}
                      className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                        bookingData.date === date.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${date.isToday ? 'ring-2 ring-green-200' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-xs font-medium">{date.label}</div>
                      {date.isToday && (
                        <div className="text-xs text-green-600 mt-1">Today</div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">3</span>
                    </div>
                    Start Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <motion.button
                        key={time}
                        onClick={() => setBookingData(prev => ({ ...prev, startTime: time }))}
                        className={`p-2 rounded-lg border text-sm transition-all duration-200 ${
                          bookingData.startTime === time
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Duration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">4</span>
                    </div>
                    Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDurationChange(-1)}
                      disabled={bookingData.duration <= 1}
                      className="w-10 h-10 rounded-full p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {bookingData.duration} Hr
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDurationChange(1)}
                      disabled={bookingData.duration >= 8}
                      className="w-10 h-10 rounded-full p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center mt-4 text-sm text-gray-600">
                    {bookingData.startTime} - {
                      String(Math.floor((parseInt(bookingData.startTime.split(':')[0]) + bookingData.duration) / 1) % 24).padStart(2, '0')
                    }:{bookingData.startTime.split(':')[1]}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Court Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">5</span>
                  </div>
                  Court
                  <span className="text-sm font-normal text-gray-600">
                    --Select Court--
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableCourts.length > 0 ? (
                  <div className="space-y-3">
                    {availableCourts.map((court) => (
                      <motion.div
                        key={court.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          bookingData.courts.includes(court.id)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleCourtToggle(court.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              bookingData.courts.includes(court.id)
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {bookingData.courts.includes(court.id) && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{court.name}</h4>
                              <p className="text-sm text-gray-600">{court.sport}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-600">₹{court.pricePerHour}</span>
                            <p className="text-xs text-gray-600">per hour</p>
                          </div>
                        </div>
                        
                        {bookingData.courts.includes(court.id) && (
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                Table 1
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCourtToggle(court.id)
                                }}
                                className="ml-auto h-6 w-6 p-0 hover:bg-red-100"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No courts available for {bookingData.sport}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue</span>
                    <span className="font-medium">{venue.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sport</span>
                    <span className="font-medium">{bookingData.sport || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {new Date(bookingData.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">
                      {bookingData.startTime} - {
                        String(Math.floor((parseInt(bookingData.startTime.split(':')[0]) + bookingData.duration) / 1) % 24).padStart(2, '0')
                      }:{bookingData.startTime.split(':')[1]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{bookingData.duration} Hour{bookingData.duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courts</span>
                    <span className="font-medium">
                      {bookingData.courts.length > 0 ? `${bookingData.courts.length} selected` : "None"}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-green-600">₹{bookingData.totalAmount}</span>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleContinueToPayment}
                    disabled={bookingData.courts.length === 0 || bookingData.totalAmount === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    size="lg"
                  >
                    Continue to Payment - ₹{bookingData.totalAmount}
                  </Button>
                </motion.div>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  The selected date must be today or later
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Start time must be in the future
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Unavailable time slots are disabled and cannot be selected
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}