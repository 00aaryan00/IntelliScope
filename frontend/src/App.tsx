import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { FeedPage } from './pages/FeedPage'
import { ComingSoon } from './pages/ComingSoon'
import { IntelligenceDetail } from './pages/IntelligenceDetail'
import { SavedPage } from './pages/SavedPage'
import { MobileMenuPage } from './pages/MobileMenuPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AuthPage } from './pages/AuthPage'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<AuthPage />} />
          
          {/* Core Feeds */}
          <Route path="/news" element={<FeedPage title="AI News" description="Latest updates and breakthroughs." typeFilter="news" />} />
          <Route path="/funding" element={<FeedPage title="Startup Funding" description="Venture capital investments in the AI sector." typeFilter="funding" />} />
          <Route path="/research" element={<FeedPage title="Research Papers" description="Cutting-edge AI research from Arxiv and top labs." typeFilter="research" />} />
          
          {/* Detail View */}
          <Route path="/detail/:id" element={<IntelligenceDetail />} />

          {/* Fallbacks */}
          <Route path="/models" element={<ComingSoon title="Models & Releases" />} />
          <Route path="/vc" element={<ComingSoon title="VC Intelligence" />} />
          <Route path="/gov" element={<ComingSoon title="Government & Policy" />} />
          <Route path="/opensource" element={<ComingSoon title="Open Source" />} />
          <Route path="/dev" element={<ComingSoon title="Dev Ecosystem" />} />
          <Route path="/social" element={<ComingSoon title="Social Intelligence" />} />
          <Route path="/business" element={<ComingSoon title="Business Intel" />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/menu" element={<MobileMenuPage />} />
          
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
