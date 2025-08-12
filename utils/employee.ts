import { 
  WorkedHours, 
  SalaryCalculation, 
  AttendanceStatus, 
  AttendanceSettings,
  SmartAttendanceReport 
} from '@/types/employee'

// Default attendance settings
export const DEFAULT_ATTENDANCE_SETTINGS: AttendanceSettings = {
  workingHoursPerDay: 8,
  overtimeThreshold: 8,
  lateThreshold: 15, // minutes
  earlyDepartureThreshold: 15, // minutes
  workingDaysPerMonth: 26,
  overtimeRateMultiplier: 1.5,
  latePenaltyPerMinute: 10, // ₹10 per minute
  earlyDeparturePenaltyPerMinute: 10 // ₹10 per minute
}

/**
 * Calculate worked hours between clock in and clock out times
 */
export function calculateWorkedHours(clockIn: Date, clockOut: Date): WorkedHours {
  const diffMs = clockOut.getTime() - clockIn.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  return {
    hours,
    minutes,
    totalMinutes: diffMinutes
  }
}

/**
 * Format worked hours as a readable string
 */
export function formatWorkedHours(hours: number, minutes: number): string {
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

/**
 * Smart salary calculation with overtime, penalties, and bonuses
 */
export function calculateSmartSalary(
  baseSalary: number,
  workedDays: number,
  totalHours: number,
  overtimeHours: number = 0,
  lateMinutes: number = 0,
  earlyDepartureMinutes: number = 0,
  deductions: number = 0,
  bonus: number = 0,
  settings: AttendanceSettings = DEFAULT_ATTENDANCE_SETTINGS
): SalaryCalculation {
  const dailyRate = baseSalary / settings.workingDaysPerMonth
  const hourlyRate = dailyRate / settings.workingHoursPerDay
  const overtimeRate = hourlyRate * settings.overtimeRateMultiplier
  
  // Calculate penalties
  const latePenalty = lateMinutes * settings.latePenaltyPerMinute
  const earlyDeparturePenalty = earlyDepartureMinutes * settings.earlyDeparturePenaltyPerMinute
  
  // Calculate gross salary
  const regularHours = Math.min(totalHours, workedDays * settings.workingHoursPerDay)
  const regularPay = regularHours * hourlyRate
  const overtimePay = overtimeHours * overtimeRate
  const grossSalary = regularPay + overtimePay
  
  // Calculate net salary
  const netSalary = grossSalary - deductions - latePenalty - earlyDeparturePenalty + bonus
  
  return {
    baseSalary,
    workedDays,
    totalHours,
    overtimeHours,
    dailyRate,
    hourlyRate,
    overtimeRate,
    grossSalary,
    deductions,
    bonus,
    netSalary,
    latePenalty,
    earlyDeparturePenalty
  }
}

/**
 * Analyze attendance patterns and calculate smart metrics
 */
export function analyzeAttendance(
  attendanceRecords: any[],
  settings: AttendanceSettings = DEFAULT_ATTENDANCE_SETTINGS
): SmartAttendanceReport {
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter(record => 
    ['PRESENT', 'LATE', 'EARLY_DEPARTURE'].includes(record.status)
  ).length
  const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length
  const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length
  const earlyDepartureDays = attendanceRecords.filter(record => record.status === 'EARLY_DEPARTURE').length
  
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0)
  const overtimeHours = attendanceRecords.reduce((sum, record) => sum + (record.overtime || 0), 0)
  const averageDailyHours = totalDays > 0 ? totalHours / totalDays : 0
  
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
  
  // Calculate punctuality score (0-100)
  const punctualityScore = totalDays > 0 
    ? Math.max(0, 100 - (lateDays / totalDays) * 100 - (earlyDepartureDays / totalDays) * 50)
    : 100
  
  // Calculate efficiency score based on hours worked vs expected
  const expectedHours = presentDays * settings.workingHoursPerDay
  const efficiencyScore = expectedHours > 0 
    ? Math.min(100, (totalHours / expectedHours) * 100)
    : 100
  
  return {
    employeeId: attendanceRecords[0]?.employeeId || '',
    employeeName: attendanceRecords[0]?.employeeName || '',
    employeeCode: attendanceRecords[0]?.employeeCode || '',
    month: new Date(attendanceRecords[0]?.date || '').getMonth() + 1,
    year: new Date(attendanceRecords[0]?.date || '').getFullYear(),
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    earlyDepartureDays,
    totalHours,
    overtimeHours,
    averageDailyHours,
    attendancePercentage,
    punctualityScore,
    efficiencyScore
  }
}

/**
 * Determine attendance status based on clock times
 */
