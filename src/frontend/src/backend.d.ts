import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimeSlot {
    date: string;
    time: string;
}
export interface Service {
    duration: bigint;
    name: string;
    description: string;
    price: bigint;
}
export interface Booking {
    id: bigint;
    status: BookingStatus;
    slot: TimeSlot;
    user: Principal;
    address: string;
    serviceId: bigint;
    petDetails: PetDetails;
}
export interface PetDetails {
    age: bigint;
    name: string;
    notes: string;
    breed: string;
}
export interface UserProfile {
    name: string;
    address: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addService(name: string, description: string, duration: bigint, price: bigint): Promise<bigint>;
    addTimeSlot(date: string, time: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    claimAdminRole(): Promise<void>;
    completeBooking(bookingId: bigint): Promise<void>;
    confirmBooking(bookingId: bigint): Promise<void>;
    createBooking(serviceId: bigint, slot: TimeSlot, petDetails: PetDetails, address: string): Promise<bigint>;
    getAllBookings(): Promise<Array<Booking>>;
    getAvailableTimeSlots(date: string): Promise<Array<TimeSlot>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyBookings(): Promise<Array<Booking>>;
    getServices(): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminAssigned(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    removeTimeSlot(date: string, time: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
