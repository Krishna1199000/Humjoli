export interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  gstNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerRequest {
  name: string
  email?: string
  phone: string
  address?: string
  gstNumber?: string
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  gstNumber?: string
}

export interface CustomerFilters {
  search?: string
  email?: string
  phone?: string
} 