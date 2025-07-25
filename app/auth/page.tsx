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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
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
          className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-amber-200/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-200/30 to-rose-200/30 rounded-full blur-xl"
        />
      </div>

      {/* Back to Home */}
      <Link href="/" className="absolute top-6 left-6 z-10">
        <Button className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
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
        <Card className="bg-white/80 backdrop-blur-md border-2 border-rose-100 shadow-2xl overflow-hidden">
          {/* Floral Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-transparent to-amber-100/50 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400" />

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
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full mx-auto mb-4 shadow-lg"
            >
              <Heart className="h-8 w-8 text-white" />
            </motion.div>

            <CardTitle className="text-2xl font-serif font-bold text-gray-800">Welcome to Humjoli</CardTitle>
            <p className="text-gray-600 font-serif italic">Where dreams become beautiful realities</p>
          </CardHeader>

          <CardContent className="p-6 relative">
            {/* Toggle Buttons */}
            <div className="flex bg-rose-50 rounded-full p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                  isLogin ? "bg-white text-rose-600 shadow-md" : "text-gray-600 hover:text-rose-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isLogin ? "bg-white text-rose-600 shadow-md" : "text-gray-600 hover:text-rose-600"
                }`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/70"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </motion.div>
                )}

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
                    className="mt-1 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/70"
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
                      className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/70 pr-10"
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

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/70"
                      placeholder="Confirm your password"
                      required={!isLogin}
                    />
                  </motion.div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </motion.div>
              </motion.form>
            </AnimatePresence>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-rose-600 hover:text-rose-700 font-medium">
                  {isLogin ? "Sign up here" : "Sign in here"}
                </button>
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-rose-300 to-amber-300 rounded-full opacity-60" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-amber-300 to-rose-300 rounded-full opacity-60" />
          </CardContent>
        </Card>

        {/* Floating Hearts */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -top-4 -right-4 text-rose-400 opacity-60"
        >
          <Heart className="h-6 w-6 fill-current" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-4 -left-4 text-amber-400 opacity-60"
        >
          <Heart className="h-4 w-4 fill-current" />
        </motion.div>
      </motion.div>
    </div>
  )
}
