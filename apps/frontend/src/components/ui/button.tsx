import React from 'react'
import clsx from 'clsx'

export function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
