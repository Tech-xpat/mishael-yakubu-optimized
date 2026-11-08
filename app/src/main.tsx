import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// Fonts are bundled with the site (no request to Google Fonts)
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/big-shoulders-display/latin-600'
import '@fontsource/big-shoulders-display/latin-700'
import '@fontsource/big-shoulders-display/latin-800'
import './index.css'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop'
import SmoothScroll from './components/SmoothScroll'
import ChatAssistant from './components/ChatAssistant'
import ThemeGuard from './components/ThemeGuard'
import { RouteSkeleton } from './components/Skeletons'
import { installPressFeedback } from './lib/pressFeedback'

// Everything except the home page is loaded on demand, so the first visit
// only downloads what the landing page actually needs.
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const AdminRoutes = lazy(() => import('./pages/AdminRoutes'))
const NotFound = lazy(() => import('./pages/NotFound'))

installPressFeedback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeGuard />
      <SmoothScroll />
      <ScrollToTop />
      <Suspense fallback={<RouteSkeleton />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/portfolio/:type" element={<CategoryPage />} />
          <Route path="/portfolio/:type/:subcategory" element={<CategoryPage />} />
          <Route path="/gallery/:category" element={<GalleryPage />} />
          <Route path="/greatness/*" element={<AdminRoutes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ChatAssistant />
    </BrowserRouter>
  </StrictMode>,
)
