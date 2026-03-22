import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";
import LandingPage from "./pages/LandingPage";
import MyBookingsPage from "./pages/MyBookingsPage";

type Page = "home" | "services" | "booking" | "my-bookings" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAdmin={!!isAdmin}
      />

      <div className="flex-1">
        {currentPage === "home" && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === "services" && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        {currentPage === "booking" && (
          <BookingPage onNavigate={handleNavigate} />
        )}
        {currentPage === "my-bookings" && (
          <MyBookingsPage onNavigate={handleNavigate} />
        )}
        {currentPage === "admin" && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}
      </div>

      <Footer />

      <ProfileSetup open={showProfileSetup} />
      <Toaster richColors />
    </div>
  );
}
