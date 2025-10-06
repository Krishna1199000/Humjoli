"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OtpLogin() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const sendOtp = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send OTP')
      setStep(2)
      setMessage('OTP sent to your email')
    } catch (e: any) {
      setMessage(e.message)
    } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to verify OTP')
      setMessage('Logged in!')
    } catch (e: any) {
      setMessage(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
        <CardContent className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Sign in with Email</h3>
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
              <Button onClick={sendOtp} disabled={loading || !email} className="w-full bg-purple-600 hover:bg-purple-700 text-white">{loading ? 'Sending…' : 'Send OTP'}</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Enter OTP</h3>
              <Input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e)=>setCode(e.target.value)} className="tracking-widest text-center border-purple-200 focus:border-purple-400 focus:ring-purple-400" />
              <Button onClick={verifyOtp} disabled={loading || code.length !== 6} className="w-full bg-purple-600 hover:bg-purple-700 text-white">{loading ? 'Verifying…' : 'Verify & Sign In'}</Button>
              <Button variant="outline" onClick={()=>setStep(1)} className="w-full">Back</Button>
            </div>
          )}
          {message && <div className="text-sm text-center text-gray-600">{message}</div>}
        </CardContent>
      </Card>
    </div>
  )
}












