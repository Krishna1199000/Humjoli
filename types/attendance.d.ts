export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY'

export interface Attendance {
  id: string
  employeeId: string
  date: Date
  status: AttendanceStatus
  checkInTime?: Date
  checkOutTime?: Date
  totalHours?: number
  remarks?: string
  createdAt: Date
  updatedAt: Date
  employee?: Employee
}

export interface CreateAttendanceRequest {
  employeeId: string
  date: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  remarks?: string
}

export interface UpdateAttendanceRequest {
  status?: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  totalHours?: number
  remarks?: string
}

export interface AttendanceFilters {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: AttendanceStatus
  search?: string
}

export interface MonthlyAttendanceReport {
  employeeId: string
  employeeName: string
  month: string
  year: number
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  halfDays: number
  totalHours: number
  attendanceRate: number
} 