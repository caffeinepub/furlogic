import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Calendar, Loader2, MapPin, PawPrint } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Booking } from "../backend";
import { BookingStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCancelBooking,
  useGetMyBookings,
  useGetServices,
} from "../hooks/useQueries";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

interface MyBookingsPageProps {
  onNavigate: (page: string) => void;
}

export default function MyBookingsPage({ onNavigate }: MyBookingsPageProps) {
  const { identity } = useInternetIdentity();
  const { data: bookings, isLoading } = useGetMyBookings();
  const { data: services } = useGetServices();
  const cancelBooking = useCancelBooking();

  const getServiceName = (serviceId: bigint) => {
    if (!services) return `Service #${serviceId}`;
    return services[Number(serviceId)]?.name ?? `Service #${serviceId}`;
  };

  const handleCancel = async (booking: Booking) => {
    try {
      await cancelBooking.mutateAsync(booking.id);
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Failed to cancel booking.");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <PawPrint className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="font-heading font-bold text-2xl mb-3">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please login to view your bookings.
        </p>
        <Button
          onClick={() => onNavigate("home")}
          className="bg-accent text-accent-foreground rounded-full px-8"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
        My Bookings
      </h1>
      <p className="text-muted-foreground mb-8">
        Track and manage your grooming appointments.
      </p>

      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="my_bookings.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="text-center py-20" data-ocid="my_bookings.empty_state">
          <PawPrint className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-xl mb-2">
            No bookings yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Book your first grooming session for your furry friend!
          </p>
          <Button
            onClick={() => onNavigate("booking")}
            data-ocid="my_bookings.book.primary_button"
            className="bg-primary text-primary-foreground rounded-full px-8"
          >
            Book Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking.id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                data-ocid={`my_bookings.item.${i + 1}`}
                className="hover:shadow-card transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-heading font-semibold text-lg">
                          {getServiceName(booking.serviceId)}
                        </h3>
                        <Badge
                          className={`text-xs border ${STATUS_STYLES[booking.status] ?? ""}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.slot.date} at {booking.slot.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <PawPrint className="w-3.5 h-3.5" />
                          {booking.petDetails.name} (
                          {booking.petDetails.breed || "Mixed"})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">
                            {booking.address}
                          </span>
                        </span>
                      </div>
                      {booking.petDetails.notes && (
                        <p className="text-sm text-muted-foreground flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          {booking.petDetails.notes}
                        </p>
                      )}
                    </div>
                    {booking.status === BookingStatus.pending && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(booking)}
                        disabled={cancelBooking.isPending}
                        data-ocid={`my_bookings.cancel.delete_button.${i + 1}`}
                        className="text-destructive border-destructive/30 hover:bg-destructive/5 rounded-full shrink-0"
                      >
                        {cancelBooking.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Cancel"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
