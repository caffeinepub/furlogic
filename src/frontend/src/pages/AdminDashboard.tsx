import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  Loader2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddTimeSlot,
  useCancelBooking,
  useClaimAdminRole,
  useCompleteBooking,
  useConfirmBooking,
  useGetAllBookings,
  useGetAvailableTimeSlots,
  useGetServices,
  useIsAdminAssigned,
  useIsCallerAdmin,
  useRemoveTimeSlot,
} from "../hooks/useQueries";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isAdminAssigned, isLoading: adminAssignedLoading } =
    useIsAdminAssigned();
  const { data: bookings, isLoading: bookingsLoading } = useGetAllBookings();
  const { data: services } = useGetServices();
  const confirmBooking = useConfirmBooking();
  const completeBooking = useCompleteBooking();
  const cancelBooking = useCancelBooking();
  const claimAdmin = useClaimAdminRole();

  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const { data: slotList } = useGetAvailableTimeSlots(slotDate);
  const addSlot = useAddTimeSlot();
  const removeSlot = useRemoveTimeSlot();

  const today = new Date().toISOString().split("T")[0];

  const getServiceName = (serviceId: bigint) => {
    if (!services) return `Service #${serviceId}`;
    return services[Number(serviceId)]?.name ?? `Service #${serviceId}`;
  };

  const handleAction = async (
    action: "confirm" | "complete" | "cancel",
    id: bigint,
  ) => {
    try {
      if (action === "confirm") await confirmBooking.mutateAsync(id);
      else if (action === "complete") await completeBooking.mutateAsync(id);
      else await cancelBooking.mutateAsync(id);
      toast.success(`Booking ${action}ed.`);
    } catch {
      toast.error(`Failed to ${action} booking.`);
    }
  };

  const handleAddSlot = async () => {
    if (!slotDate || !slotTime) {
      toast.error("Please select a date and time.");
      return;
    }
    try {
      await addSlot.mutateAsync({ date: slotDate, time: slotTime });
      setSlotTime("");
      toast.success("Time slot added!");
    } catch {
      toast.error("Failed to add time slot.");
    }
  };

  const handleRemoveSlot = async (date: string, time: string) => {
    try {
      await removeSlot.mutateAsync({ date, time });
      toast.success("Time slot removed.");
    } catch {
      toast.error("Failed to remove time slot.");
    }
  };

  const handleClaimAdmin = async () => {
    try {
      await claimAdmin.mutateAsync();
      toast.success("You are now admin!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to claim admin role.");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-heading font-bold text-2xl mb-3">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please login to access the admin dashboard.
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

  if (adminLoading || adminAssignedLoading) {
    return (
      <div
        className="flex items-center justify-center py-32"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show claim admin card when no admin is assigned and current user isn't admin
  if (!isAdmin && !isAdminAssigned) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card
            className="border-primary/20 shadow-lg"
            data-ocid="admin.claim.card"
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-heading text-2xl">
                Claim Admin Access
              </CardTitle>
              <CardDescription className="text-base mt-2">
                No admin has been set up yet. As the app owner, you can claim
                admin access now.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                onClick={handleClaimAdmin}
                disabled={claimAdmin.isPending}
                data-ocid="admin.claim.primary_button"
                className="w-full bg-primary text-primary-foreground rounded-full h-11 text-base"
              >
                {claimAdmin.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Claim Admin
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate("home")}
                data-ocid="admin.claim.cancel_button"
                className="w-full mt-2 text-muted-foreground"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="admin.access_denied.error_state"
      >
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="font-heading font-bold text-2xl mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You don't have permission to view this page.
        </p>
        <Button
          onClick={() => onNavigate("home")}
          className="bg-primary text-primary-foreground rounded-full px-8"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Manage all bookings and available time slots.
      </p>

      <Tabs defaultValue="bookings" data-ocid="admin.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings" data-ocid="admin.bookings.tab">
            All Bookings
          </TabsTrigger>
          <TabsTrigger value="slots" data-ocid="admin.slots.tab">
            Manage Slots
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {bookingsLoading ? (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="admin.bookings.loading_state"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="admin.bookings.empty_state"
            >
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          ) : (
            <Card data-ocid="admin.bookings.table">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Pet</TableHead>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking, i) => (
                        <TableRow
                          key={booking.id.toString()}
                          data-ocid={`admin.booking.row.${i + 1}`}
                        >
                          <TableCell className="font-mono text-sm">
                            #{booking.id.toString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {getServiceName(booking.serviceId)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {booking.petDetails.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.petDetails.breed || "Mixed"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.slot.date} {booking.slot.time}
                          </TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">
                            {booking.address}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs border ${STATUS_STYLES[booking.status] ?? ""}`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {booking.status === BookingStatus.pending && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAction("confirm", booking.id)
                                  }
                                  data-ocid={`admin.confirm.button.${i + 1}`}
                                  className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Confirm
                                </Button>
                              )}
                              {booking.status === BookingStatus.confirmed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAction("complete", booking.id)
                                  }
                                  data-ocid={`admin.complete.button.${i + 1}`}
                                  className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <Clock className="w-3 h-3 mr-1" /> Complete
                                </Button>
                              )}
                              {(booking.status === BookingStatus.pending ||
                                booking.status === BookingStatus.confirmed) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAction("cancel", booking.id)
                                  }
                                  data-ocid={`admin.cancel.delete_button.${i + 1}`}
                                  className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="w-3 h-3 mr-1" /> Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="slots">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Add Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="slot-date">Date</Label>
                  <Input
                    id="slot-date"
                    type="date"
                    min={today}
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    data-ocid="admin.slot_date.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slot-time">Time</Label>
                  <Input
                    id="slot-time"
                    type="time"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    data-ocid="admin.slot_time.input"
                  />
                </div>
                <Button
                  onClick={handleAddSlot}
                  disabled={addSlot.isPending || !slotDate || !slotTime}
                  data-ocid="admin.add_slot.primary_button"
                  className="w-full bg-primary text-primary-foreground rounded-full"
                >
                  {addSlot.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Time Slot
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Available Slots {slotDate && `— ${slotDate}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!slotDate ? (
                  <p className="text-muted-foreground text-sm">
                    Select a date to view available slots.
                  </p>
                ) : !slotList || slotList.length === 0 ? (
                  <div data-ocid="admin.slots.empty_state">
                    <p className="text-muted-foreground text-sm">
                      No slots for this date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {slotList.map((slot, i) => (
                      <motion.div
                        key={`${slot.date}-${slot.time}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                        data-ocid={`admin.slot.item.${i + 1}`}
                      >
                        <span className="text-sm font-medium">{slot.time}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSlot(slot.date, slot.time)}
                          disabled={removeSlot.isPending}
                          data-ocid={`admin.remove_slot.delete_button.${i + 1}`}
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
