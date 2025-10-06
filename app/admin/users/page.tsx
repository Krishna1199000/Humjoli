"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import AdminNavbar from "@/components/AdminNavbar"
import Link from "next/link"

export default function ManageUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      toast.error("Error fetching users")
    } finally {
      setLoading(false)
    }
  }

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingRole(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        // Refresh users list
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update user role")
      }
    } catch (error) {
      toast.error("Error updating user role")
    } finally {
      setUpdatingRole(null)
    }
  }

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load users on component mount - moved before conditional return
  useEffect(() => {
    if (session?.user?.id && session?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [session])

  // Redirect if not admin - moved after all hooks
  if (!mounted || session?.user?.role !== "ADMIN") {
    if (mounted && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
    return null
  }

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <AdminNavbar title="Humjoli Admin" />



      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
              Manage Users
            </h1>
            <p className="text-gray-600 text-lg">
              View and manage all user accounts
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70 rounded-lg px-3 py-2 text-gray-700 font-medium transition-all duration-300"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  All Users ({filteredUsers.length})
                </CardTitle>
                <Button 
                  onClick={fetchUsers}
                  disabled={loading}
                  className="bg-purple-100 text-purple-600 hover:bg-purple-200 px-3 py-2 rounded-lg font-semibold transition-all duration-300"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                                      <thead>
                    <tr className="border-b border-purple-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Login</th>
                    </tr>
                  </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                          className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 rounded-full">
                                <User className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                                                  <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              disabled={updatingRole === user.id}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 border ${
                                user.role === "ADMIN"
                                  ? "bg-red-100 text-red-600 border-red-200"
                                  : user.role === "EMPLOYEE"
                                  ? "bg-blue-100 text-blue-600 border-blue-200"
                                  : "bg-green-100 text-green-600 border-green-200"
                              } ${updatingRole === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="EMPLOYEE">Employee</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                            {updatingRole === user.id && (
                              <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                            )}
                          </div>
                        </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={`${
                                user.status === "Active"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {user.joined}
                            </div>
                          </td>
                                                  <td className="py-4 px-4 text-gray-600">
                          {user.lastLogin}
                        </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 