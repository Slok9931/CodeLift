import React from 'react'
import clsx from 'clsx'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition text-sm',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <div className="text-xs text-destructive mt-1">{error}</div>
      )}
    </div>
  )
)

Select.displayName = 'Select'

export default Select
