import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { generateOtp } from "@/lib/generateOtp"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// simple in-memory rate limiter (email -> timestamps)
const requestMap = new Map<string, number[]>()
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 5

export async function POST(req: NextRequest) {
  try {
    const { email, purpose = 'LOGIN', tempData } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // rate limit by email
    const now = Date.now()
    const arr = requestMap.get(email) || []
    const filtered = arr.filter(ts => now - ts < WINDOW_MS)
    if (filtered.length >= MAX_REQUESTS) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }
    filtered.push(now)
    requestMap.set(email, filtered)

    const code = generateOtp(6)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // For signup, store temporary data in the OTP record
    const otpData: any = { email, code, expiresAt, purpose }
    if (purpose === 'SIGNUP' && tempData) {
      otpData.tempData = tempData
    }
    
    await prisma.otp.create({ data: otpData })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
    await transporter.sendMail({
      from,
      to: email,
      subject: `Your ${purpose} OTP Code`,
      text: `Your ${purpose} OTP is ${code}. It expires in 5 minutes.`,
      html: `<p>Your <b>${purpose}</b> OTP is <b>${code}</b>. It expires in 5 minutes.</p>`
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('send-otp error', e)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}


