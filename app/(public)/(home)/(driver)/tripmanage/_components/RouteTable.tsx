'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Pencil, Route, Trash, Users } from 'lucide-react'
import { FaRegClone } from 'react-icons/fa'

interface Route {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  seat:number
  status: 'active' | 'pending' | 'cancelled'
  waypoints?: { name: string; _id: string }[]
}

interface RouteTableProps {
  routes: Route[]
  onClone: (route: any) => void
  onEdit: (route: any) => void
  onViewPassengers: (routeId: string) => void
  onDelete: (routeId: string) => void
}

const RouteTable: React.FC<RouteTableProps> = ({
  routes,
  onClone,
  onEdit,
  onViewPassengers,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Đang hoạt động
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Chờ duyệt
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            Đã hủy
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold text-gray-700 py-3 pl-6">
              Tên tuyến đường
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Điểm bắt đầu
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Điểm kết thúc
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Trạng thái
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right pr-6">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id} className="hover:bg-gray-50/50 border-b">
              <TableCell className="font-medium py-4 pl-6">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Route className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {route.startPoint} - {route.endPoint}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-[var(--popover)] border-[var(--border)]">
                    <div className="space-y-2 text-[var(--foreground)]">
                      <h4 className="font-medium">Thông tin tuyến đường</h4>
                      <p className="text-sm">
                        <span className="font-semibold">Từ:</span>{' '}
                        {route.startPoint}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Đến:</span>{' '}
                        {route.endPoint}
                      </p>
                      {route.waypoints &&
                      Array.isArray(route.waypoints) &&
                      route.waypoints.length > 2 ? (
                        <div className="text-sm">
                          <span className="font-semibold">Điểm dừng:</span>
                          <ul className="list-disc pl-4">
                            {route.waypoints
                              .slice(1, -1)
                              .map((waypoint, index) => (
                                <li key={waypoint._id || index}>
                                  {waypoint.name}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell className="py-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="truncate max-w-[180px]">
                        {route.startPoint}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent >
                      <p>{route.startPoint}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="py-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="truncate max-w-[180px]">
                        {route.endPoint}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent >
                      <p>{route.endPoint}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="py-4">
                {getStatusBadge(route.status)}
              </TableCell>
              <TableCell className="py-4 text-right pr-6">
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewPassengers(route.id)}
                          className="h-8 w-8 p-0 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--ring)]"
                        >
                          <Users className="h-4 w-4 text-[var(--primary)]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent >
                        <p>Xem hành khách</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {route.status !== 'cancelled' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(route)}
                            className="h-8 w-8 p-0 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--ring)]"
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent >
                          <p>Chỉnh sửa tuyến đường</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onClone(route)}
                          className="h-8 w-8 p-0 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:border-[var(--ring)]"
                        >
                          <FaRegClone className="h-4 w-4 text-green-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent >
                        <p>Tạo lại tuyến</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {route.status === 'active' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(route.id)}
                            className="h-8 w-8 p-0 bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="">
                          <p>Xóa</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default RouteTable
