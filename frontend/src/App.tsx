import { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { Header } from "./components/Header";
import type { AppTab } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { AuthModal } from "./components/AuthModal";
import { Footer } from "./components/Footer";
import { MenuPage } from "./pages/MenuPage";
import { ClientOrdersPage } from "./pages/ClientOrdersPage";
import { StaffDashboardPage } from "./pages/StaffDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import "./App.css";

function AppContent() {
  const [activeTab, setActiveTab] = useState<AppTab>("menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Si el usuario cierra sesión, regresar automáticamente al Menú
  useEffect(() => {
    if (!isAuthenticated && activeTab !== "menu") {
      setActiveTab("menu");
    }
  }, [isAuthenticated, activeTab]);

  // Si inicia sesión como personal, enviarlo a su panel operativo
  useEffect(() => {
    if (isAuthenticated && user && user.rol !== "CLIENTE" && activeTab === "menu") {
      setActiveTab("staff");
    }
  }, [isAuthenticated, user]);

  const handleOrderCreated = () => {
    // Al confirmar el pedido, cambiar inmediatamente a la vista de seguimiento en tiempo real
    setActiveTab("my-orders");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="main-content">
        {activeTab === "menu" && <MenuPage searchTerm={searchTerm} />}
        {activeTab === "my-orders" && (
          <ClientOrdersPage
            onBackToMenu={() => setActiveTab("menu")}
            onGoToStaff={() => setActiveTab("staff")}
          />
        )}
        {activeTab === "staff" && <StaffDashboardPage />}
        {activeTab === "admin-users" && <AdminUsersPage />}
      </div>

      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <AuthModal />

      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