export function determineAttendanceStatus(
  clockIn: Date | null,
  clockOut: Date | null,
  settings: AttendanceSettings = DEFAULT_ATTENDANCE_SETTINGS
): AttendanceStatus {
  if (!clockIn) return 'ABSENT'
  
  const standardStartTime = new Date(clockIn)
  standardStartTime.setHours(9, 0, 0, 0) // Assuming 9 AM start
  
  const standardEndTime = new Date(clockIn)
  standardEndTime.setHours(17, 0, 0, 0) // Assuming 5 PM end
  
  const lateThreshold = new Date(standardStartTime.getTime() + settings.lateThreshold * 60000)
  const earlyDepartureThreshold = new Date(standardEndTime.getTime() - settings.earlyDepartureThreshold * 60000)
  
  if (clockIn > lateThreshold) {
    return 'LATE'
  }
  
  if (clockOut && clockOut < earlyDepartureThreshold) {
    return 'EARLY_DEPARTURE'
  }
  
  if (clockIn <= lateThreshold && (!clockOut || clockOut >= earlyDepartureThreshold)) {
    return 'PRESENT'
  }
  
  return 'HALF_DAY'
}

/**
 * Calculate overtime hours
 */
export function calculateOvertime(
  totalHours: number,
  workedDays: number,
  settings: AttendanceSettings = DEFAULT_ATTENDANCE_SETTINGS
): number {
  const expectedHours = workedDays * settings.workingHoursPerDay
  return Math.max(0, totalHours - expectedHours)
}

/**
 * Get attendance status color for UI
 */
export function getAttendanceStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'text-green-600 bg-green-100'
    case 'ABSENT':
      return 'text-red-600 bg-red-100'
    case 'HALF_DAY':
      return 'text-yellow-600 bg-yellow-100'
    case 'LEAVE':
      return 'text-blue-600 bg-blue-100'
    case 'HOLIDAY':
      return 'text-purple-600 bg-purple-100'
    case 'LATE':
      return 'text-orange-600 bg-orange-100'
    case 'EARLY_DEPARTURE':
      return 'text-pink-600 bg-pink-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Get salary status color for UI
 */
export function getSalaryStatusColor(status: 'PENDING' | 'PAID' | 'CANCELLED'): string {
  switch (status) {
    case 'PAID':
      return 'text-green-600 bg-green-100'
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100'
    case 'CANCELLED':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

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
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Generate employee code
 */
export function generateEmployeeCode(lastCode: string | null): string {
  if (!lastCode) {
    return 'H00001'
  }
  
  const lastNumber = parseInt(lastCode.substring(1))
  const nextNumber = lastNumber + 1
  return `H${nextNumber.toString().padStart(5, '0')}`
}

/**
 * Validate employee data
 */
export function validateEmployeeData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.name?.trim()) {
    errors.push('Name is required')
  }
  
  if (!data.mobile?.trim()) {
    errors.push('Mobile number is required')
  } else if (!/^[6-9]\d{9}$/.test(data.mobile)) {
    errors.push('Invalid mobile number format')
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format')
  }
  
  if (data.salary < 0) {
    errors.push('Salary cannot be negative')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  }
}

/**
 * Get month name from number
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Unknown'
}

/**
 * Check if employee is currently clocked in
 */
export function isEmployeeClockedIn(attendance: any): boolean {
  if (!attendance || !attendance.clockIn) {
    return false
  }
  
  return attendance.clockIn && !attendance.clockOut
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calculate total working days in a month
 */
export function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate()
  let workingDays = 0
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    
    // Exclude Sundays (0) and Saturdays (6)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++
    }
  }
  
  return workingDays
}

/**
 * Get attendance insights for dashboard
 */
export function getAttendanceInsights(attendanceRecords: any[]): {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  earlyDepartureDays: number
  averageHours: number
  totalOvertime: number
  attendancePercentage: number
  punctualityScore: number
} {
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter(record => 
    ['PRESENT', 'LATE', 'EARLY_DEPARTURE'].includes(record.status)
  ).length
  const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length
  const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length
  const earlyDepartureDays = attendanceRecords.filter(record => record.status === 'EARLY_DEPARTURE').length
  
  const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0)
  const totalOvertime = attendanceRecords.reduce((sum, record) => sum + (record.overtime || 0), 0)
  const averageHours = totalDays > 0 ? totalHours / totalDays : 0
  
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
  const punctualityScore = totalDays > 0 
    ? Math.max(0, 100 - (lateDays / totalDays) * 100 - (earlyDepartureDays / totalDays) * 50)
    : 100
  
  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    earlyDepartureDays,
    averageHours,
    totalOvertime,
    attendancePercentage,
    punctualityScore
  }
} 