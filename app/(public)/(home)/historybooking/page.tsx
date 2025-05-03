'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Calendar, Clock, MapPin, User, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const HistoryTripPage = () => {
  // Sample data
  const tripHistory = [
    {
      id: 1,
      bookingDate: '10/06/2023',
      tripDate: '15/06/2023',
      departureTime: '08:30',
      arrivalTime: '10:15',
      from: '25 Lê Duẩn, Q.1, TP.HCM',
      to: '2 Phạm Văn Đồng, Q.Thủ Đức, TP.HCM',
      driver: 'Nguyễn Văn A',
      status: 'completed',
      vehicle: 'Toyota Vios 2023'
    },
    {
      id: 2,
      bookingDate: '05/06/2023',
      tripDate: '10/06/2023',
      departureTime: '18:00',
      arrivalTime: '19:30',
      from: '12 Nguyễn Văn Cừ, Q.5, TP.HCM',
      to: '45 Võ Văn Ngân, Q.Thủ Đức, TP.HCM',
      driver: 'Trần Thị B',
      status: 'completed',
      vehicle: 'Honda City 2022'
    },
    {
      id: 3,
      bookingDate: '01/06/2023',
      tripDate: '05/06/2023',
      departureTime: '14:00',
      arrivalTime: '15:45',
      from: '78 Lê Văn Việt, Q.9, TP.HCM',
      to: '32 Nguyễn Thị Minh Khai, Q.3, TP.HCM',
      driver: 'Lê Văn C',
      status: 'cancelled',
      vehicle: 'Hyundai Accent 2021'
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(tripHistory.length / itemsPerPage);

  return (
    <div className="container mx-auto py-8 pt-16 px-4 max-w-4xl">
      {/* Header section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Lịch sử chuyến đi
        </h1>
        <p className="text-muted-foreground">
          Xem lại các chuyến đi bạn đã đặt
        </p>
      </div>

      {/* Trip cards */}
      <div className="space-y-6 mb-8">
        {tripHistory.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <Link href={`/trips/${trip.id}`} className="block">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>Chuyến #{trip.id}</span>
                    <Badge 
                      variant={trip.status === 'completed' ? 'success' : 'destructive'}
                      className="flex items-center gap-1"
                    >
                      {trip.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {trip.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid gap-4">
                  {/* Booking and trip info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày đặt</p>
                        <p className="font-medium">{trip.bookingDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày đi</p>
                        <p className="font-medium">{trip.tripDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Giờ đi → đến</p>
                        <p className="font-medium">
                          {trip.departureTime} → {trip.arrivalTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tài xế</p>
                        <p className="font-medium">{trip.driver}</p>
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-secondary mt-1">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="grid gap-2 flex-1">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Điểm đón</p>
                            <p className="font-medium">{trip.from}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground mt-5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Điểm đến</p>
                            <p className="font-medium">{trip.to}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {trip.vehicle}
                </div>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default HistoryTripPage;