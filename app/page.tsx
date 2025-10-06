"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LandingNavbar from "@/components/LandingNavbar"
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
  ArrowRight,
  CheckCircle,
  Users,
  Calendar,
  Award,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const services = [
  { 
    icon: Music, 
    title: "Dhol & Music", 
    description: "Traditional dhol players and live music bands for authentic celebrations",
    color: "from-blue-500 to-blue-600"
  },
  { 
    icon: Crown, 
    title: "Pagdi & Accessories", 
    description: "Elegant pagdis and traditional accessories for the perfect look",
    color: "from-purple-500 to-purple-600"
  },
  { 
    icon: Sparkles, 
    title: "DJ Services", 
    description: "Professional DJs with latest sound systems and lighting",
    color: "from-pink-500 to-pink-600"
  },
  { 
    icon: Shirt, 
    title: "Costumes", 
    description: "Beautiful wedding attire and costume rentals for all occasions",
    color: "from-green-500 to-green-600"
  },
  { 
    icon: Heart, 
    title: "Decorations", 
    description: "Stunning floral and themed decorations to transform any venue",
    color: "from-red-500 to-red-600"
  },
  { 
    icon: Camera, 
    title: "Photography", 
    description: "Capture every precious moment with professional photography",
    color: "from-yellow-500 to-yellow-600"
  },
  { 
    icon: Utensils, 
    title: "Catering", 
    description: "Delicious cuisine and catering services for your special day",
    color: "from-orange-500 to-orange-600"
  },
  { 
    icon: Sparkles, 
    title: "Event Planning", 
    description: "Complete wedding planning and coordination from start to finish",
    color: "from-indigo-500 to-indigo-600"
  },
]

const testimonials = [
  {
    name: "Priya & Arjun",
    text: "Humjoli made our dream wedding come true! Every detail was perfect, from the dhol to the decorations. The team was incredibly professional and creative.",
    image: "/image2.png",
    rating: 5,
    location: "Mumbai"
  },
  {
    name: "Sneha & Vikram",
    text: "The team was incredibly professional and creative. Our guests are still talking about the amazing celebration! Everything exceeded our expectations.",
    image: "/image3.png",
    rating: 5,
    location: "Pune"
  },
  {
    name: "Kavya & Rohit",
    text: "From planning to execution, everything was flawless. Thank you for making our special day unforgettable! The attention to detail was remarkable.",
    image: "/image4.png",
    rating: 5,
    location: "Delhi"
  },
]

const stats = [
  { number: "500+", label: "Happy Couples", icon: Heart },
  { number: "50+", label: "Team Members", icon: Users },
  { number: "1000+", label: "Events Completed", icon: Calendar },
  { number: "15+", label: "Years Experience", icon: Award },
]

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  // Redirect authenticated users to inventory
  useEffect(() => {
    if (session) {
      router.push('/inventory')
    }
  }, [session, router])

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Bringing Dreams to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Life
                </span>
              </motion.h1>
              <motion.p
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              >
              Experience the magic of perfectly planned weddings with our comprehensive event management services. 
              From traditional dhol to modern DJ, we create unforgettable celebrations.
              </motion.p>
              <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg shadow-xl shadow-purple-600/25">
                  Start Planning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#services">
                <Button variant="outline" size="lg" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 px-8 py-4 text-lg">
                  Explore Services
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-white" />
                </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
            </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive wedding services designed to make your special day perfect in every detail
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it - hear from the happy couples who trusted us with their special day
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
            <motion.div
              key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-12">
                    <div className="flex justify-center mb-8">
                      <div className="flex space-x-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                    </div>
                    <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 italic leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                    <Image
                          src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {testimonials[currentTestimonial].name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {testimonials[currentTestimonial].location}
                        </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

              <Button
              onClick={prevTestimonial}
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full border-2 border-gray-300 hover:border-purple-500 dark:border-gray-600 dark:hover:border-purple-400"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
              onClick={nextTestimonial}
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full border-2 border-gray-300 hover:border-purple-500 dark:border-gray-600 dark:hover:border-purple-400"
            >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-purple-600 w-8"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Let us help you create the wedding of your dreams. Get in touch today and let's start planning your perfect celebration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
              <Link href="#contact">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
                  Contact Us
                    </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-2xl font-bold">Humjoli</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Bringing dreams to life with comprehensive wedding planning services. 
                From traditional ceremonies to modern celebrations, we make every moment special.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors duration-300">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors duration-300">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="h-10 w-10 rounded-full bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-colors duration-300">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors duration-300">Dhol & Music</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-300">Decorations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-300">Photography</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-300">Catering</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-300">Event Planning</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-purple-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span>info@humjoli.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <span>Mumbai, Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Humjoli Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
