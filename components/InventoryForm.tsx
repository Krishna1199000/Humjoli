"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Upload,
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { InventoryFormData, InventoryItem } from "@/types/inventory"
import Image from "next/image"

interface InventoryFormProps {
  item?: InventoryItem
  onSuccess?: () => void
  onCancel?: () => void
}

interface Category { id: string; name: string }

export default function InventoryForm({ item, onSuccess, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState<InventoryFormData>({
    name: item?.name || "",
    description: item?.description || "",
    category: item?.category || "",
    quantity: item?.quantity ?? 0,
    price: item?.price ?? 0,
    minStock: item?.minStock ?? 0,
    maxStock: item?.maxStock || undefined,
    location: item?.location || "",
    supplier: item?.supplier || "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (e) {
        // silent
      }
    }
    loadCategories()
  }, [])

  const handleInputChange = (field: keyof InventoryFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if ((formData.quantity ?? 0) < 0 || (formData.price ?? 0) < 0 || (formData.minStock ?? 0) < 0) {
      toast.error('Please enter valid numeric values')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description || '')
      submitData.append('category', formData.category)
      if (formData.quantity !== undefined) submitData.append('quantity', formData.quantity.toString())
      if (formData.price !== undefined) submitData.append('price', formData.price.toString())
      if (formData.minStock !== undefined) submitData.append('minStock', formData.minStock.toString())
      if (formData.maxStock) {
        submitData.append('maxStock', formData.maxStock.toString())
      }
      submitData.append('location', formData.location || '')
      submitData.append('supplier', formData.supplier || '')
      
      if (imageFile) {
        submitData.append('image', imageFile)
      }

      const url = item ? `/api/inventory/${item.id}` : '/api/inventory'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: submitData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save inventory item')
      }

      toast.success(item ? 'Inventory item updated successfully!' : 'Inventory item created successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error saving inventory item:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save inventory item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-serif font-bold text-gray-800">
                  {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </CardTitle>
                <p className="text-gray-600">
                  {item ? 'Update the inventory item details below' : 'Fill in the details to add a new inventory item'}
                </p>
              </div>
            </div>
            {onCancel && (
              <Button
                onClick={onCancel}
                className="border border-purple-300 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring-purple-400"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" onClick={() => setAddingCategory(true)}>+ Add</Button>
                </div>
                {addingCategory && (
                  <div className="mt-2 flex gap-2">
                    <Input placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                    <Button type="button" onClick={async () => {
                      const name = newCategory.trim()
                      if (!name) return
                      try {
                        const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
                        if (!res.ok) {
                          const msg = await res.json().catch(() => ({}))
                          throw new Error(msg?.error || 'Failed')
                        }
                        setNewCategory("")
                        setAddingCategory(false)
                        const list = await fetch('/api/categories').then(r => r.json())
                        setCategories(list)
                        handleInputChange('category', name)
                      } catch (e) {
                        // optional toast import already present
                        toast.error(e instanceof Error ? e.message : 'Failed to add category')
                      }
                    }}>Save</Button>
                    <Button type="button" variant="outline" onClick={() => { setAddingCategory(false); setNewCategory("") }}>Cancel</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter item description"
                rows={3}
                className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.quantity ?? ''}
                  onChange={(e) => handleInputChange('quantity', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  placeholder=""
                  min="0"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.price ?? ''}
                  onChange={(e) => handleInputChange('price', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  placeholder=""
                  min="0"
                  step="0.01"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.minStock ?? ''}
                  onChange={(e) => handleInputChange('minStock', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  placeholder=""
                  min="0"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stock
                </label>
                <Input
                  type="number"
                  value={formData.maxStock || ''}
                  onChange={(e) => handleInputChange('maxStock', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Optional"
                  min="0"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Storage location"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <Input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="Supplier name"
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-purple-200">
                      <Image
                        src={imagePreview}
                        alt="Item preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-purple-300 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-500">
                    JPG, PNG, GIF up to 5MB
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-purple-200">
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  className="border border-purple-300 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {item ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
} 