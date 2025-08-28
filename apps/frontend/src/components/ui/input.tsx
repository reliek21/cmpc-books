import React from 'react'
import clsx from 'clsx'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      className={clsx('block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500', className)}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
