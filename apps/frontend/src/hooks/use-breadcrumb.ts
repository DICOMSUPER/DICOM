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
  'vital-signs': 'Vital Signs',
  'encounters': 'Encounters',
  'diagnoses': 'Diagnoses',
  'schedule': 'Schedule Management',
  'working-hours': 'Working Hours',
}

const formatSegment = (segment: string) => {
  const remapped = pathMap[segment];
  if (remapped) {
    return remapped;
  }

  return segment
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function useBreadcrumb() {
  const pathname = usePathname()

  return useMemo(() => {
    const paths = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []
    // Build up the breadcrumb items based on the path (excluding home)
    let currentPath = ''
    paths.forEach((path) => {
      currentPath += `/${path}`
      items.push({
        label: formatSegment(path),
        href: currentPath,
      })
    })

    return items
  }, [pathname])
}