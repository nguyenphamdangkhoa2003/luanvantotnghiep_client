'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import {
    ColumnDef,
    SortingState,
    getFilteredRowModel,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/table/PaginationTable';
import { DataTableViewOptions } from '@/components/table/ViewOption';
import { useRouter } from 'next/navigation';
// import { getAllUserQueryFn } from '@/api/users/user';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [searchTerm, setSearchTerm] = useState('');
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
            columnVisibility,
        },
    });
    // Comment out API-related code for now
    /*
    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: ['users', searchTerm],
        queryFn: () => getAllUserQueryFn(searchTerm),
    });

    
    */
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex items-center justify-end  px-2">
                        <DataTableViewOptions 
                            table={table}
                            filterConfig={[
                                    {
                                    columnId: 'role',
                                    title: 'Role',
                                    options: [
                                        { value: 'admin', label: 'Admin' },
                                        { value: 'driver', label: 'Driver' },
                                        { value: 'customer', label: 'Customer' }
                                    ]
                                    },
                                ]
                            }
                        />
                    </div>  
                </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4 px-2">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
