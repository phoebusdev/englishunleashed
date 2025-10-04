'use client'

/**
 * Users List Client Component
 * Spec: specs/001-admin-dashboard-rebuild/specification.md#requirement-3
 */

import { useState } from 'react'
import { AdminCard, DataTable, ConfirmDialog, AdminButton, useToast, type Column } from '@/components/admin/ui'

type User = {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  createdAt: Date
  _count: {
    orders: number
  }
}

interface UsersListClientProps {
  users: User[]
}

export default function UsersListClient({ users: initialUsers }: UsersListClientProps) {
  const { toast } = useToast()
  const [users, setUsers] = useState(initialUsers)
  const [toggleAdminDialogOpen, setToggleAdminDialogOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleAdmin = async () => {
    if (!userToToggle) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${userToToggle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAdmin: !userToToggle.isAdmin
        }),
      })

      if (!response.ok) throw new Error('Failed to update user')

      setUsers(users.map(u =>
        u.id === userToToggle.id
          ? { ...u, isAdmin: !u.isAdmin }
          : u
      ))

      toast(
        'success',
        'User Updated',
        `${userToToggle.email} is now ${!userToToggle.isAdmin ? 'an admin' : 'a regular user'}`
      )
      setUserToToggle(null)
    } catch (error) {
      toast('error', 'Update failed', 'Failed to update user. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const columns: Column<User>[] = [
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
      cell: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.email}</div>
          {user.name && <div className="text-sm text-gray-500">{user.name}</div>}
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'isAdmin',
      cell: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.isAdmin ? 'Admin' : 'User'}
        </span>
      )
    },
    {
      header: 'Orders',
      accessor: '_count',
      sortable: true,
      cell: (user) => (
        <span className="text-gray-900">{user._count.orders}</span>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      sortable: true,
      cell: (user) => (
        <span className="text-gray-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (user) => (
        <AdminButton
          variant={user.isAdmin ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => {
            setUserToToggle(user)
            setToggleAdminDialogOpen(true)
          }}
        >
          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
        </AdminButton>
      )
    }
  ]

  return (
    <>
      <AdminCard>
        <DataTable
          data={users}
          columns={columns}
          emptyMessage="No users found"
          pageSize={20}
        />
      </AdminCard>

      <ConfirmDialog
        open={toggleAdminDialogOpen}
        onOpenChange={setToggleAdminDialogOpen}
        title={userToToggle?.isAdmin ? 'Remove Admin Access' : 'Grant Admin Access'}
        description={`Are you sure you want to ${userToToggle?.isAdmin ? 'remove admin access from' : 'grant admin access to'} ${userToToggle?.email}?`}
        confirmLabel={userToToggle?.isAdmin ? 'Remove Admin' : 'Grant Admin'}
        variant={userToToggle?.isAdmin ? 'warning' : 'info'}
        isLoading={isUpdating}
        onConfirm={handleToggleAdmin}
      />
    </>
  )
}
