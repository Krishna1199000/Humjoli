"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  LogOut,
  User,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Eye,
  X,
  Settings,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { InventoryItem, InventoryStatus } from "@/types/inventory"
import InventoryForm from "@/components/InventoryForm"
import Image from "next/image"
import AdminNavbar from "@/components/AdminNavbar"
import ItemModal from "@/components/ItemModal"

export default function InventoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

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

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      toast.success('Item deleted successfully')
      fetchInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchInventory()
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const openItemModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeItemModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || favorites.includes(item.id)
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const categories = [...new Set(inventoryItems.map(item => item.category))]

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-600'
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-600'
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: InventoryStatus) => {
    switch (status) {
      case 'IN_STOCK':
        return 'In Stock'
      case 'LOW_STOCK':
        return 'Low Stock'
      case 'OUT_OF_STOCK':
        return 'Out of Stock'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <AdminNavbar title="Inventory Management" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                Inventory Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage wedding supplies and equipment inventory
              </p>
            </div>
            <Button
              onClick={handleAddNew}
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Item
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search items by name, description, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    showFavoritesOnly 
                      ? 'bg-red-100 border-2 border-red-300 text-red-600 hover:bg-red-50' 
                      : 'bg-purple-100 border-2 border-purple-300 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  {showFavoritesOnly ? 'Show All' : 'Favorites'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="text-purple-600 text-lg">Loading inventory items...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No inventory items found</p>
              <p className="text-gray-500">Add a new item to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 group cursor-pointer" onClick={() => openItemModal(item)}>
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        {item.imageUrl ? (
                          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <Badge className={`absolute top-2 right-2 ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </Badge>
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
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 text-lg group-hover:text-purple-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Category: {item.category}</span>
                          <span className="font-semibold text-gray-800">₹{item.price}</span>
                        </div>
                                                 <div className="flex items-center justify-between text-sm">
                           <span className="text-gray-500">Stock: {item.quantity}</span>
                           <span className="text-gray-500">ID: {item.id.slice(-8)}</span>
                         </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-purple-100">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditItem(item)
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(item.id)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Inventory Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <Button
                  onClick={handleCancelForm}
                  className="text-gray-400 hover:text-gray-600 bg-transparent p-2 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
                             <InventoryForm
                 item={editingItem || undefined}
                 onSuccess={handleFormSuccess}
                 onCancel={handleCancelForm}
               />
            </div>
          </motion.div>
        </div>
      )}

      {/* Item Modal */}
      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeItemModal}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  )
} 