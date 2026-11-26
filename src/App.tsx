import { lazy, Suspense, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { ContentProvider } from './lib/content'
import { Seo } from './lib/seo'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectPage } from './pages/ProjectPage'

// The dashboard (and the Supabase SDK it needs) is a separate chunk that public visitors never download.
const AdminApp = lazy(() => import('./admin/AdminApp'))

/** Scrolls to the hash target after navigation, or to the top when there is none. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

function PublicLayout() {
  return (
    <ContentProvider>
      <Header />
      <main id="main" tabIndex={-1}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </ContentProvider>
  )
}

function AdminRoute() {
  return (
    <ErrorBoundary>
      <Seo title="Admin | Portfolio" description="Portfolio administration." path="/admin/" noindex />
      <Suspense fallback={<div className="admin-loading" role="status">Loading dashboard…</div>}>
        <AdminApp />
      </Suspense>
    </ErrorBoundary>
  )
}

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
