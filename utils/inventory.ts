import { InventoryItem, InventoryStatus } from '@/types/inventory'

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: InventoryStatus): string {
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

/**
 * Calculate inventory statistics
 */
export function calculateInventoryStats(items: InventoryItem[]) {
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const lowStockItems = items.filter(item => item.status === 'LOW_STOCK').length
  const outOfStockItems = items.filter(item => item.status === 'OUT_OF_STOCK').length
  const categories = [...new Set(items.map(item => item.category))].length

  return {
    totalItems,
    totalValue,
    lowStockItems,
    outOfStockItems,
    categories
  }
}

/**
 * Get category statistics
 */
export function getCategoryStats(items: InventoryItem[]) {
  const categoryMap = new Map<string, { count: number; totalValue: number }>()
  
  items.forEach(item => {
    const existing = categoryMap.get(item.category) || { count: 0, totalValue: 0 }
    categoryMap.set(item.category, {
      count: existing.count + 1,
      totalValue: existing.totalValue + (item.price * item.quantity)
    })
  })

  return Array.from(categoryMap.entries()).map(([name, stats]) => ({
    name,
    count: stats.count,
    totalValue: stats.totalValue,
    color: 'bg-purple-100 text-purple-600'
  }))
}

/**
 * Determine inventory status based on quantity and minimum stock
 */
export function determineStatus(quantity: number, minStock: number): InventoryStatus {
  if (quantity === 0) {
    return 'OUT_OF_STOCK'
  } else if (quantity <= minStock) {
    return 'LOW_STOCK'
  } else {
    return 'IN_STOCK'
  }
}

/**
 * Validate inventory form data
 */
export function validateInventoryData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.name?.trim()) {
    errors.push('Name is required')
  }
  
  if (!data.category?.trim()) {
    errors.push('Category is required')
  }
  
  if (data.quantity < 0) {
    errors.push('Quantity cannot be negative')
  }
  
  if (data.price < 0) {
    errors.push('Price cannot be negative')
  }
  
  if (data.minStock < 0) {
    errors.push('Minimum stock cannot be negative')
  }
  
  if (data.maxStock && data.maxStock < data.minStock) {
    errors.push('Maximum stock cannot be less than minimum stock')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 