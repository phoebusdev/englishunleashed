'use client'

/**
 * Orders List Client Component
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-4
 */

import { useState, useMemo } from 'react'
import { AdminCard, DataTable, AdminButton, useToast, type Column } from '@/components/admin/ui'

type Order = {
  id: string
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  createdAt: Date
  user: {
    id: string
    email: string
    name: string | null
  }
  product: {
    id: string
    title: string
  }
}

interface OrdersListClientProps {
  orders: Order[]
}

export default function OrdersListClient({ orders: initialOrders }: OrdersListClientProps) {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return initialOrders
    return initialOrders.filter(order => order.status === statusFilter)
  }, [initialOrders, statusFilter])

  const handleExportCSV = () => {
    const headers = ['Order ID', 'User Email', 'Product', 'Amount', 'Status', 'Date']
    const rows = filteredOrders.map(order => [
      order.id,
      order.user.email,
      order.product.title,
      `£${(order.amount / 100).toFixed(2)}`,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast('success', 'Export Complete', 'Orders exported to CSV successfully')
  }

  const columns: Column<Order>[] = [
    {
      header: 'User',
      accessor: 'user',
      cell: (order) => (
        <div>
          <div className="font-medium text-gray-900">{order.user.email}</div>
          {order.user.name && <div className="text-sm text-gray-500">{order.user.name}</div>}
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'product',
      cell: (order) => (
        <span className="text-gray-900">{order.product.title}</span>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      cell: (order) => (
        <span className="font-medium text-gray-900">
          £{(order.amount / 100).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (order) => {
        const statusColors = {
          COMPLETED: 'bg-green-100 text-green-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          FAILED: 'bg-red-100 text-red-800',
          REFUNDED: 'bg-gray-100 text-gray-800'
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
            {order.status}
          </span>
        )
      }
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      cell: (order) => (
        <div>
          <div className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
        </div>
      )
    }
  ]

  return (
    <AdminCard
      actions={
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <AdminButton variant="outline" onClick={handleExportCSV}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </AdminButton>
        </div>
      }
    >
      <DataTable
        data={filteredOrders}
        columns={columns}
        emptyMessage="No orders found"
        emptyDescription={statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} orders` : undefined}
        pageSize={20}
      />
    </AdminCard>
  )
}
