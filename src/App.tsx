
import "katex/dist/katex.min.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import CourseTopics from "./pages/CourseTopics";
import LessonPage from "./pages/LessonPage";
import Profe from "./pages/Profe";
import Videos from "./pages/Videos";
import Admin from "./pages/Admin";
import Navbar from "./components/layout/Navbar";
import { ThemeProvider } from "./components/providers/ThemeProvider";

import { useEffect } from "react";
import { useAppStore } from "./store/useAppStore";

const queryClient = new QueryClient();

const App = () => {
  const highContrast = useAppStore(s => s.highContrast);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cursos" element={<Courses />} />
            <Route path="/cursos/:grade" element={<CourseTopics />} />
            <Route path="/cursos/:grade/:topicSlug" element={<LessonPage />} />
            <Route path="/profe" element={<Profe />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
