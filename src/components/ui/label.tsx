import * as React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={['block text-sm font-medium leading-none text-foreground', className].join(' ')}
        {...props}
      >
        {children}
      </label>
    )
  },
)

Label.displayName = 'Label'
