"use client"

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

const pathMap: Record<string, string> = {
  'reception': 'Reception',
  'register': 'Register Patient',
  'patients': 'Patients',
  'dashboard': 'Dashboard',
  'imaging': 'Imaging',
  'queue': 'Queue',
  'settings': 'Settings',
  'profile': 'Profile',
}

export function useBreadcrumb() {
  const pathname = usePathname()

  return useMemo(() => {
    const paths = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    // Always add home
    items.push({ label: 'Home', href: '/' })

    // Build up the breadcrumb items based on the path
    let currentPath = ''
    paths.forEach((path) => {
      currentPath += `/${path}`
      items.push({
        label: pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        href: currentPath,
      })
    })

    return items
  }, [pathname])
}