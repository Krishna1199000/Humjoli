"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  X,
  Heart,
  Share2,
  Copy,
  Mail,
  Phone,
  ExternalLink,
  Facebook,
  Twitter,
  Star,
  MapPin,
  Tag,
  ShoppingCart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { InventoryItem, InventoryStatus } from "@/types/inventory"
import Image from "next/image"

interface ItemModalProps {
  item: InventoryItem | null
  isOpen: boolean
  onClose: () => void
  favorites: string[]
  onToggleFavorite: (itemId: string) => void
}

export default function ItemModal({ 
  item, 
  isOpen, 
  onClose, 
  favorites, 
  onToggleFavorite 
}: ItemModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  if (!item) return null

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
    if (typeof window === 'undefined') return
    const text = `Check out this amazing ${item.name} from Humjoli Wedding! ${window.location.origin}/admin/inventory`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleShareEmail = () => {
    if (typeof window === 'undefined') return
    const subject = `Amazing ${item.name} from Humjoli Wedding`
    const body = `Hi! I found this amazing ${item.name} from Humjoli Wedding that I think you'd love!\n\n${item.name}\n${item.description || ''}\nPrice: ₹${item.price.toLocaleString()}\n\nCheck it out: ${window.location.origin}/admin/inventory`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url)
  }

  const handleShareFacebook = () => {
    if (typeof window === 'undefined') return
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/admin/inventory')}`
    window.open(url, '_blank')
  }

  const handleShareTwitter = () => {
    if (typeof window === 'undefined') return
    const text = `Check out this amazing ${item.name} from Humjoli Wedding!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + '/admin/inventory')}`
    window.open(url, '_blank')
  }

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.origin + '/admin/inventory')
    toast.success('Link copied to clipboard!')
  }

  const handleCall = () => {
    if (typeof window === 'undefined') return
    window.open('tel:+919876543210', '_blank')
  }

  const isFavorite = favorites.includes(item.id)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
                <Badge className={getStatusColor(item.status)}>
                  {item.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onToggleFavorite(item.id)}
                  variant="ghost"
                  size="sm"
                  className={`${
                    isFavorite 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-5 w-5" />
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)] overflow-hidden">
              {/* Image Section */}
              <div className="lg:w-1/2 p-6">
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover cursor-zoom-in"
                        onClick={() => setIsImageZoomed(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag className="h-12 w-12 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No image available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Zoom Button */}
                    {item.imageUrl && (
                      <button
                        onClick={() => setIsImageZoomed(true)}
                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                      >
                        <ZoomIn className="h-4 w-4 text-gray-700" />
                      </button>
                    )}
                  </div>

                  {/* Image Gallery Placeholder */}
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        <Tag className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:w-1/2 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Title and Category */}
                  <div>
                    <Badge className="bg-purple-100 text-purple-600 mb-3">
                      {item.category}
                    </Badge>
                    <div className="flex items-center space-x-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-600">(4.8)</span>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Price and Stock */}
                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-3xl font-bold text-gray-900">
                            ₹{item.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">per unit</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-gray-900">
                            {item.quantity} in stock
                          </p>
                          <p className="text-sm text-gray-600">Available for booking</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4">
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

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Book This Item
                    </Button>
                    
                    <Button
                      onClick={handleCall}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Call for Booking
                    </Button>
                  </div>

                  {/* Share Section */}
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Share This Item</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={handleShareWhatsApp}
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          WhatsApp
                        </Button>
                        <Button
                          onClick={handleShareEmail}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                        <Button
                          onClick={handleShareFacebook}
                          variant="outline"
                          size="sm"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
                        </Button>
                        <Button
                          onClick={handleShareTwitter}
                          variant="outline"
                          size="sm"
                          className="border-blue-400 text-blue-400 hover:bg-blue-50"
                        >
                          <Twitter className="mr-2 h-4 w-4" />
                          Twitter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specifications */}
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600">Minimum Stock</span>
                          <span className="font-medium">{item.minStock}</span>
                        </div>
                        {item.maxStock && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">Maximum Stock</span>
                            <span className="font-medium">{item.maxStock}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium">{item.location || 'Main Warehouse'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600">Supplier</span>
                          <span className="font-medium">{item.supplier || 'Humjoli Wedding'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Zoom Modal */}
          <AnimatePresence>
            {isImageZoomed && item.imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                onClick={() => setIsImageZoomed(false)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="relative max-w-4xl max-h-[90vh] p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    onClick={() => setIsImageZoomed(false)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 