import { useState, useEffect } from 'react'

type ScreenSize = 'mobile' | 'tablet' | 'desktop'

interface LayoutState {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  screenSize: ScreenSize
  isLoading: boolean
}

interface ResponsiveBreakpoints {
  mobile: number  // <768px
  tablet: number  // 768-1200px
  desktop: number // >1200px
}

interface UseResponsiveLayoutProps {
  leftSidebarOpen?: boolean
  rightSidebarOpen?: boolean
}

const breakpoints: ResponsiveBreakpoints = {
  mobile: 768,
  tablet: 1200,
  desktop: 1201
}

export function useResponsiveLayout({
  leftSidebarOpen = true,
  rightSidebarOpen = false
}: UseResponsiveLayoutProps = {}) {
  const [layoutState, setLayoutState] = useState<LayoutState>({
    leftSidebarOpen,
    rightSidebarOpen,
    screenSize: 'desktop',
    isLoading: true
  })

  const getScreenSize = (width: number): ScreenSize => {
    if (width < breakpoints.mobile) return 'mobile'
    if (width < breakpoints.tablet) return 'tablet'
    return 'desktop'
  }

  const updateScreenSize = () => {
    const width = window.innerWidth
    const newScreenSize = getScreenSize(width)
    
    setLayoutState(prev => {
      const shouldAutoCloseSidebars = newScreenSize === 'mobile'
      
      return {
        ...prev,
        screenSize: newScreenSize,
        leftSidebarOpen: shouldAutoCloseSidebars ? false : prev.leftSidebarOpen,
        rightSidebarOpen: shouldAutoCloseSidebars ? false : prev.rightSidebarOpen,
        isLoading: false
      }
    })
  }

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedLeftSidebar = localStorage.getItem('leftSidebarOpen')
    const savedRightSidebar = localStorage.getItem('rightSidebarOpen')
    
    setLayoutState(prev => ({
      ...prev,
      leftSidebarOpen: savedLeftSidebar ? JSON.parse(savedLeftSidebar) : leftSidebarOpen,
      rightSidebarOpen: savedRightSidebar ? JSON.parse(savedRightSidebar) : rightSidebarOpen
    }))

    // Initial screen size check
    updateScreenSize()

    // Add resize listener
    window.addEventListener('resize', updateScreenSize)
    
    return () => {
      window.removeEventListener('resize', updateScreenSize)
    }
  }, [leftSidebarOpen, rightSidebarOpen])

  const toggleLeftSidebar = () => {
    setLayoutState(prev => {
      const newState = !prev.leftSidebarOpen
      localStorage.setItem('leftSidebarOpen', JSON.stringify(newState))
      return {
        ...prev,
        leftSidebarOpen: newState
      }
    })
  }

  const toggleRightSidebar = () => {
    setLayoutState(prev => {
      const newState = !prev.rightSidebarOpen
      localStorage.setItem('rightSidebarOpen', JSON.stringify(newState))
      return {
        ...prev,
        rightSidebarOpen: newState
      }
    })
  }

  return {
    layoutState,
    toggleLeftSidebar,
    toggleRightSidebar
  }
} 