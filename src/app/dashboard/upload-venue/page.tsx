"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { Upload, MapPin, Building, Camera, Save, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const sports = [
  "Badminton", "Tennis", "Football", "Basketball", "Cricket", 
  "Table Tennis", "Volleyball", "Swimming", "Gym", "Yoga"
]

const amenities = [
  "Parking", "Changing Rooms", "Shower", "Equipment Rental", 
  "Cafeteria", "WiFi", "AC", "First Aid", "Security", "Lockers"
]

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"
]

export default function UploadVenuePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    sportTypes: [] as string[],
    amenities: [] as string[],
    photos: [] as File[],
    pricePerHour: "",
    contactPhone: "",
    contactEmail: ""
  })

  // Check if user is facility owner
  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated" || session?.user?.role !== "FACILITY_OWNER") {
    router.push("/auth/signin")
    return null
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSportToggle = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sportTypes: prev.sportTypes.includes(sport)
        ? prev.sportTypes.filter(s => s !== sport)
        : [...prev.sportTypes, sport]
    }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }))
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address || !formData.city || formData.sportTypes.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("description", formData.description)
      submitData.append("address", formData.address)
      submitData.append("city", formData.city)
      submitData.append("sportTypes", JSON.stringify(formData.sportTypes))
      submitData.append("amenities", JSON.stringify(formData.amenities))
      submitData.append("pricePerHour", formData.pricePerHour)
      submitData.append("contactPhone", formData.contactPhone)
      submitData.append("contactEmail", formData.contactEmail)
      
      // Append photos
      formData.photos.forEach((photo, index) => {
        submitData.append(`photos`, photo)
      })

      const response = await fetch("/api/venues/upload", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        toast.success("Venue uploaded successfully! Pending admin approval.")
        router.push("/dashboard")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to upload venue")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload venue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upload New Venue
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Add your sports facility to QuickCourt and start receiving bookings
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about your venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Venue Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Elite Sports Complex"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your venue, facilities, and what makes it special..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Street address, area, landmark..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pricePerHour">Price per Hour (₹)</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => handleInputChange("pricePerHour", e.target.value)}
                    placeholder="500"
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Sports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Contact & Sports
                </CardTitle>
                <CardDescription>
                  How customers can reach you and what sports you offer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="contact@venue.com"
                  />
                </div>

                <div>
                  <Label>Sports Available *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {sports.map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={sport}
                          checked={formData.sportTypes.includes(sport)}
                          onChange={() => handleSportToggle(sport)}
                          className="rounded"
                        />
                        <Label htmlFor={sport} className="text-sm">{sport}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="rounded"
                        />
                        <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Photo Upload */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Venue Photos
              </CardTitle>
              <CardDescription>
                Upload high-quality photos of your venue (max 5 photos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <Label htmlFor="photos" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Click to upload photos
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </Label>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 5MB each
                  </p>
                </div>

                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Venue photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removePhoto(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                "Uploading..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Upload Venue
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 