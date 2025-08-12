"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  X,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockBookings = [
  {
    id: "1",
    venueName: "Elite Badminton Center",
    sport: "Badminton",
    court: "Court A",
    date: "2024-01-15",
    time: "14:00-16:00",
    duration: "2 hours",
    amount: 50,
    status: "confirmed",
    venueImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop"
  },
  {
    id: "2",
    venueName: "Green Tennis Club",
    sport: "Tennis",
    court: "Court B",
    date: "2024-01-16",
    time: "16:00-18:00",
    duration: "2 hours",
    amount: 80,
    status: "confirmed",
    venueImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop"
  },
  {
    id: "3",
    venueName: "Urban Football Arena",
    sport: "Football",
    court: "Field 1",
    date: "2024-01-17",
    time: "10:00-12:00",
    duration: "2 hours",
    amount: 70,
    status: "pending",
    venueImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=300&fit=crop"
  },
  {
    id: "4",
    venueName: "Basketball Pro Court",
    sport: "Basketball",
    court: "Court 1",
    date: "2024-01-14",
    time: "18:00-20:00",
    duration: "2 hours",
    amount: 60,
    status: "completed",
    venueImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop"
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
      
    case "completed":
      return "bg-blue-100 text-blue-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="w-4 h-4" />
    case "cancelled":
      return <X className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const upcomingBookings = mockBookings.filter(booking => 
    booking.status === "confirmed" || booking.status === "pending"
  )
  
  const pastBookings = mockBookings.filter(booking => 
    booking.status === "completed" || booking.status === "cancelled"
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-lg text-gray-600 mt-1">
                Manage your court bookings and reservations
              </p>
            </div>
            <Link href="/venues">
              <Button className="bg-green-600 hover:bg-green-700">
                Book New Court
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={booking.venueImage}
                      alt={booking.venueName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.venueName}</CardTitle>
                        <p className="text-sm text-gray-600">{booking.sport} • {booking.court}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {booking.time} ({booking.duration})
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        Downtown
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                          <DollarSign className="w-5 h-5" />
                          {booking.amount}
                        </div>
                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                              Cancel
                            </Button>
                          )}
                          <Link href={`/bookings/${booking.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-gray-600 mb-6">You don't have any upcoming court bookings.</p>
                <Link href="/venues">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Book Your First Court
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Bookings */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Bookings</h2>
          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden opacity-75">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={booking.venueImage}
                      alt={booking.venueName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.venueName}</CardTitle>
                        <p className="text-sm text-gray-600">{booking.sport} • {booking.court}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {booking.time} ({booking.duration})
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        Downtown
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                          <DollarSign className="w-5 h-5" />
                          {booking.amount}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/bookings/${booking.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                          {booking.status === "completed" && (
                            <Button size="sm" variant="outline">
                              Book Again
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
                <p className="text-gray-600">Your booking history will appear here.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 