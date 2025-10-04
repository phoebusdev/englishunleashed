/**
 * Admin Card Component
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-1
 *
 * Consistent card styling for admin panel
 */

import { HTMLAttributes, ReactNode } from 'react'

interface AdminCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

export function AdminCard({
  children,
  title,
  description,
  actions,
  className = '',
  ...props
}: AdminCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      {...props}
    >
      {(title || description || actions) && (
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
