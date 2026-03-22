import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  PawPrint,
  Scissors,
  Shield,
  Sparkles,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Service, TimeSlot } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateBooking,
  useGetAvailableTimeSlots,
  useGetServices,
} from "../hooks/useQueries";

const SERVICE_ICONS = [Scissors, Sparkles, Shield, Wind];

const DEFAULT_SERVICES: Service[] = [
  {
    name: "Pet Grooming",
    description:
      "Complete grooming session including bath, brush-out, nail trimming, and ear cleaning.",
    duration: 60n,
    price: 1200n,
  },
  {
    name: "Premium Grooming",
    description:
      "Full spa treatment with premium shampoo, styling, haircut, and finishing touches.",
    duration: 90n,
    price: 2500n,
  },
  {
    name: "Anti-Tick Treatment",
    description:
      "Specialized anti-tick and anti-flea treatment to keep your pet safe and itch-free.",
    duration: 30n,
    price: 700n,
  },
  {
    name: "De-Shedding Cure",
    description:
      "Professional de-shedding treatment to reduce loose fur and keep your home clean.",
    duration: 45n,
    price: 1199n,
  },
];

const STEPS = [
  { id: 1, label: "Service", icon: Scissors },
  { id: 2, label: "Schedule", icon: Calendar },
  { id: 3, label: "Pet Details", icon: PawPrint },
  { id: 4, label: "Confirm", icon: ClipboardList },
];

interface BookingPageProps {
  onNavigate: (page: string) => void;
}

