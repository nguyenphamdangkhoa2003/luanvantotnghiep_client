'use client'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createColumns } from './columns'
import { DataTable } from './data-table'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { DriverPassType } from './columns'
import { getAllMembershipsQueryFn } from '@/api/memberships/membership'

function DriverPassesPage() {
  const [driverPasses, setDriverPasses] = useState<DriverPassType[]>([])
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Define the mutation
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getAllMembershipsQueryFn,
    onSuccess: (response) => {
      const memberships = response.data // Assuming API returns { data: [...] }

      // Transform API data to match DriverPassType
      const transformedData: DriverPassType[] = memberships.map(
        (membership: any) => ({
          _id: membership._id,
          name: membership.userId.name,
          email:membership.userId.email,
          packageType: membership.packageType,
          acceptRequests: membership.acceptRequests,
          price: membership.price,
          durationDays: membership.durationDays,
          startDate: membership.startDate,
          endDate: membership.endDate,
          status: membership.status,
          createdAt: membership.createdAt,
          updatedAt: membership.updatedAt,
        })
      )

      setDriverPasses(transformedData)
    },
    onError: (err: any) => {
      console.error('Failed to fetch driver passes:', err)
    },
  })

  // Trigger mutation on mount and refetch
  useEffect(() => {
    mutate()
  }, [refetchTrigger, mutate])

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1)
  }

  if (isPending) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Driver Passes
        </h2>
        <div className="container mx-auto py-10">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={`header-${i}`} className="h-10 flex-1" />
                ))}
            </div>
            {Array(5)
              .fill(0)
              .map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                  {Array(10)
                    .fill(0)
                    .map((_, cellIndex) => (
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
    )
  }

  if (isError) {
    return (
      <div className="p-3">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Driver Passes
        </h2>
        <div className="container mx-auto py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error?.message || 'Failed to fetch driver passes'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
        Driver Passes
      </h2>
      <div className="container mx-auto py-5">
        <DataTable columns={createColumns(refetch)} data={driverPasses} />
      </div>
    </div>
  )
}

export default DriverPassesPage
