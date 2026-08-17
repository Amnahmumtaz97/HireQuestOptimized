'use client'

import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type StyledSelectOption = {
  value: string
  label: string
  description?: string
}

type StyledSelectProps = {
  value: string
  options: readonly StyledSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  allowEmpty?: boolean
  ariaLabel?: string
  className?: string
  disabled?: boolean
}

export function StyledSelect({
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  allowEmpty = false,
  ariaLabel,
  className = '',
  disabled = false,
}: StyledSelectProps) {
  const selected = options.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel ?? placeholder}
          className={[
            'hq-styled-select-trigger',
            selected ? 'is-active' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="min-w-0 text-left">
            <span className="block truncate">{selected?.label ?? placeholder}</span>
            {selected?.description ? (
              <span className="mt-0.5 block truncate text-[10px] font-normal text-muted-foreground">
                {selected.description}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="max-h-72 overflow-y-auto"
        style={{
          minWidth: 'var(--radix-dropdown-menu-trigger-width)',
          width: 'var(--radix-dropdown-menu-trigger-width)',
        }}
      >
        {allowEmpty ? (
          <>
            <DropdownMenuItem className="justify-between gap-3" onClick={() => onChange('')}>
              <span className="truncate text-muted-foreground">{placeholder}</span>
              {!value ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}

        {options.map((option) => {
          const active = option.value === value
          return (
            <DropdownMenuItem
              key={option.value}
              className={[
                'justify-between gap-3 py-2',
                active ? 'bg-primary/10 text-foreground' : '',
              ].join(' ')}
              onClick={() => onChange(option.value)}
            >
              <span className="min-w-0">
                <span className="block truncate">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {option.description}
                  </span>
                ) : null}
              </span>
              {active ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
