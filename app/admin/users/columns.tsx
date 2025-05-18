// columns.tsx
'use client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/SortColumn'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { IoTrash } from 'react-icons/io5'
import { FaBan } from 'react-icons/fa'
import { CgProfile } from 'react-icons/cg'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'
import { UserType } from '@/context/auth-provider' // Adjust path if `UserType` is in `types/user.ts`
import { formatVietnamDateTime } from '@/utils'
import { Badge } from '@/components/ui/badge'
import { useMutation } from '@tanstack/react-query'
// import {
//   deleteUserMutationFn,
//   toggleBannedUserMutationFn,
// } from '@/api/users/user'

export const createColumns = (refetch: () => void): ColumnDef<UserType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <Avatar className="h-8 w-8 rounded-lg">
          {row.original.avatar && (
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
          )}
          <AvatarFallback className="rounded-lg">
            {row.original.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{row.original.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.email || 'No email provided'}
          </span>
        </div>
        {/* Remove banned icon since `banned` field is not in API response */}
      </div>
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => row.original.phoneNumber || 'N/A',
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role
      let variant: 'default' | 'secondary' | 'outline' = 'default'
      let displayText = role

      return (
        <Badge variant={variant} className="capitalize">
          {displayText}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return formatVietnamDateTime(date.toISOString())
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.createdAt).getTime()
      const dateB = new Date(rowB.original.createdAt).getTime()
      return dateA - dateB
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt)
      return formatVietnamDateTime(date.toISOString())
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.updatedAt).getTime()
      const dateB = new Date(rowB.original.updatedAt).getTime()
      return dateA - dateB
    },
  },
  {
    accessorKey: 'actions',
    cell: ({ row }) => {
      const router = useRouter()
      const toggleBanMutation = useMutation({
        // mutationFn: toggleBannedUserMutationFn,
        // onSuccess: () => {
        //   toast.success('Operation successful')
        //   refetch()
        // },
        // onError: (error) => toast.error(error.message),
      })

      const deleteUserMutation = useMutation({
        // mutationFn: deleteUserMutationFn,
        // onSuccess: () => {
        //   toast.success('Delete successful')
        //   refetch()
        // },
        // onError: (error) => toast.error(error.message),
      })

      // Since `banned` field is not in API response, assume all users are not banned
      const isBanned = false // Adjust logic if you add `banned` to API later

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                className="flex gap-2 items-center cursor-pointer"
                href={`/admin/users/${row.original._id}`}
              >
                <CgProfile />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ConfirmDialog
                triggerText={isBanned ? 'Unban' : 'Ban'}
                triggerVariant="ghost"
                title={`Are you sure you want to ${
                  isBanned ? 'unban' : 'ban'
                } this user?`}
                description={`This will ${
                  isBanned ? 'reinstate' : 'restrict'
                } the user's access to the system.`}
                confirmText={isBanned ? 'Unban' : 'Ban'}
                // onConfirm={() =>
                //   toggleBanMutation.mutate({
                //     userId: row.original._id,
                //     endpoint: isBanned ? 'unban' : 'ban',
                //   })
                // }
              >
                <div className="flex gap-2 items-center cursor-pointer text-red-500">
                  <FaBan className="text-red-500" />
                  {isBanned ? 'Unban' : 'Ban'}
                </div>
              </ConfirmDialog>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ConfirmDialog
                triggerText="Delete"
                triggerVariant="ghost"
                title="Are you sure you want to delete this user?"
                description="This action cannot be undone. This will permanently delete the user and remove their data from our servers."
                confirmText="Delete"
                // onConfirm={
                // // () =>
                // //   deleteUserMutation.mutate({
                // //     userId: row.original._id,
                // //   })
                // }
              >
                <div className="flex gap-2 items-center cursor-pointer text-red-500">
                  <IoTrash className="text-red-500" />
                  Delete
                </div>
              </ConfirmDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
