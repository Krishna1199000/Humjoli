export interface Salary {
  id: string
  employeeId: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  paymentDate: Date
  createdAt: Date
  updatedAt: Date
  employee?: Employee
}

export interface CreateSalaryRequest {
  employeeId: string
  basicSalary: number
  allowances?: number
  deductions?: number
  paymentDate: string
}

export interface UpdateSalaryRequest {
  basicSalary?: number
  allowances?: number
  deductions?: number
  paymentDate?: string
}

export interface SalaryFilters {
  employeeId?: string
  startDate?: string
  endDate?: string
  search?: string
} 