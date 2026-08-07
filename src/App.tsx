import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Index from "./pages/Index";
import DealScreen from "./pages/DealScreen";
import CreateDeal from "./pages/CreateDeal";
import DisputeScreen from "./pages/DisputeScreen";
import Profile from "./pages/Profile";
import DealsPage from "./pages/DealsPage";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import ChatThread from "./pages/ChatThread";
import Checkout from "./pages/Checkout";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="mobile-shell max-w-lg mx-auto relative min-h-dvh bg-background">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<Protected><Index /></Protected>} />
              <Route path="/deals" element={<Protected><DealsPage /></Protected>} />
              <Route path="/deal/:id" element={<Protected><DealScreen /></Protected>} />
              <Route path="/create" element={<Protected><CreateDeal /></Protected>} />
              <Route path="/checkout/:dealId" element={<Protected><Checkout /></Protected>} />
              <Route path="/dispute" element={<Protected><DisputeScreen /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/chat" element={<Protected><Chat /></Protected>} />
              <Route path="/chat/:dealId" element={<Protected><ChatThread /></Protected>} />
              <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
