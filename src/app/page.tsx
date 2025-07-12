'use client';

import { useAuth } from '@/hooks/useAuth';
import LoginPage from '@/components/Auth/LoginPage';
import CustomerDashboard from '@/components/Dashboard/CustomerDashboard';
import DriverDashboard from '@/components/Dashboard/DriverDashboard';
import RestaurantDashboard from '@/components/Dashboard/RestaurantDashboard';
import Header from '@/components/Layout/Header';
import MobileContainer from '@/components/Layout/MobileContainer';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import ErrorBoundary from '@/components/UI/ErrorBoundary';

export default function Home() {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="読み込み中..." />
        </div>
      </MobileContainer>
    );
  }

  if (!user) {
    return (
      <MobileContainer withSafeArea={false}>
        <LoginPage onLogin={login} />
      </MobileContainer>
    );
  }

  const renderDashboard = () => {
    switch (user.type) {
      case 'customer':
        return <CustomerDashboard user={user} />;
      case 'driver':
        return <DriverDashboard user={user} />;
      case 'restaurant':
        return <RestaurantDashboard user={user} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-600">無効なユーザータイプです</p>
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <MobileContainer withSafeArea={false}>
        <div className="flex flex-col min-h-screen">
          <Header user={user} onLogout={logout} />
          <main className="flex-1">
            <ErrorBoundary>
              {renderDashboard()}
            </ErrorBoundary>
          </main>
        </div>
      </MobileContainer>
    </ErrorBoundary>
  );
}