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
  Building,
  FileText,
  DollarSign,
  UserCheck,
  Briefcase,
  Wallet,
  ClipboardList,
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
      href: "/admin/inventory",
      label: "Inventory",
      icon: Package,
      isActive: pathname === "/admin/inventory"
    },
    {
      href: "/admin/vendors",
      label: "Vendors",
      icon: Building,
      isActive: pathname === "/admin/vendors"
    },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: Users,
      isActive: pathname === "/admin/customers"
    },
    {
      href: "/admin/employees",
      label: "Employees",
      icon: UserCheck,
      isActive: pathname === "/admin/employees"
    },
    {
      href: "/admin/billing",
      label: "Invoices",
      icon: FileText,
      isActive: pathname === "/admin/billing"
    },
    {
      href: "/admin/accounts",
      label: "Accounts",
      icon: DollarSign,
      isActive: pathname === "/admin/accounts"
    },
    {
      href: "/admin/expenses",
      label: "Daily Expense",
      icon: Wallet,
      isActive: pathname === "/admin/expenses"
    },
    {
      href: "/admin/sales-report",
      label: "Sales Report",
      icon: BarChart3,
      isActive: pathname === "/admin/sales-report"
    },
    {
      href: "/admin/delivery-report",
      label: "Delivery Report",
      icon: ClipboardList,
      isActive: pathname === "/admin/delivery-report"
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      icon: Settings,
      isActive: pathname === "/admin/users"
    }
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-12 sm:h-14 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">H</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {title}
              </span>
            </motion.div>
            <Badge className="hidden xs:inline-flex bg-red-100 text-red-700 border-red-200 py-0.5 px-2 text-[10px] sm:text-xs">
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
                    relative px-3 py-1.5 text-sm font-medium transition-all duration-200
                    ${item.isActive 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700" 
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                    }
                  `}
                >
                  <item.icon className="mr-1.5 h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu and Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-medium truncate max-w-[160px]">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="outline"
              size="sm"
              className="hidden sm:flex border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-2.5 py-1.5"
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
              <div className="py-3 space-y-1.5">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.isActive ? "default" : "ghost"}
                      className={`
                        w-full justify-start px-3 py-2 text-sm font-medium transition-all duration-200
                        ${item.isActive 
                          ? "bg-purple-600 text-white" 
                          : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-2.5 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                {/* Mobile User Info */}
                <div className="px-3 py-2.5 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name || session?.user?.email}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Administrator
                      </p>
                    </div>
                    <Button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5"
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