'use client'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/table/SortColumn'
import { Checkbox } from '@/components/ui/checkbox'
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
import { FaEdit } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'

export interface PassPackageType {
  _id: string
  name: string
  acceptRequests: number
  price: number
  durationDays: number
  description: string[] // Changed to non-optional with default empty array
}

export const createColumns = (
  refetch: () => void,
  setEditingPackage: (pkg: PassPackageType | null) => void,
  setOpenDialog: (open: boolean) => void
): ColumnDef<PassPackageType>[] => [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn hàng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại gói" />
    ),
    cell: ({ row }) => row.original.name || 'N/A',
  },
  {
    accessorKey: 'acceptRequests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng yêu cầu" />
    ),
    cell: ({ row }) =>
      row.original.acceptRequests.toLocaleString('vi-VN') || 'N/A',
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá (VNĐ)" />
    ),
    cell: ({ row }) => row.original.price.toLocaleString('vi-VN') || 'N/A',
  },
  {
    accessorKey: 'durationDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời hạn (ngày)" />
    ),
    cell: ({ row }) =>
      row.original.durationDays.toLocaleString('vi-VN') || 'N/A',
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => (
      <ul className="list-disc pl-4">
        {row.original.description.length > 0 ? (
          row.original.description.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))
        ) : (
          <li>Không có mô tả</li>
        )}
      </ul>
    ),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        deletePackage: (packageName: string) => void
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                setEditingPackage(row.original)
                setOpenDialog(true)
              }}
              className="cursor-pointer"
            >
              <div className="flex gap-2 items-center text-blue-500">
                <FaEdit className="text-blue-500" />
                Sửa
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ConfirmDialog
                triggerText="Xóa"
                triggerVariant="ghost"
                title="Bạn có chắc muốn xóa gói pass này?"
                description="Hành động này không thể hoàn tác. Gói pass sẽ bị xóa vĩnh viễn."
                confirmText="Xóa"
                onConfirm={() => {
                  meta.deletePackage(row.original.name)
                }}
              >
                <div className="flex gap-2 items-center cursor-pointer text-red-500">
                  <IoTrash className="text-red-500" />
                  Xóa
                </div>
              </ConfirmDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
