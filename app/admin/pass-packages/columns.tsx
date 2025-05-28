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
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog'
import { formatVietnamDateTime } from '@/utils'

export interface PassPackageType {
  _id: string
  name: string
  duration: number
  price: number
  description?: string
  createdAt: string
  updatedAt: string
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
      <DataTableColumnHeader column={column} title="Tên gói" />
    ),
    cell: ({ row }) => row.original.name || 'N/A',
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời hạn (ngày)" />
    ),
    cell: ({ row }) => row.original.duration || 'N/A',
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá (VND)" />
    ),
    cell: ({ row }) => row.original.price.toLocaleString('vi-VN') || 'N/A',
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => row.original.description || 'N/A',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
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
      <DataTableColumnHeader column={column} title="Ngày cập nhật" />
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
      const handleDelete = () => {
        try {
          // Xóa được xử lý trong page.tsx qua refetch
          toast.success('Xóa gói pass thành công')
          refetch()
        } catch (error) {
          toast.error('Xóa gói pass thất bại')
        }
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
                // onConfirm={() => {
                //   row.table.options.meta?.deletePackage(row.original._id)
                //   handleDelete()
                // }}
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
