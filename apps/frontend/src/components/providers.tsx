'use client'

import { Provider } from 'react-redux'
import { store } from '../store'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadTokenFromStorage } from '../store/authSlice'

function TokenInitializer() {
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(loadTokenFromStorage())
  }, [dispatch])
  
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <TokenInitializer />
      {children}
    </Provider>
  )
}