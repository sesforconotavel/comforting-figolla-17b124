import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import PropertyForm from "./pages/admin/PropertyForm";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/imoveis" element={<Listings />} />
      <Route path="/imovel/:id" element={<PropertyDetail />} />
      <Route path="/sobre" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/backoffice" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/backoffice/novo" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
      <Route path="/backoffice/editar/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <AppRouter />
            <FloatingWhatsApp />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
