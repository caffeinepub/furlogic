import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module PetGroomingService {
    public type Service = {
      name : Text;
      description : Text;
      duration : Nat;
      price : Nat;
    };
    public type PetDetails = {
      name : Text;
      breed : Text;
      age : Nat;
      notes : Text;
    };
    public type TimeSlot = {
      date : Text;
      time : Text;
    };
    public type BookingStatus = {
      #pending;
      #confirmed;
      #cancelled;
      #completed;
    };
    public type Booking = {
      id : Nat;
      user : Principal;
      serviceId : Nat;
      slot : TimeSlot;
      petDetails : PetDetails;
      address : Text;
      status : BookingStatus;
    };
  };

  let serviceCatalog : Map.Map<Nat, PetGroomingService.Service> = Map.empty<Nat, PetGroomingService.Service>();
  let timeSlots : Map.Map<Text, Map.Map<Text, Bool>> = Map.empty<Text, Map.Map<Text, Bool>>();
  let bookings : Map.Map<Nat, PetGroomingService.Booking> = Map.empty<Nat, PetGroomingService.Booking>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    address : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextBookingId = 0;

  func getNextBookingId() : Nat {
    let id = nextBookingId;
    nextBookingId += 1;
    id;
  };

  func getBookingByIdInternal(bookingId : Nat) : PetGroomingService.Booking {
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) { booking };
    };
  };

  func checkIsAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // Check if admin has been claimed yet
  public query func isAdminAssigned() : async Bool {
    accessControlState.adminAssigned;
  };

  // Claim admin role - only works if no admin has been assigned yet
  public shared ({ caller }) func claimAdminRole() : async () {
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin has already been assigned");
    };
    accessControlState.adminAssigned := true;
    accessControlState.userRoles.add(caller, #admin);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createBooking(serviceId : Nat, slot : PetGroomingService.TimeSlot, petDetails : PetGroomingService.PetDetails, address : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    let bookingId = getNextBookingId();
    let booking : PetGroomingService.Booking = {
      id = bookingId;
      user = caller;
      serviceId;
      slot;
      petDetails;
      address;
      status = #pending;
    };
    bookings.add(bookingId, booking);
    bookingId;
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    let booking = getBookingByIdInternal(bookingId);
    if (booking.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized to cancel this booking");
    };
    switch (booking.status) {
      case (#pending) {};
      case (#confirmed) {};
      case (_) { Runtime.trap("Booking cannot be cancelled") };
    };
    let updatedBooking : PetGroomingService.Booking = { booking with status = #cancelled };
    bookings.add(bookingId, updatedBooking);
  };

  public shared ({ caller }) func confirmBooking(bookingId : Nat) : async () {
    checkIsAdmin(caller);
    let booking = getBookingByIdInternal(bookingId);
    if (booking.status != #pending) { Runtime.trap("Booking cannot be confirmed") };
    let updatedBooking : PetGroomingService.Booking = { booking with status = #confirmed };
    bookings.add(bookingId, updatedBooking);
  };

  public shared ({ caller }) func completeBooking(bookingId : Nat) : async () {
    checkIsAdmin(caller);
    let booking = getBookingByIdInternal(bookingId);
    if (booking.status != #confirmed) { Runtime.trap("Booking cannot be completed") };
    let updatedBooking : PetGroomingService.Booking = { booking with status = #completed };
    bookings.add(bookingId, updatedBooking);
  };

  public shared ({ caller }) func addTimeSlot(date : Text, time : Text) : async () {
    checkIsAdmin(caller);
    let slotsForDate = switch (timeSlots.get(date)) {
      case (?dateSlots) { dateSlots };
      case (null) { Map.empty<Text, Bool>() };
    };
    let updatedDateSlots = Map.empty<Text, Bool>();
    for ((k, v) in slotsForDate.entries()) {
      updatedDateSlots.add(k, v);
    };
    updatedDateSlots.add(time, true);
    timeSlots.add(date, updatedDateSlots);
  };

  public shared ({ caller }) func removeTimeSlot(date : Text, time : Text) : async () {
    checkIsAdmin(caller);
    let slotsForDate = switch (timeSlots.get(date)) {
      case (?dateSlots) { dateSlots };
      case (null) { Runtime.trap("Date not found") };
    };
    if (slotsForDate.size() == 1) {
      timeSlots.remove(date);
    } else {
      let updatedDateSlots = Map.empty<Text, Bool>();
      for ((k, v) in slotsForDate.entries()) {
        if (k != time) {
          updatedDateSlots.add(k, v);
        };
      };
      timeSlots.add(date, updatedDateSlots);
    };
  };

  public query ({ caller }) func getAvailableTimeSlots(date : Text) : async [PetGroomingService.TimeSlot] {
    switch (timeSlots.get(date)) {
      case (?dateSlots) {
        let times = dateSlots.keys().toArray();
        times.map(
          func(t) {
            {
              date;
              time = t;
            };
          }
        );
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getMyBookings() : async [PetGroomingService.Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };
    bookings.values().toArray().filter(func(b) { b.user == caller });
  };

  public query ({ caller }) func getAllBookings() : async [PetGroomingService.Booking] {
    checkIsAdmin(caller);
    bookings.values().toArray();
  };

  public shared ({ caller }) func addService(name : Text, description : Text, duration : Nat, price : Nat) : async Nat {
    checkIsAdmin(caller);
    let serviceId = serviceCatalog.size();
    let service : PetGroomingService.Service = {
      name;
      description;
      duration;
      price;
    };
    serviceCatalog.add(serviceId, service);
    serviceId;
  };

  public query ({ caller }) func getServices() : async [PetGroomingService.Service] {
    serviceCatalog.values().toArray();
  };
};
