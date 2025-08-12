"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Share2,
  Mail,
  Copy,
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Tag,
  Home,
  Phone,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { InventoryItem, InventoryStatus } from "@/types/inventory"
import Image from "next/image"
import Link from "next/link"

export default function InventoryItemPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchItem(params.id as string)
    }
    if (session?.user?.id) {
      fetchFavorites()
    }
  }, [params.id, session])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.map((fav: any) => fav.inventoryId))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const fetchItem = async (itemId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inventory/${itemId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Item not found')
          router.push('/inventory')
          return
        }
        throw new Error('Failed to fetch item')
      }
      
      const data = await response.json()
      setItem(data)
      setSelectedImage(data.imageUrl)
    } catch (error) {
      console.error('Error fetching item:', error)
      toast.error('Failed to fetch item details')
      router.push('/inventory')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-600'
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-600'
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-600'
      case 'DISCONTINUED':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const handleShareWhatsApp = () => {
    if (!item || typeof window === 'undefined') return
    const text = `Check out this amazing ${item.name} from Humjoli Wedding! ${window.location.href}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleShareEmail = () => {
    if (!item || typeof window === 'undefined') return
    const subject = `Amazing ${item.name} from Humjoli Wedding`
    const body = `Hi! I found this amazing ${item.name} from Humjoli Wedding that I think you'd love!\n\n${item.name}\n${item.description || ''}\nPrice: ₹${item.price.toLocaleString()}\n\nCheck it out: ${window.location.href}`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url)
  }

  const handleShareFacebook = () => {
    if (!item || typeof window === 'undefined') return
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
  }

  const handleShareTwitter = () => {
    if (!item || typeof window === 'undefined') return
    const text = `Check out this amazing ${item.name} from Humjoli Wedding!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank')
  }

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleCall = () => {
    if (typeof window === 'undefined') return
    window.open('tel:+919876543210', '_blank')
  }

  const toggleFavorite = async () => {
    if (!item) return
    try {
      if (favorites.includes(item.id)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?inventoryId=${item.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setFavorites(prev => prev.filter(id => id !== item.id))
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inventoryId: item.id })
        })
        if (response.ok) {
          setFavorites(prev => [...prev, item.id])
          toast.success('Added to favorites')
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to add to favorites')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-purple-600 text-lg mb-4">Loading item details...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
          <Link href="/inventory">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Home className="mr-2 h-4 w-4" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/inventory">
                <Button
                  className="text-purple-600 hover:bg-purple-50 bg-transparent p-2 rounded-lg"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Inventory</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-purple-600"
              >
                Humjoli Wedding
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                onClick={toggleFavorite}
                className={`${
                  favorites.includes(item.id) 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                } bg-transparent hover:bg-gray-50 p-2 rounded-lg`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                className="text-green-600 hover:bg-green-50 bg-transparent p-2 rounded-lg"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              {session?.user?.id && (
                <Link href="/favorites">
                  <Button className="bg-red-100 border border-red-300 text-red-600 hover:bg-red-50 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm">
                    <Heart className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">My Favorites</span>
                    <span className="sm:hidden">Favorites</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Item Detail */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
        >
          {/* Large Image Section */}
          <div className="space-y-6">
            {/* Main Large Image */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 overflow-hidden shadow-xl">
              <CardContent className="p-0">
                {selectedImage ? (
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={selectedImage}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Image Overlay with Zoom Effect */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 group">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <ExternalLink className="h-6 w-6 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <Package className="h-32 w-32 text-purple-400" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Image Gallery Placeholder */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedImage(item.imageUrl || null)}
                >
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              ))}
            </div>

            {/* Quick Share Section */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Share This Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleShareWhatsApp}
                    className="border border-green-300 text-green-600 hover:bg-green-50 bg-white px-4 py-2 rounded-lg"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={handleShareEmail}
                    className="border border-blue-300 text-blue-600 hover:bg-blue-50 bg-white px-4 py-2 rounded-lg"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    onClick={handleShareFacebook}
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 bg-white px-4 py-2 rounded-lg"
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    onClick={handleShareTwitter}
                    className="border border-blue-400 text-blue-400 hover:bg-blue-50 bg-white px-4 py-2 rounded-lg"
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-3">
                {item.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
                <Badge className="bg-purple-100 text-purple-600">
                  {item.category}
                </Badge>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(4.8)</span>
                </div>
              </div>
              
              {item.description && (
                <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                  {item.description}
                </p>
              )}
            </div>

            {/* Price and Stock */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-4xl font-bold text-gray-800">
                      ₹{item.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">per unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-800">
                      {item.quantity} in stock
                    </p>
                    <p className="text-sm text-gray-600">Available for booking</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {item.location || 'Main Warehouse'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {item.supplier || 'Humjoli Wedding'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                <ShoppingCart className="mr-3 h-6 w-6" />
                Book This Item
              </Button>
              
              <Button
                onClick={handleCall}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call for Booking
              </Button>
              
              <Button
                onClick={handleCopyLink}
                className="w-full border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white py-3 rounded-lg"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>

            {/* Specifications */}
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Category</span>
                    <span className="font-semibold">{item.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Minimum Stock</span>
                    <span className="font-semibold">{item.minStock}</span>
                  </div>
                  {item.maxStock && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Maximum Stock</span>
                      <span className="font-semibold">{item.maxStock}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Location</span>
                    <span className="font-semibold">{item.location || 'Main Warehouse'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Supplier</span>
                    <span className="font-semibold">{item.supplier || 'Humjoli Wedding'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 