export interface Employee {
  id: string
  code: string
  name: string
  mobile: string
  address1?: string
  address2?: string
  city?: string
  pin?: string
  tel?: string
  email?: string
  contact?: string
  panAadhar?: string
  baseSalary: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  clockIn?: string
  clockOut?: string
  status: AttendanceStatus
  notes?: string
  totalHours?: number
  overtime?: number
  lateMinutes?: number
  earlyDeparture?: number
}

export interface SalaryRecord {
  id: string
  employeeId: string
  month: number
  year: number
  baseSalary: number
  workedDays: number
  totalHours: number
  overtimeHours: number
  deductions: number
  bonus: number
  netSalary: number
  status: SalaryStatus
  paidAt?: string
  attendanceData: AttendanceRecord[]
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'LATE' | 'EARLY_DEPARTURE'
export type SalaryStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface EmployeeFormData {
  name: string
  mobile: string
  address1?: string
  address2?: string
  city?: string
  pin?: string
  tel?: string
  email?: string
  contact?: string
  panAadhar?: string
  baseSalary: number
  isActive: boolean
}

export interface AttendanceFormData {
  employeeId: string
  date: string
  clockIn?: string
  clockOut?: string
  status: AttendanceStatus
  notes?: string
}

export interface SalaryFormData {
  employeeId: string
  month: number
  year: number
  deductions?: number
  bonus?: number
}

export interface EmployeeFilters {
  search?: string
  isActive?: boolean
  city?: string
}

export interface AttendanceFilters {
  employeeId?: string
  date?: string
  status?: AttendanceStatus
}

export interface SalaryFilters {
  employeeId?: string
  month?: number
  year?: number
  status?: SalaryStatus
}

export interface WorkedHours {
  hours: number
  minutes: number
  totalMinutes: number
}

export interface SalaryCalculation {
  baseSalary: number
  workedDays: number
  totalHours: number
  overtimeHours: number
  dailyRate: number
  hourlyRate: number
  overtimeRate: number
  grossSalary: number
  deductions: number
  bonus: number
  netSalary: number
  latePenalty: number
  earlyDeparturePenalty: number
}

export interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  totalSalaryThisMonth: number
  averageAttendance: number
}

export interface AttendanceSettings {
  workingHoursPerDay: number
  overtimeThreshold: number
  lateThreshold: number
  earlyDepartureThreshold: number
  workingDaysPerMonth: number
  overtimeRateMultiplier: number
  latePenaltyPerMinute: number
  earlyDeparturePenaltyPerMinute: number
}

export interface SmartAttendanceReport {
  employeeId: string
  employeeName: string
  employeeCode: string
  month: number
  year: number
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  earlyDepartureDays: number
  totalHours: number
  overtimeHours: number
  averageDailyHours: number
  attendancePercentage: number
  punctualityScore: number
  efficiencyScore: number
} 