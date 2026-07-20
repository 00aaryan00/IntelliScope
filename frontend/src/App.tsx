import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider, useAuth } from './components/auth/AuthWrapper'
import { Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { FeedPage } from './pages/FeedPage'
import { ComingSoon } from './pages/ComingSoon'
import { IntelligenceDetail } from './pages/IntelligenceDetail'
import { SavedPage } from './pages/SavedPage'
import { MobileMenuPage } from './pages/MobileMenuPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AuthPage } from './pages/AuthPage'
import { AlertsPage } from './pages/AlertsPage'
import { SearchPage } from './pages/SearchPage'
import { SystemHealthPage } from './pages/SystemHealthPage'
import { OnboardingPage } from './pages/OnboardingPage'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={
            <AuthGuard>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/search" element={<SearchPage />} />
          
          {/* Core Feeds */}
          <Route path="/news" element={<FeedPage title="News" description="Latest updates and breakthroughs." typeFilter="news" />} />
          <Route path="/funding" element={<FeedPage title="Startup Funding" description="Venture capital investments in the AI sector." typeFilter="funding" />} />
          <Route path="/research" element={<FeedPage title="Research Papers" description="Cutting-edge AI research from Arxiv and top labs." typeFilter="research" />} />
          <Route path="/models" element={<FeedPage title="Models & Releases" description="Latest foundational and fine-tuned model releases." typeFilter="models" />} />
          <Route path="/vc" element={<FeedPage title="VC Intelligence" description="Venture capital strategies and new fund announcements." typeFilter="vc" />} />
          <Route path="/gov" element={<FeedPage title="Government & Policy" description="AI regulations, policy updates, and government spending." typeFilter="gov" />} />
          <Route path="/opensource" element={<FeedPage title="Open Source" description="Major open-source ecosystem updates." typeFilter="opensource" />} />
          <Route path="/dev" element={<FeedPage title="Dev Ecosystem" description="Developer tools, frameworks, and SDK updates." typeFilter="dev" />} />
          <Route path="/social" element={<FeedPage title="Social Intelligence" description="Trending topics and sentiment analysis across social platforms." typeFilter="social" />} />
          <Route path="/business" element={<FeedPage title="Business Intel" description="Enterprise AI adoption and tracked organization product launches." typeFilter="business" />} />
          
          {/* Detail View */}
          <Route path="/detail/:id" element={<IntelligenceDetail />} />
          
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/menu" element={<MobileMenuPage />} />
          <Route path="/health" element={<SystemHealthPage />} />
          
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
                </Routes>
              </AppLayout>
            </AuthGuard>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
