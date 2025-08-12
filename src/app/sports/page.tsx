import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
const sports = [
  {
    id: "badminton",
    name: "Badminton",
    icon: "🏸",
    description: "Fast-paced racket sport played on indoor courts",
    venueCount: 24,
    color: "bg-blue-500"
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "🎾",
    description: "Classic racket sport played on various court surfaces",
    venueCount: 18,
    color: "bg-green-500"
  },
  {
    id: "football",
    name: "Football",
    icon: "⚽",
    description: "The beautiful game played on grass and artificial turf",
    venueCount: 32,
    color: "bg-purple-500"
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    description: "High-energy team sport played on indoor and outdoor courts",
    venueCount: 15,
    color: "bg-orange-500"
  },
  {
    id: "table-tennis",
    name: "Table Tennis",
    icon: "🏓",
    description: "Fast indoor racket sport played on specialized tables",
    venueCount: 12,
    color: "bg-red-500"
  },
  {
    id: "volleyball",
    name: "Volleyball",
    icon: "🏐",
    description: "Team sport played on sand or indoor courts",
    venueCount: 8,
    color: "bg-yellow-500"
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    description: "Traditional bat and ball sport with various formats",
    venueCount: 6,
    color: "bg-indigo-500"
  },
  {
    id: "swimming",
    name: "Swimming",
    icon: "🏊",
    description: "Water-based sport in indoor and outdoor pools",
    venueCount: 10,
    color: "bg-cyan-500"
  }
]

export default function SportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sports & Activities</h1>
          <p className="text-lg text-gray-600">
            Explore different sports and find the perfect venue for your favorite activities
          </p>
        </div>
      </div>

      {/* Sports Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sports.map((sport) => (
            <div key={sport.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className={`${sport.color} p-6 flex items-center justify-center`}>
                <span className="text-6xl">{sport.icon}</span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{sport.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {sport.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {sport.venueCount} venues available
                  </span>
                  
                  <Link href={`/venues?sport=${sport.id}`}>
                    <Button size="sm" variant="outline">
                      Find Venues
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Popular Sports Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Most Popular Sports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sports.slice(0, 3).map((sport) => (
              <div key={sport.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center">
                <div className={`${sport.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-4xl">{sport.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{sport.name}</h3>
                <p className="text-gray-600 mb-4">{sport.description}</p>
                <Link href={`/venues?sport=${sport.id}`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Explore {sport.name} Venues
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 bg-green-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Can't Find Your Sport?</h2>
          <p className="text-green-100 mb-6">
            We're constantly adding new sports and activities. Let us know what you're looking for!
          </p>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
            Suggest a Sport
          </Button>
        </div>
      </div>
    </div>
  )
} 