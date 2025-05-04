"use client"

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Table } from "@tanstack/react-table"
import { Settings2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface FilterOption {
  value: string
  label: string
}

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  filterConfig?: {
    columnId: string
    title: string
    options: FilterOption[]
  }[]
}

export function DataTableViewOptions<TData>({
  table,
  filterConfig = [],
}: DataTableViewOptionsProps<TData>) {
  const toggleFilter = (columnId: string, value: string) => {
    const column = table.getColumn(columnId)
    if (!column) return
    
    const currentFilter = (column.getFilterValue() as string[]) || []
    const newFilter = currentFilter.includes(value)
      ? currentFilter.filter(v => v !== value)
      : [...currentFilter, value]
    
    column.setFilterValue(newFilter.length ? newFilter : undefined)
  }

  return (
    <div className="flex gap-2">
      {/* Render dynamic filter dropdowns */}
      {filterConfig.map((filter) => {
        const currentFilter = table.getColumn(filter.columnId)?.getFilterValue() as string[] || []
        
        return (
          <DropdownMenu key={filter.columnId}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto hidden h-8 lg:flex"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filter.title}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Filter by {filter.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filter.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={currentFilter.includes(option.value)}
                  onCheckedChange={() => toggleFilter(filter.columnId, option.value)}
                  className="capitalize"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}

      {/* Dropdown toggle columns */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 className="mr-2 h-4 w-4" />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== "undefined" && column.getCanHide()
            )
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}