"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Calendar,
  MapPin,
  Users,
  Star,
  ArrowLeft,
  Sparkles,
  Trophy,
  TrendingUp,
  Users2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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

const milestones = [
  {
    year: "2002",
    title: "The Beginning",
    description: "Started at Malad West, Mumbai 97",
    icon: Calendar,
  },
  {
    year: "2002-2022",
    title: "20 Years of Growth",
    description: "Building trust and reliability",
    icon: TrendingUp,
  },
  {
    year: "2022",
    title: "Dream Realized",
    description: "Successfully achieved childhood dream",
    icon: Trophy,
  },
  {
    year: "2024+",
    title: "Future Vision",
    description: "Moving forward with bigger vision",
    icon: Sparkles,
  },
]

const values = [
  {
    icon: Heart,
    title: "Trust & Reliability",
    description: "Building lasting relationships with families",
  },
  {
    icon: Users,
    title: "Hassle-Free Service",
    description: "Let families enjoy and look after guests",
  },
  {
    icon: Users2,
    title: "Community Support",
    description: "Grateful for all supporters and loved ones",
  },
  {
    icon: Star,
    title: "Quality Commitment",
    description: "Dedicated to excellence in every event",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Back to Home */}
      <Link href="/" className="fixed top-6 left-6 z-50">
        <Button className="bg-white/80 backdrop-blur-md border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 shadow-lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 overflow-hidden">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-600 hover:bg-purple-200">Our Story</Badge>
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-gray-800 mb-6 leading-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700">
                Humjoli
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A journey of trust, reliability, and making dreams come true since 2002
            </p>
          </motion.div>

          {/* Founder Story */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <Card className="bg-white/80 backdrop-blur-md border-2 border-purple-100 shadow-2xl overflow-hidden">
              <CardContent className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-800">Our Founder</h2>
                        <p className="text-purple-600 font-medium">Naveen Rameshchandra Agrawal</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p className="text-lg">
                        <strong>Humjoli</strong> owned by <strong>Naveen Rameshchandra Agrawal</strong> started on{" "}
                        <strong>12 Feb 2002</strong> at <strong>Malad West, Mumbai 97</strong>.
                      </p>
                      
                      <p>
                        The concept was <strong>hassle-free arrangement</strong> so the family members can enjoy and look after guests. 
                        When 20 years ago family members and relatives used to do arrangement at their level and knowledge because of marriage or other events.
                      </p>
                      
                      <p>
                        I realized that there is a requirement for <strong>one reliable shop</strong> or something where anyone can trust. 
                        So I started this venture.
                      </p>
                      
                      <p>
                        And today I realized somehow I have been succeeded in this project of my <strong>childhood dream</strong>. 
                        And I am thankful to all those who kept faith in me and supported all those years constantly 🙏.
                      </p>
                      
                      <p>
                        Still there is a long way to go. And once again I am looking forward with all of yours <strong>blessings and support</strong> to take this to the next level. 
                        I have faith in all of you, all my supporter loved ones.
                      </p>
                      
                      <p className="text-lg font-semibold text-purple-600">
                        With big vision I am moving. <br />
                        Yours, <br />
                        <span className="text-2xl font-serif">Humjoli</span> <br />
                        <span className="text-xl">Naveen Agrawal</span>
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative"
                  >
                    {/* Decorative Frame */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-purple-100 to-purple-200 rounded-full p-8 transform rotate-12">
                      <div className="w-full h-full rounded-full bg-white/50 backdrop-blur-sm"></div>
                    </div>

                    {/* Founder Image Placeholder */}
                    <div className="relative z-10 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-br from-purple-400 to-purple-600">
                      <div className="w-80 h-80 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Heart className="h-16 w-16 mx-auto mb-4" />
                          <h3 className="text-2xl font-serif font-bold">Naveen Agrawal</h3>
                          <p className="text-purple-100">Founder & Visionary</p>
                        </div>
                      </div>
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
                      <Calendar className="h-6 w-6 text-white" />
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
                      <MapPin className="h-6 w-6 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">Our Journey</h2>
              <p className="text-xl text-gray-600">Two decades of dedication and growth</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mb-4">
                        <milestone.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-purple-600 mb-2">{milestone.year}</h3>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">The principles that guide our journey</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card className="h-full bg-white/70 backdrop-blur-sm border-purple-100 hover:border-purple-300 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mb-4">
                        <value.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-2xl">
              <CardContent className="p-12">
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

                <h2 className="text-4xl font-serif font-bold mb-6">
                  Ready to Create Your Dream Wedding?
                </h2>
                <p className="text-xl mb-8 text-purple-100">
                  Let us bring your vision to life with our 20+ years of experience
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                      <Heart className="mr-3 h-6 w-6" />
                      Plan Your Wedding
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                      Join Humjoli
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 