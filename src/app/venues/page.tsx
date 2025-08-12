"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, MapPin, Star, Clock, Filter } from "lucide-react"

// Available sports for filtering
const availableSports = [
  "Badminton", "Tennis", "Football", "Basketball", "Cricket",
  "Table Tennis", "Volleyball", "Swimming", "Gym", "Yoga"
]

// Indian cities for location filtering
const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
]

export default function VenuesPage() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sport: "",
    city: "",
    search: ""
  })

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const params = new URLSearchParams()
        if (filters.sport) params.append("sport", filters.sport)
        if (filters.city) params.append("city", filters.city)
        
        const response = await fetch(`/api/venues?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setVenues(data.venues)
        }
      } catch (error) {
        console.error('Error fetching venues:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sports Venues</h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover and book the best sports facilities in your area
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search venues by name, sport, or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select 
              value={filters.sport}
              onChange={(e) => handleFilterChange("sport", e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Sports</option>
              {availableSports.map((sport) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <select 
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {indianCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Price Range</option>
              <option value="0-500">₹0 - ₹500</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="1000+">₹1000+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venues...</p>
          </div>
        ) : venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue: any) => (
              <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={venue.photoUrl}
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-venue.jpg"
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      ₹{venue.startingPrice}/hr
                    </Badge>
                  </div>
                  {/* Status Badge */}
                  {venue.status === "pending" && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Pending Approval
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{venue.name}</h3>
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {venue.rating > 0 ? venue.rating : "New"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{venue.city}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {venue.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600 font-semibold">
                      <span className="text-sm">
                        {venue.sports.slice(0, 2).join(", ")}
                        {venue.sports.length > 2 && "..."}
                      </span>
                    </div>
                    
                    {/* Show different button based on status */}
                    {venue.status === "pending" ? (
                      <Button disabled size="sm" className="bg-gray-400 cursor-not-allowed">
                        Pending Approval
                      </Button>
                    ) : (
                      <Link href={`/venues/${venue.id}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          View Details
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {/* Show owner message for pending venues */}
                  {venue.status === "pending" && venue.isOwner && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Your venue is under review by our team
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No venues found matching your criteria.</p>
            <Button asChild>
              <Link href="/dashboard/upload-venue">Add Your Venue</Link>
            </Button>
          </div>
        )}
        
        {/* Load More */}
        {venues.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8">
              Load More Venues
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 