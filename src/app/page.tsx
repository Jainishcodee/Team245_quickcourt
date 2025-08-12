"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Star, MapPin, Clock } from "lucide-react"

export default function Home() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch('/api/venues?limit=6')
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
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Sports Facilities
              <br />
              <span className="text-green-200">Join the Game</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Discover and book local sports facilities. From badminton courts to turf grounds, 
              find your perfect venue and connect with fellow sports enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/venues">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Find Venues
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white/10 rounded-full"></div>
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Sports
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find facilities for your favorite sports and activities
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "🏸", name: "Badminton", color: "bg-blue-500" },
              { icon: "🎾", name: "Tennis", color: "bg-green-500" },
              { icon: "⚽", name: "Football", color: "bg-purple-500" },
              { icon: "🏀", name: "Basketball", color: "bg-orange-500" },
            ].map((sport) => (
              <div key={sport.name} className="text-center group">
                <div className={`${sport.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-4xl">{sport.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{sport.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Venues
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the best sports facilities in your area
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading venues...</p>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {venue.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {venue.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {venue.city}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {venue.rating > 0 ? venue.rating : "New"}
                        </span>
                        {venue.reviewCount > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({venue.reviewCount})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {venue.sports.slice(0, 2).join(", ")}
                        {venue.sports.length > 2 && "..."}
                      </div>
                    </div>
                    {/* Show different button based on status */}
                    {venue.status === "pending" ? (
                      <div className="space-y-2">
                        <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                          Pending Approval
                        </Button>
                        {venue.isOwner && (
                          <p className="text-xs text-gray-500 text-center">
                            Your venue is under review by our team
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href={`/venues/${venue.id}`}>
                          View Details
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No venues available yet. Be the first to add one!
              </p>
              <Button asChild>
                <Link href="/auth/signup">Become a Facility Owner</Link>
              </Button>
            </div>
          )}

          {venues.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/venues">
                  View All Venues
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose QuickCourt?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for seamless sports facility booking
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Easy Booking",
                description: "Book courts and facilities in just a few clicks with our intuitive interface.",
                icon: "🎯"
              },
              {
                title: "Verified Venues",
                description: "All facilities are verified and reviewed by our community for quality assurance.",
                icon: "✅"
              },
              {
                title: "Community",
                description: "Connect with fellow sports enthusiasts and join matches in your area.",
                icon: "🤝"
              }
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Join thousands of sports enthusiasts who are already using QuickCourt to book facilities and connect with others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/venues">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                Browse Venues
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">QC</span>
                </div>
                <span className="text-xl font-bold">QuickCourt</span>
              </div>
              <p className="text-gray-400">
                Your go-to platform for booking sports facilities and connecting with fellow sports enthusiasts.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/venues" className="text-gray-400 hover:text-white transition-colors">Venues</Link></li>
                <li><Link href="/sports" className="text-gray-400 hover:text-white transition-colors">Sports</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/newsletter" className="text-gray-400 hover:text-white transition-colors">Newsletter</Link></li>
                <li><Link href="/social" className="text-gray-400 hover:text-white transition-colors">Social Media</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 QuickCourt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
