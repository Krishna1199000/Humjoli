"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, RotateCcw, Check } from "lucide-react"

interface SignatureCaptureProps {
  onSignature: (signature: string | null) => void
  onClose: () => void
  title?: string
  initialSignature?: string | null
}

export default function SignatureCapture({ 
  onSignature, 
  onClose, 
  title = "Customer Signature",
  initialSignature 
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signature, setSignature] = useState<string | null>(initialSignature || null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 200

    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if provided
    if (initialSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasSignature(true)
      }
      img.src = initialSignature
    }

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true)
      const rect = canvas.getBoundingClientRect()
      const x = e instanceof MouseEvent ? e.clientX - rect.left : e.touches[0].clientX - rect.left
      const y = e instanceof MouseEvent ? e.clientY - rect.top : e.touches[0].clientY - rect.top
      
      ctx.beginPath()
      ctx.moveTo(x, y)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e instanceof MouseEvent ? e.clientX - rect.left : e.touches[0].clientX - rect.left
      const y = e instanceof MouseEvent ? e.clientY - rect.top : e.touches[0].clientY - rect.top
      
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const stopDrawing = () => {
      if (isDrawing) {
        setIsDrawing(false)
        setHasSignature(true)
      }
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      startDrawing(e)
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      draw(e)
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      stopDrawing()
    })

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseout', stopDrawing)
      canvas.removeEventListener('touchstart', startDrawing)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [isDrawing, initialSignature])

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSignature(null)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/png')
    setSignature(dataURL)
    onSignature(dataURL)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600 mb-4">
            Please sign in the box below using your mouse or touch screen
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="w-full h-48 border border-gray-200 rounded cursor-crosshair bg-white"
              style={{ touchAction: 'none' }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearSignature}
              disabled={!hasSignature}
              className="text-gray-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="text-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={saveSignature}
                disabled={!hasSignature}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Signature
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


