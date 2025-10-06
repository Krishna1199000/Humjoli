"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Mail, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface OtpVerificationProps {
  email: string
  purpose: 'SIGNUP' | 'LOGIN' | 'RESET'
  onSuccess?: () => void
  onBack?: () => void
  tempData?: any // For signup data
}

export default function OtpVerification({ 
  email, 
  purpose, 
  onSuccess, 
  onBack,
  tempData 
}: OtpVerificationProps) {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Countdown timer
  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    setIsResending(true)
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          purpose,
          ...(purpose === 'SIGNUP' && tempData && { tempData })
        }),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success("OTP sent successfully!")
        startCountdown()
      } else {
        toast.error(data.error || "Failed to send OTP")
      }
    } catch (error) {
      toast.error("Failed to send OTP")
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          code: otp, 
          purpose,
          ...(purpose === 'RESET' && { newPassword })
        }),
      })

      const data = await response.json()
      if (response.ok) {
        if (purpose === 'SIGNUP') {
          toast.success("Account created successfully! Please sign in.")
          router.push("/signin")
        } else if (purpose === 'LOGIN') {
          toast.success("Signed in successfully!")
          router.push("/dashboard")
        } else if (purpose === 'RESET') {
          toast.success("Password reset successfully! Please sign in.")
          router.push("/signin")
        }
        onSuccess?.()
      } else {
        toast.error(data.error || "Invalid OTP")
      }
    } catch (error) {
      toast.error("Failed to verify OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (purpose) {
      case 'SIGNUP': return 'Verify Your Email'
      case 'LOGIN': return 'Enter Verification Code'
      case 'RESET': return 'Reset Your Password'
      default: return 'Verify OTP'
    }
  }

  const getDescription = () => {
    switch (purpose) {
      case 'SIGNUP': return 'We sent a verification code to your email'
      case 'LOGIN': return 'Enter the OTP sent to your email'
      case 'RESET': return 'Enter the OTP and your new password'
      default: return 'Enter the verification code'
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

      {/* Back Button */}
      {onBack && (
        <Button 
          onClick={onBack}
          className="absolute top-6 left-6 z-10 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      {/* OTP Card */}
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
              {purpose === 'RESET' ? <Shield className="h-8 w-8 text-white" /> : <Mail className="h-8 w-8 text-white" />}
            </motion.div>
            <CardTitle className="text-2xl font-serif font-bold text-gray-800">
              {getTitle()}
            </CardTitle>
            <p className="text-gray-600 mt-2">{getDescription()}</p>
            <p className="text-sm text-purple-600 mt-1 font-medium">{email}</p>
          </CardHeader>

          <CardContent className="p-6 relative">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="otp" className="text-gray-700 font-medium">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code</p>
              </div>

              {purpose === 'RESET' && (
                <>
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-white/70"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6 || (purpose === 'RESET' && newPassword !== confirmPassword)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </motion.div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={isResending || countdown > 0}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </Button>
              </div>
            </motion.form>

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










