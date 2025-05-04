'use client';
import { useEffect, useState } from 'react';
import { createColumns } from './columns';
import { DataTable } from './data-table';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

function UsersPage() {
    
    const [users, setUsers] = useState([]);
     const mockUsers = [
        {
            _id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            avatar: { url: 'https://randomuser.me/api/portraits/men/1.jpg' },
            lastSignInAt: new Date('2023-06-15').toISOString(),
            createdAt: new Date('2023-01-10').toISOString(),
            banned: false
        },
        {
            _id: '2',
            name: 'Driver User',
            email: 'driver@example.com',
            role: 'driver',
            avatar: { url: 'https://randomuser.me/api/portraits/men/2.jpg' },
            lastSignInAt: new Date('2023-06-14').toISOString(),
            createdAt: new Date('2023-02-15').toISOString(),
            banned: false
        },
        {
            _id: '3',
            name: 'Customer User',
            email: 'customer@example.com',
            role: 'customer',
            avatar: { url: 'https://randomuser.me/api/portraits/women/1.jpg' },
            lastSignInAt: new Date('2023-06-10').toISOString(),
            createdAt: new Date('2023-03-20').toISOString(),
            banned: false
        },
        {
            _id: '4',
            name: 'Banned User',
            email: 'banned@example.com',
            role: 'customer',
            avatar: { url: 'https://randomuser.me/api/portraits/women/2.jpg' },
            lastSignInAt: new Date('2023-05-01').toISOString(),
            createdAt: new Date('2023-04-05').toISOString(),
            banned: true
        },
    ];
    
    // useEffect(() => {
    //     if (data?.data) {
    //         setUsers(data.data);
    //         console.log('Danh sách người dùng: ', data.data);
    //     }
    // }, [data]);

    useEffect(() => {
        // Simulate API call with mock data
        const timer = setTimeout(() => {
            setUsers(mockUsers);
        }, 500); // Small delay to simulate network request
        
        return () => clearTimeout(timer);
    }, []);

    // For UI demonstration only - remove when API is connected
    const isPending = false;
    const isError = false;
    const error = null;
    const refetch = () => {
        // Simulate refetch
        setUsers([...mockUsers]);
    };

    if (isPending) {
        return (
            <div className="p-3">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
                    Users
                </h2>
                <div className="container mx-auto py-10">
                    <div className="flex items-center mb-4">
                        <Skeleton className="h-10 w-full max-w-sm" />
                    </div>
                    
                    {/* Table Skeleton */}
                    <div className="space-y-4">
                        {/* Header row */}
                        <div className="flex gap-4">
                            {Array(5).fill(0).map((_, i) => (
                                <Skeleton key={`header-${i}`} className="h-10 flex-1" />
                            ))}
                        </div>
                        
                        {/* Data rows */}
                        {Array(5).fill(0).map((_, rowIndex) => (
                            <div key={`row-${rowIndex}`} className="flex gap-4">
                                {Array(5).fill(0).map((_, cellIndex) => (
                                    <Skeleton 
                                        key={`cell-${rowIndex}-${cellIndex}`} 
                                        className="h-12 flex-1" 
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-3">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
                    Users
                </h2>
                <div className="container mx-auto py-10">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error?.message || 'Failed to fetch users'}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
                Users
            </h2>
            <div className="container mx-auto py-5">
                <DataTable columns={createColumns(refetch)} data={users} />
            </div>
        </div>
    );
}

export default UsersPage;