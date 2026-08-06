'use client'

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/logout'
import SessionTimeoutModal from './session-timeout-modal'

interface SessionTimeoutProviderProps {
  children: ReactNode
  // Inactivity timeout in minutes (default 30 minutes)
  timeoutMinutes?: number
  // Warning time before logout in minutes (default 5 minutes)
  warningMinutes?: number
}

export default function SessionTimeoutProvider({
  children,
  timeoutMinutes = 30,
  warningMinutes = 5,
}: SessionTimeoutProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(warningMinutes * 60)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const warningTimeMs = (timeoutMinutes - warningMinutes) * 60 * 1000
  const totalTimeoutMs = timeoutMinutes * 60 * 1000

  // Skip session timeout for public pages
  const isPublicPage = pathname?.startsWith('/pay') || pathname === '/'

  const handleLogout = useCallback(async () => {
    setIsLoggedIn(false)
    setShowWarning(false)

    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    // Sign out the user via server action
    await logoutAction()
  }, [])

  const handleExtendSession = useCallback(() => {
    // Reset activity time
    lastActivityRef.current = Date.now()
    setShowWarning(false)
    setTimeRemaining(warningMinutes * 60)

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    // Set new timers
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true)
      setTimeRemaining(warningMinutes * 60)

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current)
              clearInterval(countdownIntervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, warningTimeMs)

    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, totalTimeoutMs)
  }, [warningMinutes, warningTimeMs, totalTimeoutMs, handleLogout])

  const handleActivity = useCallback(() => {
    if (!isLoggedIn || isPublicPage) return

    const timeSinceLastActivity = Date.now() - lastActivityRef.current

    // Only reset if more than 1 second has passed
    if (timeSinceLastActivity > 1000) {
      handleExtendSession()
    }
  }, [isLoggedIn, isPublicPage, handleExtendSession])

  // Initialize session timeout on mount
  useEffect(() => {
    if (isPublicPage) return

    handleExtendSession()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [isPublicPage, handleExtendSession])

  // Add activity listeners
  useEffect(() => {
    if (isPublicPage) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [handleActivity, isPublicPage])

  return (
    <>
      {children}
      {showWarning && isLoggedIn && (
        <SessionTimeoutModal
          timeRemaining={timeRemaining}
          onLogout={handleLogout}
          onExtend={handleExtendSession}
        />
      )}
    </>
  )
}
