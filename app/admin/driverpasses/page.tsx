'use client'
import { useEffect, useState } from 'react'
import { createColumns } from './columns'
import { DataTable } from './data-table'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { DriverPassType } from './columns'

function DriverPassesPage() {
  const [isPending, setIsPending] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [driverPasses, setDriverPasses] = useState<DriverPassType[]>([])
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Updated mock data based on provided JSON
  const mockDriverPasses: DriverPassType[] = [
    {
      _id: '682e7df94050c6ef7f345840',
      userId: '6821252f57e5d421d2a3de86',
      packageType: 'Basic',
      acceptRequests: 50,
      price: 100000,
      durationDays: 30,
      startDate: '2025-05-22T01:29:29.791Z',
      endDate: '2025-06-21T01:29:29.791Z',
      status: 'active',
      createdAt: '2025-05-22T01:29:29.799Z',
      updatedAt: '2025-05-22T01:29:29.799Z',
    },
  ]

  useEffect(() => {
    setIsPending(true)

    const timeout = setTimeout(() => {
      try {
        setDriverPasses(mockDriverPasses)
        setIsPending(false)
      } catch (err) {
        setIsError(true)
        setError('Failed to load driver passes')
        setIsPending(false)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refetchTrigger])

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
              {error || 'Failed to fetch driver passes'}
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