export default function BookingPage({ onNavigate }: BookingPageProps) {
  const [step, setStep] = useState(1);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState<number | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { identity } = useInternetIdentity();
  const { data: backendServices, isLoading: servicesLoading } =
    useGetServices();
  const { data: timeSlots, isLoading: slotsLoading } =
    useGetAvailableTimeSlots(selectedDate);
  const createBooking = useCreateBooking();

  const services =
    backendServices && backendServices.length > 0
      ? backendServices
      : DEFAULT_SERVICES;
  const today = new Date().toISOString().split("T")[0];

  const handleConfirm = async () => {
    if (selectedServiceIdx === null || !selectedSlot || !petName || !address) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await createBooking.mutateAsync({
        serviceId: BigInt(selectedServiceIdx),
        slot: selectedSlot,
        petDetails: {
          name: petName,
          breed: petBreed,
          age: BigInt(Math.max(0, Number.parseInt(petAge) || 0)),
          notes,
        },
        address,
      });
      setBookingSuccess(true);
    } catch {
      toast.error("Failed to create booking. Please try again.");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <PawPrint className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl mb-3">
            Login to Book
          </h2>
          <p className="text-muted-foreground mb-6">
            Please login with Internet Identity to book a grooming session.
          </p>
          <Button
            onClick={() => onNavigate("home")}
            className="bg-accent text-accent-foreground rounded-full px-8"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="booking.success_state"
      >
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-heading font-bold text-3xl mb-3 text-foreground">
            Booking Confirmed!
          </h2>
          <p className="text-muted-foreground mb-2">
            Your grooming session has been booked successfully.
          </p>
          <p className="text-muted-foreground mb-8">
            {selectedDate} at {selectedSlot?.time} for{" "}
            <strong>{petName}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => onNavigate("my-bookings")}
              className="bg-primary text-primary-foreground rounded-full px-6"
              data-ocid="booking.view_bookings.button"
            >
              View My Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("home")}
              className="rounded-full px-6"
              data-ocid="booking.home.button"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
        Book a Session
      </h1>
      <p className="text-muted-foreground mb-8">
        Schedule a doorstep grooming visit for your pet.
      </p>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="contents">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive
                      ? "text-accent"
                      : isDone
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-heading font-semibold text-xl mb-4">
              Choose a Service
            </h2>
            {servicesLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="booking.services.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service, i) => {
                  const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
                  return (
                    <Card
                      key={service.name}
                      data-ocid={`booking.service.item.${i + 1}`}
                      className={`cursor-pointer transition-all ${
                        selectedServiceIdx === i
                          ? "border-primary ring-2 ring-primary/30 shadow-card"
                          : "hover:border-primary/40 hover:shadow-card"
                      }`}
                      onClick={() => setSelectedServiceIdx(i)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-semibold">
                              {service.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {Number(service.duration)} min
                              </span>
                              <span className="font-bold text-primary text-sm">
                                ₹{Number(service.price)}
                              </span>
                            </div>
                          </div>
                          {selectedServiceIdx === i && (
                            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={selectedServiceIdx === null}
                data-ocid="booking.step1.button"
                className="bg-primary text-primary-foreground rounded-full px-8"
              >
                Next: Schedule <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-heading font-semibold text-xl mb-4">
              Select Date &amp; Time
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  data-ocid="booking.date.input"
                  className="max-w-xs"
                />
              </div>
              {selectedDate && (
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  {slotsLoading ? (
                    <div
                      className="flex items-center gap-2 py-4"
                      data-ocid="booking.slots.loading_state"
                    >
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground text-sm">
                        Loading slots...
                      </span>
                    </div>
                  ) : timeSlots && timeSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot, i) => (
                        <button
                          type="button"
                          key={`${slot.date}-${slot.time}`}
                          onClick={() => setSelectedSlot(slot)}
                          data-ocid={`booking.slot.item.${i + 1}`}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            selectedSlot?.time === slot.time
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="py-4 text-muted-foreground text-sm"
                      data-ocid="booking.slots.empty_state"
                    >
                      No time slots available for this date. Please choose
                      another date.
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-full"
                data-ocid="booking.step2.back.button"
              >
                <ChevronLeft className="mr-1 w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedSlot}
                data-ocid="booking.step2.button"
                className="bg-primary text-primary-foreground rounded-full px-8"
              >
                Next: Pet Details <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-heading font-semibold text-xl mb-4">
              Pet Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pet-name">Pet Name *</Label>
                <Input
                  id="pet-name"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g. Max"
                  data-ocid="booking.pet_name.input"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pet-breed">Breed</Label>
                <Input
                  id="pet-breed"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  placeholder="e.g. Golden Retriever"
                  data-ocid="booking.pet_breed.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pet-age">Age (years)</Label>
                <Input
                  id="pet-age"
                  type="number"
                  min="0"
                  max="30"
                  value={petAge}
                  onChange={(e) => setPetAge(e.target.value)}
                  placeholder="e.g. 3"
                  data-ocid="booking.pet_age.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Service Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your home address"
                  data-ocid="booking.address.input"
                  required
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="notes">Special Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions, allergies, or behavioral notes..."
                  rows={3}
                  data-ocid="booking.notes.textarea"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="rounded-full"
                data-ocid="booking.step3.back.button"
              >
                <ChevronLeft className="mr-1 w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!petName || !address}
                data-ocid="booking.step3.button"
                className="bg-primary text-primary-foreground rounded-full px-8"
              >
                Review Booking <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="font-heading font-semibold text-xl mb-4">
              Review &amp; Confirm
            </h2>
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Service
                    </p>
                    <p className="font-semibold">
                      {selectedServiceIdx !== null
                        ? services[selectedServiceIdx]?.name
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <p className="font-semibold text-primary">
                      {selectedServiceIdx !== null
                        ? `₹${Number(services[selectedServiceIdx]?.price)}`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Date &amp; Time
                    </p>
                    <p className="font-semibold">
                      {selectedDate} at {selectedSlot?.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Duration
                    </p>
                    <p className="font-semibold">
                      {selectedServiceIdx !== null
                        ? `${Number(services[selectedServiceIdx]?.duration)} min`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Pet Name
                    </p>
                    <p className="font-semibold">{petName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Breed / Age
                    </p>
                    <p className="font-semibold">
                      {petBreed || "—"} / {petAge ? `${petAge} yrs` : "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Address
                    </p>
                    <p className="font-semibold">{address}</p>
                  </div>
                  {notes && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Notes
                      </p>
                      <p className="text-sm">{notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="rounded-full"
                data-ocid="booking.step4.back.button"
              >
                <ChevronLeft className="mr-1 w-4 h-4" /> Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={createBooking.isPending}
                data-ocid="booking.confirm.primary_button"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8"
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking <CheckCircle className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
