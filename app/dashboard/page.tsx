"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Calendar,
  Users,
  Settings,
  Bell,
  Plus,
  ArrowRight,
  LogOut,
  User,
  Package,
  ShoppingCart,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFavorites: 0,
    totalInventory: 0,
    totalCategories: 0,
    recentActivity: 0
  })

  // Redirect if admin
  if (session?.user?.role === "ADMIN") {
    router.push("/admin/dashboard")
    return null
  }

  // Fetch dashboard data
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's favorites count
      const favoritesResponse = await fetch('/api/favorites')
      const favorites = favoritesResponse.ok ? await favoritesResponse.json() : []
      
      // Fetch inventory stats
      const inventoryResponse = await fetch('/api/inventory')
      const inventory = inventoryResponse.ok ? await inventoryResponse.json() : []
      
      // Calculate stats
      const categories = [...new Set(inventory.map((item: any) => item.category))]
      
      setStats({
        totalFavorites: favorites.length,
        totalInventory: inventory.length,
        totalCategories: categories.length,
        recentActivity: favorites.length // Using favorites as recent activity for now
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const dashboardStats = [
    {
      title: "My Favorites",
      value: stats.totalFavorites.toString(),
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/favorites"
    },
    {
      title: "Available Items",
      value: stats.totalInventory.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/inventory"
    },
    {
      title: "Categories",
      value: stats.totalCategories.toString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/inventory"
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity.toString(),
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/favorites"
    },
  ]

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
                Humjoli Dashboard
              </motion.div>
              <Badge className="bg-purple-100 text-purple-600">Customer</Badge>
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Customer"}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to your customer dashboard.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-2">{loading ? "..." : stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/inventory">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <Package className="mr-2 h-5 w-5" />
                    Browse Inventory
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <Heart className="mr-2 h-5 w-5" />
                    My Favorites
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    <Calendar className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mb-6">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
                Welcome to Humjoli!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Thank you for choosing us for your wedding planning needs. We're here to make your special day perfect.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/inventory">
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <Package className="mr-2 h-5 w-5" />
                    Browse Inventory
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
                    <Heart className="mr-2 h-5 w-5" />
                    My Favorites
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <Button className="bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-full font-semibold transition-all duration-300">
              ← Back to Home
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
} 