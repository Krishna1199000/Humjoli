"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  ArrowLeft,
  Save,
  Loader2,
  User,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { EmployeeFormData } from "@/types/employee"
import { validateEmployeeData } from "@/utils/employee"

export default function AddEmployeePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: "",
    mobile: "",
    address1: "",
    address2: "",
    city: "",
    pin: "",
    tel: "",
    email: "",
    contact: "",
    panAadhar: "",
    baseSalary: 0,
    isActive: true,
  })

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not admin
  if (!mounted || session?.user?.role !== "ADMIN") {
    if (mounted && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      const validation = validateEmployeeData(formData)
      if (!validation.isValid) {
        toast.error(validation.errors[0])
        return
      }

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          toast.error(data.details[0])
        } else {
          toast.error(data.error || 'Failed to create employee')
        }
        return
      }

      toast.success('Employee created successfully!')
      router.push('/master/employee')
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-serif font-bold text-purple-600"
              >
                Add Employee
              </motion.div>
              <Badge className="bg-red-100 text-red-600">Administrator</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
              </div>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 bg-transparent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                Add New Employee
              </h1>
              <p className="text-gray-600 text-lg">
                Create a new employee record with complete information
              </p>
            </div>
            <Link href="/master/employee">
              <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Employees
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                <UserPlus className="mr-2 h-5 w-5 text-purple-600" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobile" className="text-gray-700 font-medium">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="baseSalary" className="text-gray-700 font-medium">
                      Base Salary *
                    </Label>
                    <Input
                      id="baseSalary"
                      name="baseSalary"
                      type="number"
                      value={formData.baseSalary}
                      onChange={handleInputChange}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      placeholder="Enter base salary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t border-purple-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="address1" className="text-gray-700 font-medium">
                        Address Line 1
                      </Label>
                      <Input
                        id="address1"
                        name="address1"
                        type="text"
                        value={formData.address1}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter address line 1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address2" className="text-gray-700 font-medium">
                        Address Line 2
                      </Label>
                      <Input
                        id="address2"
                        name="address2"
                        type="text"
                        value={formData.address2}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter address line 2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-gray-700 font-medium">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pin" className="text-gray-700 font-medium">
                        PIN Code
                      </Label>
                      <Input
                        id="pin"
                        name="pin"
                        type="text"
                        value={formData.pin}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter PIN code"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-t border-purple-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="tel" className="text-gray-700 font-medium">
                        Telephone
                      </Label>
                      <Input
                        id="tel"
                        name="tel"
                        type="tel"
                        value={formData.tel}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter telephone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact" className="text-gray-700 font-medium">
                        Emergency Contact
                      </Label>
                      <Input
                        id="contact"
                        name="contact"
                        type="text"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter emergency contact"
                      />
                    </div>

                    <div>
                      <Label htmlFor="panAadhar" className="text-gray-700 font-medium">
                        PAN/Aadhar Number
                      </Label>
                      <Input
                        id="panAadhar"
                        name="panAadhar"
                        type="text"
                        value={formData.panAadhar}
                        onChange={handleInputChange}
                        className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                        placeholder="Enter PAN or Aadhar number"
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border-t border-purple-200 pt-6">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-400 h-4 w-4"
                    />
                    <Label htmlFor="isActive" className="text-gray-700 font-medium">
                      Employee is active
                    </Label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="border-t border-purple-200 pt-6 flex justify-end space-x-4">
                  <Link href="/master/employee">
                    <Button
                      type="button"
                      className="border border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 px-4 py-2 rounded-md transition-colors duration-200"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Link>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Employee...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Employee
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 