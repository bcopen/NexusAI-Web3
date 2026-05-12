'use client'

import { useState, useEffect, useCallback } from 'react'

const KEY = 'nexus_bookmarks'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(KEY)
      if (saved) setBookmarks(JSON.parse(saved))
    } catch {}
  }, [])

  const toggle = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks])

  return { bookmarks, toggle, isBookmarked, mounted }
}
