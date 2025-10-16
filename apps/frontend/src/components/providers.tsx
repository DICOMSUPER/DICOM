'use client'

import { Provider } from 'react-redux'
import { store } from '../store'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'



export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}