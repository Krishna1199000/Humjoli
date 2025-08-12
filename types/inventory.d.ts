export interface InventoryItem {
  id: string
  name: string
  description?: string
  category: string
  quantity: number
  price: number
  imageUrl?: string
  minStock: number
  maxStock?: number
  location?: string
  supplier?: string
  status: InventoryStatus
  createdAt: Date
  updatedAt: Date
}

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED'

export interface InventoryFormData {
  name: string
  description?: string
  category: string
  quantity: number
  price: number
  minStock: number
  maxStock?: number
  location?: string
  supplier?: string
  image?: File
}

export interface InventoryFilters {
  search?: string
  category?: string
  status?: InventoryStatus
  minPrice?: number
  maxPrice?: number
}

export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  categories: number
}

export interface CategoryStats {
  name: string
  count: number
  totalValue: number
  color: string
} 