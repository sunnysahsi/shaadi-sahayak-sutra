
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import WeddingProvider from "./contexts/WeddingContext";
import Index from "./pages/Index";
import BudgetPlanner from "./pages/BudgetPlanner";
import EventSchedule from "./pages/EventSchedule";
import GuestList from "./pages/GuestList";
import TodoList from "./pages/TodoList";
import VendorManager from "./pages/VendorManager";
import NotesInspiration from "./pages/NotesInspiration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WeddingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/events" element={<EventSchedule />} />
            <Route path="/guests" element={<GuestList />} />
            <Route path="/todos" element={<TodoList />} />
            <Route path="/vendors" element={<VendorManager />} />
            <Route path="/notes" element={<NotesInspiration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WeddingProvider>
  </QueryClientProvider>
);

export default App;
