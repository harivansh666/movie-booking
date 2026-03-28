import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, Film, Mail, MapPin, User, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminBooking {
  id: number;
  movieTitle: string;
  moviePoster: string;
  userName: string;
  userEmail: string;
  totalPrice: number;
  status: string;
  startTime: string;
  hallNumber: number;
  createdAt: string;
  seats: { row: string; col: number }[];
}

export default function AdminBookings() {
  const { data: bookings, isLoading, error } = useQuery<AdminBooking[]>({
    queryKey: ["adminBookings"],
    queryFn: async () => {
      const res = await axiosInstance.get("/bookings/all");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        Error loading bookings. Make sure you have admin rights.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard - All Bookings</h1>
      </div>

      <div className="rounded-md border bg-card text-card-foreground overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Movie</TableHead>
              <TableHead>Showtime</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {booking.userName}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {booking.userEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {booking.moviePoster && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${booking.moviePoster}`}
                          alt={booking.movieTitle}
                          className="w-10 h-14 object-cover rounded shadow-sm"
                        />
                      )}
                      <span className="font-semibold line-clamp-2 max-w-[150px]">
                        {booking.movieTitle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(booking.startTime), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(booking.startTime), "h:mm a")}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground font-medium">
                        <MapPin className="w-3 h-3" />
                        Hall {booking.hallNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {booking.seats.map((seat, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {seat.row}{seat.col}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>₹{booking.totalPrice}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(booking.createdAt), "MMM d, yy h:mm a")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
