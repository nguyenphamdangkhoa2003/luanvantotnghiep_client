'use client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/SortColumn'
import { Checkbox } from '@/components/ui/checkbox'

import { formatVietnamDateTime } from '@/utils'
import { Badge } from '@/components/ui/badge'

export interface DriverPassType {
  _id: string
  name: string
  email:string
  packageType: string
  acceptRequests: number
  price: number
  durationDays: number
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  updatedAt: string
}

export const createColumns = (refetch: () => void): ColumnDef<DriverPassType>[] => [
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
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{row.original.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.email || 'No email provided'}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'packageType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Package Type" />
    ),
    cell: ({ row }) => row.original.packageType || 'N/A',
  },
  {
    accessorKey: 'acceptRequests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Accept Requests" />
    ),
    cell: ({ row }) => row.original.acceptRequests || 'N/A',
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) =>
      row.original.price
        ? `${row.original.price.toLocaleString('vi-VN')} VND`
        : 'N/A',
  },
  {
    accessorKey: 'durationDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration (Days)" />
    ),
    cell: ({ row }) => row.original.durationDays || 'N/A',
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.startDate)
      return formatVietnamDateTime(date.toISOString())
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.startDate).getTime()
      const dateB = new Date(rowB.original.startDate).getTime()
      return dateA - dateB
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.endDate)
      return formatVietnamDateTime(date.toISOString())
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.endDate).getTime()
      const dateB = new Date(rowB.original.endDate).getTime()
      return dateA - dateB
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      let variant: 'default' | 'secondary' | 'outline' | 'destructive' =
        'default'
      if (status === 'active') variant = 'default'
      else if (status === 'inactive') variant = 'secondary'
      else if (status === 'expired') variant = 'destructive'
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  
]
