import React from 'react'
import clsx from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <div className="text-xs text-destructive mt-1">{error}</div>
      )}
    </div>
  )
)

Input.displayName = 'Input'

export default Input
