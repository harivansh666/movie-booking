import { useEffect } from "react";
import { Calendar, Clock, Armchair, Ticket, Loader } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { getImageUrl } from "@/services/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import PageTransition from "@/components/PageTransition";

export default function MyBookings() {
  const { bookings, fetchMyBookings, isLoading } = useBookingStore();

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ticket className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">
              No bookings yet
            </h2>
            <p className="text-muted-foreground">
              Browse movies and book your first ticket!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-start gap-4 p-4">
                  <img
                    src={getImageUrl(b.moviePoster, "w154")}
                    alt={b.movieTitle}
                    className="w-20 rounded-lg border border-border"
                  />
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-foreground">
                      {b.movieTitle}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(b.startTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(b.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Armchair className="h-3 w-3" />
                        {b.seats?.map((s) => `${s.row}${s.col}`).join(", ") ||
                          "No seats"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hall: {b.hallNumber}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ₹{b.totalPrice}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
