"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UserCheck,
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  DollarSign,
  Building,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  Image,
} from "lucide-react"
import { toast } from "react-hot-toast"

interface EmployeeFormProps {
  mode?: "create" | "edit"
  employeeId?: string
  initialData?: any
  onSuccess?: (employeeId: string) => void
  onCancel?: () => void
}

export default function EmployeeForm({ 
  mode = "create", 
  employeeId, 
  initialData, 
  onSuccess,
  onCancel 
}: EmployeeFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    role: initialData?.role || "",
    designation: initialData?.designation || "",
    joiningDate: initialData?.joiningDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    monthlySalary: initialData?.monthlySalary ? (initialData.monthlySalary / 100).toString() : "",
    bankDetails: initialData?.bankDetails || "",
    notes: initialData?.notes || "",
    avatar: initialData?.avatar || "",
    isActive: initialData?.isActive ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Employee name is required"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = "Joining date is required"
    }

    if (!formData.monthlySalary || isNaN(Number(formData.monthlySalary)) || Number(formData.monthlySalary) <= 0) {
      newErrors.monthlySalary = "Valid monthly salary is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

    try {
      const url = mode === "edit" ? `/api/enhanced-employees/${employeeId}` : "/api/enhanced-employees"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Send salary in rupees; server converts to paise
          monthlySalary: Number(formData.monthlySalary)
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save employee")
      }

      const result = await response.json()
      toast.success(mode === "edit" ? "Employee updated successfully!" : "Employee created successfully!")
      
      if (onSuccess) {
        onSuccess(mode === "edit" ? employeeId! : result.id)
      } else {
        router.push("/admin/employees")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving employee:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save employee")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-purple-600" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`pl-10 ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : 'border-purple-200 focus:border-purple-400 focus:ring-purple-400'}`}
                  placeholder="Enter employee name"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-10 ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : 'border-purple-200 focus:border-purple-400 focus:ring-purple-400'}`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joiningDate" className="text-gray-700">
                Joining Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className={`pl-10 ${errors.joiningDate ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : 'border-purple-200 focus:border-purple-400 focus:ring-purple-400'}`}
                />
              </div>
              {errors.joiningDate && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.joiningDate}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            <span>Professional Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">
                Role
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Enter role"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation" className="text-gray-700">
                Designation
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Enter designation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlySalary" className="text-gray-700">
                Monthly Salary (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="monthlySalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                  className={`pl-10 ${errors.monthlySalary ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : 'border-purple-200 focus:border-purple-400 focus:ring-purple-400'}`}
                  placeholder="Enter monthly salary"
                />
              </div>
              {errors.monthlySalary && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.monthlySalary}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-gray-700">
                Avatar URL
              </Label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  placeholder="Enter avatar URL"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankDetails" className="text-gray-700">
              Bank Details
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                id="bankDetails"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                className="w-full pl-10 min-h-[100px] rounded-lg border border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                placeholder="Enter bank account details"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700">
              Notes
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-10 min-h-[100px] rounded-lg border border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                placeholder="Enter any additional notes"
              />
            </div>
          </div>

          {mode === "edit" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="isActive" className="text-gray-700">
                Employee is active
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {mode === "edit" ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "edit" ? "Update Employee" : "Create Employee"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}



