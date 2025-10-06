import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, code, purpose = 'LOGIN', newPassword } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Get latest OTP for this email
    const latest = await prisma.otp.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: 'desc' }
    })
    if (!latest) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    if (latest.code !== code) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    if (latest.expiresAt < new Date()) {
      // delete expired entry
      await prisma.otp.delete({ where: { id: latest.id } })
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
    }

    // OTP valid -> delete so it is single-use
    await prisma.otp.delete({ where: { id: latest.id } })

    // Purpose-specific flows
    if (purpose === 'SIGNUP') {
      // Get temporary signup data from OTP record
      const tempData = latest.tempData as any
      if (!tempData) {
        return NextResponse.json({ error: 'No signup data found' }, { status: 400 })
      }

      // Create permanent user with signup data
      const user = await prisma.user.create({
        data: {
          email,
          name: tempData.name,
          password: tempData.password, // This should be hashed in production
          role: 'CUSTOMER'
        }
      })

      // Clean up any other pending OTPs for this email
      await prisma.otp.deleteMany({
        where: { email, purpose: 'SIGNUP' }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Account created successfully. You can now sign in.',
        user: { id: user.id, email: user.email, name: user.name }
      })
    }

    if (purpose === 'RESET') {
      if (!newPassword) {
        return NextResponse.json({ error: 'newPassword required for RESET' }, { status: 400 })
      }
      // if you store passwords (for email+password logins), hash here
      // In this app NextAuth might be used; adapt as needed
      await prisma.user.update({ where: { email } as any, data: { password: newPassword } as any })
      return NextResponse.json({ ok: true, reset: true })
    }

    // LOGIN or SIGNUP -> create JWT session cookie
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1d' })
    const res = NextResponse.json({ ok: true })
    res.cookies.set('otp_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })
    return res
  } catch (e) {
    console.error('verify-otp error', e)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}


