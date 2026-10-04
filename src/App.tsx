import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AdminLayout } from "@/admin/components/AdminLayout";
import AdminLogin from "@/admin/pages/AdminLogin";
import { RequireAdmin } from "@/admin/pages/RequireAdmin";
import Dashboard from "@/admin/pages/Dashboard";
import Users from "@/admin/pages/Users";
import UserProfile from "@/admin/pages/UserProfile";
import Listings from "@/admin/pages/Listings";
import Orders from "@/admin/pages/Orders";
import Disputes from "@/admin/pages/Disputes";
import DisputeDetail from "@/admin/pages/DisputeDetail";
import Inventory from "@/admin/pages/Inventory";
import Payments from "@/admin/pages/Payments";
import PaymentDetail from "@/admin/pages/PaymentDetail";
import Pickups from "@/admin/pages/Pickups";
import DropoffBooks from "@/admin/pages/DropoffBooks";
import DropoffCentres from "@/admin/pages/DropoffCentres";
import DropoffDetail from "@/admin/pages/DropoffDetail";
import Analytics from "@/admin/pages/Analytics";
import Feedback from "@/admin/pages/Feedback";
import Settings from "@/admin/pages/Settings";
import Locations from "@/admin/pages/Locations";
import OrderDetail from "@/admin/pages/OrderDetail";
import ListingDetail from "@/admin/pages/ListingDetail";
import PickupDetail from "@/admin/pages/PickupDetail";
import ConfigurationDeliveryFees from "@/admin/pages/ConfigurationDeliveryFees";
import ConfigurationPlatformFees from "@/admin/pages/ConfigurationPlatformFees";
import CatalogueCategories from "@/admin/pages/CatalogueCategories";
import CatalogueTags from "@/admin/pages/CatalogueTags";
import CatalogueCollections from "@/admin/pages/CatalogueCollections";
import CatalogueLandingPage from "@/admin/pages/CatalogueLandingPage";
import CheckoutSessions from "@/admin/pages/CheckoutSessions";
import CheckoutSessionDetail from "@/admin/pages/CheckoutSessionDetail";
import Vouchers from "@/admin/pages/Vouchers";

const queryClient = new QueryClient();

const adminWrap = (el: React.ReactNode) => (
  <RequireAdmin>
    <AdminLayout>{el}</AdminLayout>
  </RequireAdmin>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={adminWrap(<Dashboard />)} />
          <Route path="/admin/users" element={adminWrap(<Users />)} />
          <Route path="/admin/users/:id" element={adminWrap(<UserProfile />)} />
          <Route path="/admin/sellers" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/listings" element={adminWrap(<Listings />)} />
          <Route path="/admin/listings/:id" element={adminWrap(<ListingDetail />)} />
          <Route path="/admin/orders" element={adminWrap(<Orders />)} />
          <Route path="/admin/orders/:id" element={adminWrap(<OrderDetail />)} />
          <Route path="/admin/checkout-sessions" element={adminWrap(<CheckoutSessions />)} />
          <Route path="/admin/checkout-sessions/:id" element={adminWrap(<CheckoutSessionDetail />)} />
          <Route path="/admin/vouchers" element={adminWrap(<Vouchers />)} />
          <Route path="/admin/disputes" element={adminWrap(<Disputes />)} />
          <Route path="/admin/disputes/:orderNumber" element={adminWrap(<DisputeDetail />)} />
          <Route path="/admin/inventory" element={adminWrap(<Inventory />)} />
          <Route path="/admin/payments" element={adminWrap(<Payments />)} />
          <Route path="/admin/payments/:id" element={adminWrap(<PaymentDetail />)} />
          <Route path="/admin/pickups" element={adminWrap(<Pickups />)} />
          <Route path="/admin/pickups/:id" element={adminWrap(<PickupDetail />)} />
          <Route path="/admin/dropoffs" element={<Navigate to="/admin/dropoffs/books" replace />} />
          <Route path="/admin/dropoffs/books" element={adminWrap(<DropoffBooks />)} />
          <Route path="/admin/dropoffs/books/:id" element={adminWrap(<DropoffDetail />)} />
          <Route path="/admin/dropoffs/centres" element={adminWrap(<DropoffCentres />)} />
          <Route path="/admin/analytics" element={adminWrap(<Analytics />)} />
          <Route path="/admin/feedback" element={adminWrap(<Feedback />)} />
          <Route path="/admin/reports" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/admin/locations" element={adminWrap(<Locations />)} />
          <Route path="/admin/settings" element={adminWrap(<Settings />)} />

          <Route
            path="/admin/configuration/delivery-fees"
            element={adminWrap(<ConfigurationDeliveryFees />)}
          />
          <Route
            path="/admin/configuration/platform-fees"
            element={adminWrap(<ConfigurationPlatformFees />)}
          />

          <Route path="/admin/catalogue" element={<Navigate to="/admin/catalogue/categories" replace />} />
          <Route path="/admin/catalogue/categories" element={adminWrap(<CatalogueCategories />)} />
          <Route path="/admin/catalogue/tags" element={adminWrap(<CatalogueTags />)} />
          <Route path="/admin/catalogue/collections" element={adminWrap(<CatalogueCollections />)} />
          <Route path="/admin/catalogue/landing-page" element={adminWrap(<CatalogueLandingPage />)} />

          <Route path="/admin/configuration" element={<Navigate to="/admin/configuration/platform-fees" replace />} />
          <Route path="/admin/insights" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
