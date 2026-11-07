import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScrollToTop from './components/ScrollToTop'
import SmoothScroll from './components/SmoothScroll'
import WhatsAppButton from './components/WhatsAppButton'
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
      <WhatsAppButton />
    </BrowserRouter>
  </StrictMode>,
)
