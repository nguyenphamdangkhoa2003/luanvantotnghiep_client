'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationControlsProps {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (value: string) => void
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Function to generate the page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5 // Show up to 5 pages (adjustable)
    const pages: (number | string)[] = []

    if (totalPages <= maxPagesToShow) {
      // If total pages are few, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    // Calculate start and end of the middle range
    const sidePages = 2 // Pages to show on each side of current page
    let startPage = Math.max(2, currentPage - sidePages)
    let endPage = Math.min(totalPages - 1, currentPage + sidePages)

    // Adjust if near the start
    if (currentPage <= sidePages + 1) {
      endPage = Math.min(maxPagesToShow - 1, totalPages - 1)
    }
    // Adjust if near the end
    if (currentPage >= totalPages - sidePages) {
      startPage = Math.max(totalPages - maxPagesToShow + 2, 2)
    }

    // Add ellipsis before middle range if needed
    if (startPage > 2) {
      pages.push('...')
    }

    // Add middle range pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis after middle range if needed
    if (endPage < totalPages - 1) {
      pages.push('...')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Hiển thị</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={onItemsPerPageChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-700">tuyến đường mỗi trang</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
        >
          Trước
        </Button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === 'string' ? (
              <span
                key={`ellipsis-${index}`}
                className="text-sm text-gray-700 px-2"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Trang sau"
        >
          Sau
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-sm text-gray-700">
        Trang {currentPage} / {totalPages} (Tổng {totalItems} tuyến)
      </span>
    </div>
  )
}

export default PaginationControls
