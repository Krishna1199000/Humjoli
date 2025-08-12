"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Package,
  Search,
  X,
  Share2,
  Mail,
  Copy,
  ArrowLeft,
  ExternalLink,
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { InventoryItem, InventoryStatus } from "@/types/inventory"
import Image from "next/image"
import Link from "next/link"

export default function PublicInventoryPage() {
  const { data: session } = useSession()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const [favorites, setFavorites] = useState<string[]>([])

  // Fetch inventory items and favorites
  useEffect(() => {
    fetchInventory()
    if (session?.user?.id) {
      fetchFavorites()
    }
  }, [session])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/inventory')
      if (!response.ok) throw new Error('Failed to fetch inventory')
      
      const data = await response.json()
      setInventoryItems(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to fetch inventory items')
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = [...new Set(inventoryItems.map(item => item.category))].map(category => ({
    name: category,
    count: inventoryItems.filter(item => item.category === category).length,
    color: "bg-purple-100 text-purple-600"
  }))

  // Filter items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

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

  const toggleFavorite = async (itemId: string) => {
    try {
      if (favorites.includes(itemId)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?inventoryId=${itemId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setFavorites(prev => prev.filter(id => id !== itemId))
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inventoryId: itemId })
        })
        if (response.ok) {
          setFavorites(prev => [...prev, itemId])
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-purple-600"
              >
                Humjoli Wedding
              </motion.div>
              <Badge className="bg-purple-100 text-purple-600 text-xs sm:text-sm">Wedding Supplies</Badge>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm">
                  Home
                </Button>
              </Link>
              <Link href="/about">
                <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm">
                  About
                </Button>
              </Link>
              {session?.user?.id && (
                <Link href="/favorites">
                  <Button className="bg-red-100 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm">
                    <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">My Favorites</span>
                    <span className="sm:hidden">Favorites</span>
                  </Button>
                </Link>
              )}
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-800 mb-2">
              Wedding Supplies & Equipment
            </h1>
            <p className="text-gray-600 text-base sm:text-lg px-4">
              Discover our premium collection of wedding supplies and equipment
            </p>
          </div>
        </motion.div>

                {/* Search and Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {/* Search */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search wedding supplies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      />
                    </div>
                  </div>
                  {selectedCategory && (
                    <Button
                      onClick={() => setSelectedCategory("")}
                      className="border border-purple-300 text-purple-600 hover:bg-purple-50 bg-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div>
            <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      className={`flex items-center justify-between p-3 bg-white/50 rounded-lg border border-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer ${
                        selectedCategory === category.name ? 'border-purple-400 bg-purple-50' : ''
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === category.name ? "" : category.name)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge className={category.color}>
                          {category.name}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{category.count}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Inventory Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-purple-600 text-lg">Loading inventory...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No items found</p>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Link href={`/inventory/${item.id}`}>
                    <Card 
                      className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer group hover:shadow-xl"
                    >
                    <CardContent className="p-0">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
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
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(item.id)
                          }}
                          className={`absolute top-2 left-2 p-1 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                            favorites.includes(item.id) 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="mb-2">
                          <Badge className="bg-purple-100 text-purple-600 text-xs mb-2">
                            {item.category}
                          </Badge>
                          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-800">
                              ₹{item.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} in stock
                            </p>
                          </div>
                          <Link href={`/inventory/${item.id}`}>
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
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 