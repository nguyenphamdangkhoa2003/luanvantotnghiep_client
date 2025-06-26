'use client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/SortColumn'
import { Checkbox } from '@/components/ui/checkbox'
import { formatVietnamDateTime } from '@/utils'

export interface Review {
  id: string
  reviewer: { id: string; name: string; email: string }
  reviewee: { id: string; name: string; email: string }
  tripRequest: {
    id: string
    startLocation: string
    endLocation: string
  } | null
  rating: number
  comment?: string
  reviewType: 'customer' | 'driver'
  createdAt: string
  updatedAt: string
}

// Create columns for the review table
export const createColumns = (
  reviewType: 'customer' | 'driver'
): ColumnDef<Review>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Chọn tất cả"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn hàng"
        className="translate-y-[2px]"
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
            ? 'Tài xế (Người đánh giá)'
            : 'Khách hàng (Người đánh giá)'
        }
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
        <div className="grid flex-1 leading-tight">
          <span className="truncate font-medium">
            {row.original.reviewer.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.reviewer.email ?? 'Không có email'}
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
            ? 'Khách hàng (Được đánh giá)'
            : 'Tài xế (Được đánh giá)'
        }
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
        <div className="grid flex-1 leading-tight">
          <span className="truncate font-medium">
            {row.original.reviewee.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.reviewee.email ?? 'Không có email'}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Điểm số" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.rating}/5</span>
    ),
    sortingFn: (rowA, rowB) => rowA.original.rating - rowB.original.rating,
  },
  {
    accessorKey: 'comment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bình luận" />
    ),
    cell: ({ row }) => (
      <span className="truncate max-w-[200px]">
        {row.original.comment || 'Không có'}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian tạo" />
    ),
    cell: ({ row }) => formatVietnamDateTime(row.original.createdAt),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.createdAt).getTime() -
      new Date(rowB.original.createdAt).getTime(),
  },
]
