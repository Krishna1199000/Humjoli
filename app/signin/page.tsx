"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Redirect if already authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-purple-600 text-lg">Loading...</div>
      </div>
    )
  }

  if (session) {
    router.push("/dashboard")
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
      } else {
        toast.success("Signed in successfully!")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-purple-300/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple-300/30 to-purple-200/30 rounded-full blur-xl"
        />
      </div>

      {/* Back to Home */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <Button className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/80 backdrop-blur-md border-2 border-purple-100 shadow-2xl overflow-hidden">
          {/* Floral Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-purple-200/50 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400" />

          <CardHeader className="text-center pb-2 relative">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-4 shadow-lg"
            >
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-serif font-bold text-gray-800">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your Humjoli account</p>
          </CardHeader>

          <CardContent className="p-6 relative">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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
                  className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </motion.div>
            </motion.form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full opacity-60" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-300 rounded-full opacity-60" />
          </CardContent>
        </Card>

        {/* Floating Decorative Icons */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -top-4 -right-4 text-purple-400 opacity-60"
        >
          <Heart className="h-6 w-6 fill-current" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-4 -left-4 text-purple-400 opacity-60"
        >
          <Heart className="h-4 w-4 fill-current" />
        </motion.div>
      </motion.div>
    </div>
  )
} 