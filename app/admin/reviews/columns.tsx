// src/components/reviews/columns.tsx
'use client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/SortColumn'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatVietnamDateTime } from '@/utils'

export interface ReviewType {
  _id: string
  reviewer: { _id: string; name: string }
  reviewee: { _id: string; name: string }
  tripRequest: { _id: string; startLocation: string; endLocation: string }
  rating: number
  comment?: string
  reviewType: 'customer' | 'driver'
  createdAt: string
  updatedAt: string
}

export const createColumns = (
  reviewType: 'customer' | 'driver'
): ColumnDef<ReviewType>[] => [
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
    accessorKey: 'reviewer',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          reviewType === 'customer'
            ? 'Driver (Reviewer)'
            : 'Customer (Reviewer)'
        }
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">
            {row.original.reviewer.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            ID: {row.original.reviewer._id}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'reviewee',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          reviewType === 'customer'
            ? 'Customer (Reviewee)'
            : 'Driver (Reviewee)'
        }
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">
            {row.original.reviewee.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            ID: {row.original.reviewee._id}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'tripRequest',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trip" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="block truncate">
          From: {row.original.tripRequest.startLocation}
        </span>
        <span className="block truncate">
          To: {row.original.tripRequest.endLocation}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => `${row.original.rating}/5`,
    sortingFn: (rowA, rowB) => rowA.original.rating - rowB.original.rating,
  },
  {
    accessorKey: 'comment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comment" />
    ),
    cell: ({ row }) => row.original.comment || 'N/A',
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
]
