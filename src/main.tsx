import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { UserProvider } from "./components/user-context";
import { Toaster } from "./components/ui/toaster";
import Index from "./pages/Index";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import DMCA from "./pages/DMCA";
import WriterLogin from "./pages/WriterLogin";
import AdminLogin from "./pages/AdminLogin";
import ReaderLogin from "./pages/ReaderLogin";
import NotFound from "./pages/NotFound";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider storageKey="vite-ui-theme">
      <UserProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/writer/login" element={<WriterLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reader/login" element={<ReaderLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  </BrowserRouter>
);
