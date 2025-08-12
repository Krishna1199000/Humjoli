"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Music,
  Crown,
  Shirt,
  Sparkles,
  Camera,
  Utensils,
  Star,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"

const fadeInUp = {
  initial: { opacity: 0, y: 60, transition: { duration: 0.6, ease: "easeOut" } },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const services = [
  { icon: Music, title: "Dhol & Music", description: "Traditional dhol players and live music bands" },
  { icon: Crown, title: "Pagdi & Accessories", description: "Elegant pagdis and traditional accessories" },
  { icon: Sparkles, title: "DJ Services", description: "Professional DJs with latest sound systems" },
  { icon: Shirt, title: "Costumes", description: "Beautiful wedding attire and costume rentals" },
  { icon: Heart, title: "Decorations", description: "Stunning floral and themed decorations" },
  { icon: Camera, title: "Photography", description: "Capture every precious moment beautifully" },
  { icon: Utensils, title: "Catering", description: "Delicious cuisine for your special day" },
  { icon: Sparkles, title: "Event Planning", description: "Complete wedding planning and coordination" },
]

const testimonials = [
  {
    name: "Priya & Arjun",
    text: "Humjoli made our dream wedding come true! Every detail was perfect, from the dhol to the decorations.",
    image: "/image2.png?height=80&width=80",
    rating: 5,
  },
  {
    name: "Sneha & Vikram",
    text: "The team was incredibly professional and creative. Our guests are still talking about the amazing celebration!",
    image: "/image3.png?height=80&width=80",
    rating: 5,
  },
  {
    name: "Kavya & Rohit",
    text: "From planning to execution, everything was flawless. Thank you for making our special day unforgettable!",
    image: "/image4.png?height=80&width=80",
    rating: 5,
  },
]

export default function LandingPage() {
  const { data: session } = useSession()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-purple-100"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="text-xl sm:text-2xl font-serif font-bold text-purple-600">
            Humjoli
          </motion.div>
          <div className="hidden lg:flex space-x-4 xl:space-x-8">
            {["Home", "Services", "Contact"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                whileHover={{ scale: 1.05, color: "#7c3aed" }}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                {item}
              </motion.a>
            ))}
            <Link href="/about">
              <motion.a
                whileHover={{ scale: 1.05, color: "#7c3aed" }}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer"
              >
                About Us
              </motion.a>
            </Link>
            <Link href="/inventory">
              <motion.a
                whileHover={{ scale: 1.05, color: "#7c3aed" }}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer"
              >
                Inventory
              </motion.a>
            </Link>
            {session?.user?.id && (
              <Link href="/favorites">
                <motion.a
                  whileHover={{ scale: 1.05, color: "#7c3aed" }}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer"
                >
                  My Favorites
                </motion.a>
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/master">
                <motion.a
                  whileHover={{ scale: 1.05, color: "#7c3aed" }}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer"
                >
                  Master
                </motion.a>
              </Link>
            )}
          </div>
          {session ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-purple-600">
                <User className="h-4 w-4" />
                <span className="font-medium text-sm lg:text-base">{session.user?.name || session.user?.email}</span>
                <Badge className={`${
                  session.user?.role === "ADMIN" 
                    ? "bg-red-100 text-red-600" 
                    : "bg-purple-100 text-purple-600"
                } text-xs`}>
                  {session.user?.role === "ADMIN" ? "Admin" : "Customer"}
                </Badge>
              </div>
              <Link href={session.user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-3 sm:px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 bg-transparent p-2 sm:px-4"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/signin">
                <Button
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 bg-transparent px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-3 sm:px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 sm:space-y-6 text-center lg:text-left"
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-800 leading-tight"
                {...fadeInUp}
              >
                Bringing Dreams to Life with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700">
                  Humjoli
                </span>
              </motion.h1>

              <motion.p
                className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                We manage Dhol, Pagdi, DJ, Costumes & everything for your perfect wedding
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Plan Your Wedding
                </Button>
              </motion.div>
            </motion.div>

            <motion.div style={{ y: y1 }} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* Floral Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-purple-100 to-purple-200 rounded-full p-8 transform rotate-12">
                  <div className="w-full h-full rounded-full bg-white/50 backdrop-blur-sm"></div>
                </div>

                {/* Couple Photo */}
                <div className="relative z-10 rounded-full overflow-hidden border-4 sm:border-8 border-white shadow-2xl w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto lg:mx-0">
                  <Image
                    src="/Image1.png"
                    alt="Beautiful Wedding Couple"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Elements */}
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
                  className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full p-3 shadow-lg"
                >
                  <Heart className="h-6 w-6 text-white" />
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
                  className="absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full p-3 shadow-lg"
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 px-4 bg-gradient-to-br from-white to-purple-50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-600 hover:bg-purple-200">Our Services</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-800 mb-4">
              Everything You Need for Your Perfect Day
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              From traditional ceremonies to modern celebrations, we handle every detail with care and expertise
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="group"
              >
                <Card className="h-full bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                                              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mb-4 group-hover:shadow-lg transition-shadow"
                    >
                      <service.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge className="mb-4 bg-amber-100 text-amber-600 hover:bg-amber-200">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-800 mb-4">
              Happy Couples, Beautiful Memories
            </h2>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
                            <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-xl">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 italic font-serif leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                    <Image
                      src={testimonials[currentTestimonial].image || "/placeholder.svg"}
                      alt={testimonials[currentTestimonial].name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-purple-200 w-12 h-12 sm:w-15 sm:h-15"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{testimonials[currentTestimonial].name}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">Happy Couple</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                                            index === currentTestimonial ? "bg-purple-500 scale-125" : "bg-purple-200 hover:bg-purple-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Enhanced Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700">
          {/* Animated Background Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"
          />
        </div>

        {/* Content */}
        <motion.div 
          style={{ y: y2 }} 
          className="container mx-auto text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {/* Decorative Elements */}
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-8 shadow-2xl"
            >
              <Heart className="h-10 w-10 text-white" />
            </motion.div>

            {/* Enhanced Typography */}
            <motion.h2 
              className="text-5xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Plan Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white">
                Dream Wedding?
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Let us bring your vision to life with our expert planning and beautiful execution
            </motion.p>

            {/* Enhanced Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {session ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/dashboard">
                      <Button className="bg-white text-purple-600 hover:bg-purple-50 px-10 py-5 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 border-2 border-white/20 backdrop-blur-sm">
                        <Heart className="mr-3 h-6 w-6" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-10 py-5 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 backdrop-blur-sm">
                      <Mail className="mr-3 h-6 w-6" />
                      Get Quote
                    </Button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-white text-purple-600 hover:bg-purple-50 px-10 py-5 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 border-2 border-white/20 backdrop-blur-sm">
                      <Phone className="mr-3 h-6 w-6" />
                      Call Us Now
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-10 py-5 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 backdrop-blur-sm">
                      <Mail className="mr-3 h-6 w-6" />
                      Get Quote
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Additional Decorative Elements */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="mt-12 flex justify-center space-x-4"
            >
              <div className="w-3 h-3 bg-white/60 rounded-full"></div>
              <div className="w-3 h-3 bg-white/40 rounded-full"></div>
              <div className="w-3 h-3 bg-white/60 rounded-full"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-purple-400 mb-4">Humjoli</h3>
              <p className="text-gray-400 mb-4">
                Creating magical wedding experiences with traditional charm and modern elegance.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </motion.a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Wedding Planning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Dhol & Music
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Decorations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Photography
                  </a>
                </li>
                <li>
                  <Link href="/inventory" className="hover:text-purple-400 transition-colors">
                    Wedding Supplies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Portfolio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-purple-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-purple-400" />
                  <span>hello@humjoli.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-purple-400" />
                  <span>Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Humjoli. All rights reserved. Made with ❤️ for beautiful weddings.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
