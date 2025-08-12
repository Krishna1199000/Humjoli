"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  ArrowLeft,
  Package,
  ShoppingCart,
  Star,
  MapPin,
  Tag,
  Trash2,
  LogOut,
  User,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { InventoryItem, InventoryStatus } from "@/types/inventory"
import Image from "next/image"

interface FavoriteItem {
  id: string
  userId: string
  inventoryId: string
  createdAt: string
  inventory: InventoryItem
}

export default function FavoritesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/signin')
    }
  }, [session, router])

  // Fetch favorites
  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites()
    }
  }, [session])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/favorites')
      if (!response.ok) throw new Error('Failed to fetch favorites')
      
      const data = await response.json()
      setFavorites(data)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      toast.error('Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (inventoryId: string) => {
    try {
      const response = await fetch(`/api/favorites?inventoryId=${inventoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove from favorites')

      toast.success('Removed from favorites')
      fetchFavorites() // Refresh the list
    } catch (error) {
      console.error('Error removing from favorites:', error)
      toast.error('Failed to remove from favorites')
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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button className="text-purple-600 hover:bg-purple-50 bg-transparent p-2 rounded-lg">
                  <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-purple-600"
              >
                My Favorites
              </motion.div>
              <Badge className="bg-red-100 text-red-600 text-xs sm:text-sm">
                <Heart className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                Favorites
              </Badge>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/inventory">
                <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm">
                  Browse Inventory
                </Button>
              </Link>
              <div className="hidden sm:flex items-center space-x-2 text-purple-600">
                <User className="h-4 w-4" />
                <span className="font-medium text-sm lg:text-base">{session?.user?.name || session?.user?.email}</span>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 bg-transparent p-2 sm:px-4"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full mb-4 sm:mb-6">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-800 mb-2">
              My Favorite Items
            </h1>
            <p className="text-gray-600 text-base sm:text-lg px-4">
              Your saved wedding supplies and equipment
            </p>
          </div>
        </motion.div>

        {/* Favorites Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-purple-600 text-lg">Loading favorites...</div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
              <p className="text-gray-600 mb-6">Start browsing our inventory and add items to your favorites!</p>
              <Link href="/inventory">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Package className="mr-2 h-5 w-5" />
                  Browse Inventory
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 group hover:shadow-xl">
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        {favorite.inventory.imageUrl ? (
                          <Image
                            src={favorite.inventory.imageUrl}
                            alt={favorite.inventory.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                            <Package className="h-16 w-16 text-purple-400" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={getStatusColor(favorite.inventory.status)}>
                            {favorite.inventory.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {/* Remove from Favorites Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromFavorites(favorite.inventory.id)
                          }}
                          className="absolute top-2 left-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300"
                          title="Remove from favorites"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="mb-2">
                          <Badge className="bg-purple-100 text-purple-600 text-xs mb-2">
                            {favorite.inventory.category}
                          </Badge>
                          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                            {favorite.inventory.name}
                          </h3>
                          {favorite.inventory.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {favorite.inventory.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-800">
                              ₹{favorite.inventory.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {favorite.inventory.quantity} in stock
                            </p>
                          </div>
                          <Link href={`/inventory/${favorite.inventory.id}`}>
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{favorites.length}</p>
                    <p className="text-gray-600">Total Favorites</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{favorites.reduce((sum, fav) => sum + fav.inventory.price, 0).toLocaleString()}
                    </p>
                    <p className="text-gray-600">Total Value</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {[...new Set(favorites.map(fav => fav.inventory.category))].length}
                    </p>
                    <p className="text-gray-600">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
} 