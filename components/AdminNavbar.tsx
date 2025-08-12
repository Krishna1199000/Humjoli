"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  LogOut,
  User,
  Settings,
  CreditCard,
  Package,
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

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-serif font-bold text-purple-600"
            >
              {title}
            </motion.div>
            <Badge className="bg-red-100 text-red-600">Administrator</Badge>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                    item.isActive
                      ? "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
                      : "bg-white border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                  }`}
                >
                  <item.icon className="mr-1 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

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
  )
} 