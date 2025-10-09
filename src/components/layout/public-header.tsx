'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ]

  const handleGetStarted = () => {
    router.push('/auth?mode=signup')
  }

  const handleSignIn = () => {
    router.push('/auth')
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-gray-950/95 backdrop-blur-md border-b border-gray-800/40 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="grok-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            TodoNex
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignIn}
            className="text-sm font-medium text-gray-300 hover:text-white"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            onClick={handleGetStarted}
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-9 w-9 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleSignIn()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full justify-start text-sm font-medium text-gray-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleGetStarted()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}