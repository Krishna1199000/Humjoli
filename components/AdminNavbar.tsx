"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  LogOut,
  User,
  Settings,
  CreditCard,
  Package,
  Menu,
  X,
  BarChart3,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminNavbarProps {
  title?: string
}

export default function AdminNavbar({ title = "Humjoli Admin" }: AdminNavbarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Settings,
      isActive: pathname === "/admin/dashboard"
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      icon: Users,
      isActive: pathname === "/admin/users"
    },
    {
      href: "/admin/sales-report",
      label: "Sales Report",
      icon: BarChart3,
      isActive: pathname === "/admin/sales-report"
    },
    {
      href: "/admin/billing",
      label: "Billing",
      icon: CreditCard,
      isActive: pathname === "/admin/billing"
    },
    {
      href: "/admin/inventory",
      label: "Inventory",
      icon: Package,
      isActive: pathname === "/admin/inventory"
    }
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {title}
              </span>
            </motion.div>
            <Badge className="bg-red-100 text-red-700 border-red-200">
              Administrator
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={item.isActive ? "default" : "ghost"}
                  className={`
                    relative px-4 py-2 text-sm font-medium transition-all duration-200
                    ${item.isActive 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                    }
                  `}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu and Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="outline"
              size="sm"
              className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.isActive ? "default" : "ghost"}
                      className={`
                        w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-200
                        ${item.isActive 
                          ? "bg-purple-600 text-white" 
                          : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                {/* Mobile User Info */}
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {session?.user?.name || session?.user?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Administrator
                      </p>
                    </div>
                    <Button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
} 