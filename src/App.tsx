import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { WelcomePage } from '@/pages/WelcomePage';
import { LandingPage } from '@/components/landing/LandingPage';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { TrackingDashboard } from '@/components/tracking/TrackingDashboard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoginModal } from '@/components/auth/LoginModal';
import { PartnerLogin } from '@/pages/PartnerLogin';
import { PartnerDashboard } from '@/pages/PartnerDashboard';
import { PaymentVerify } from '@/pages/PaymentVerify';
import { BookingHistory } from '@/pages/BookingHistory';
import { ProfilePage } from '@/pages/ProfilePage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

type AppView = 
  | 'welcome'
  | 'landing' 
  | 'booking' 
  | 'tracking' 
  | 'profile' 
  | 'partner-login' 
  | 'partner-dashboard' 
  | 'payment-verify'
  | 'booking-history'
  | 'search'
  | 'admin';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [, setSelectedPartner] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Detect Paystack redirect
    if (urlParams.get('reference')) {
      setCurrentView('payment-verify');
      return;
    }

    // Detect admin access
    if (urlParams.get('admin') === 'true') {
      setCurrentView('admin');
      window.history.replaceState({}, document.title, '/');
      return;
    }
  }, []);

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setCurrentView('booking');
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (selectedSchool) {
      setCurrentView('booking');
    }
  };

  const handleBookFromSearch = (partnerId: string) => {
    setSelectedPartner(partnerId);
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setCurrentView('booking');
    }
  };

  // These pages have their own layout so hide main navbar/footer
  const isWelcomePage = currentView === 'welcome';
  const isFullScreenPage = ['partner-login', 'partner-dashboard', 'admin'].includes(currentView);
  const hideNavAndFooter = isWelcomePage || isFullScreenPage;

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomePage
            onGetStarted={() => {
              if (!isAuthenticated) {
                setShowLogin(true);
              } else {
                setCurrentView('landing');
              }
            }}
            onSearch={() => setCurrentView('search')}
            onLogin={() => setShowLogin(true)}
          />
        );
      case 'landing':
        return (
          <LandingPage
            onSchoolSelect={handleSchoolSelect}
            onBookRide={() => {
              if (!isAuthenticated) {
                setShowLogin(true);
              } else {
                setCurrentView('booking');
              }
            }}
          />
        );
      case 'booking':
        return (
          <BookingFlow
            schoolId={selectedSchool}
            onBack={() => setCurrentView('landing')}
            onComplete={() => setCurrentView('tracking')}
          />
        );
      case 'tracking':
        return (
          <TrackingDashboard
            onBack={() => setCurrentView('welcome')}
          />
        );
      case 'partner-login':
        return (
          <PartnerLogin
            onSuccess={() => setCurrentView('partner-dashboard')}
          />
        );
      case 'partner-dashboard':
        return (
          <PartnerDashboard
            onBack={() => setCurrentView('welcome')}
          />
        );
      case 'payment-verify':
        return (
          <PaymentVerify
            onSuccess={() => setCurrentView('booking-history')}
            onBack={() => setCurrentView('booking')}
          />
        );
      case 'booking-history':
        return (
          <BookingHistory
            onBack={() => setCurrentView('welcome')}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            onBack={() => setCurrentView('welcome')}
          />
        );
      case 'search':
        return (
          <SearchPage
            onBack={() => setCurrentView('welcome')}
            onBook={handleBookFromSearch}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            onBack={() => setCurrentView('welcome')}
          />
        );
      default:
        return (
          <WelcomePage
            onGetStarted={() => setShowLogin(true)}
            onSearch={() => setCurrentView('search')}
            onLogin={() => setShowLogin(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {!hideNavAndFooter && (
        <Navbar
          onNavigate={setCurrentView}
          onLoginClick={() => setShowLogin(true)}
          onPartnerClick={() => setCurrentView('partner-login')}
          onSearchClick={() => setCurrentView('search')}
        />
      )}

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!hideNavAndFooter && <Footer />}

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#fff',
            border: 'none',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
