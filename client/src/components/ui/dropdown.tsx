import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  error?: string
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, onChange, options, error, className }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      const clickedTrigger = !!ref.current?.contains(target)
      const clickedMenu = !!menuRef.current?.contains(target)

      if (!clickedTrigger && !clickedMenu) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 9999,
      })
    }
  }, [open])

  const selected = options.find(opt => opt.value === value)

  return (
    <div className={clsx('w-full', className)} ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      )}
      <button
        type="button"
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary focus:outline-none transition text-sm',
          error && 'border-destructive',
          open && 'ring-2 ring-primary',
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        ref={btnRef}
      >
        <span>{selected ? selected.label : options[0]?.label}</span>
        <ChevronDown size={18} className={clsx('ml-2 transition-transform', open && 'rotate-180')} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className={clsx(
            'bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-200',
            'opacity-100 scale-100 pointer-events-auto'
          )}
          style={dropdownStyle}
          role="listbox"
        >
          {options.map(opt => (
            <div
              key={opt.value}
              className={clsx(
                'px-4 py-2 text-sm cursor-pointer hover:bg-muted',
                value === opt.value && 'bg-primary/10 text-primary font-semibold'
              )}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
      {error && <div className="text-xs text-destructive mt-1">{error}</div>}
    </div>
  )
}

export default Dropdown
