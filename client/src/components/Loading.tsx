import React from 'react'

interface LoadingProps {
  message?: string
  fullScreen?: boolean
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background z-6'
    : 'flex flex-col items-center justify-center py-20'

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse animation-delay-400"></div>
        </div>
        {message && (
          <div className="text-muted-foreground text-sm font-medium">{message}</div>
        )}
      </div>
    </div>
  )
}

export default Loading
