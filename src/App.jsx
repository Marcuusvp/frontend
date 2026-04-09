import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './contexts/AuthProvider'
import { PrivateRoute } from './components/PrivateRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { LoadingScreen } from './components/LoadingScreen'

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Cards = lazy(() => import('./pages/Cards'))
const Invoice = lazy(() => import('./pages/Invoice'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const Balance = lazy(() => import('./pages/Balance'))
const Profile = lazy(() => import('./pages/Profile'))

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
}

function ProtectedLayout({ children }) {
  return (
    <PrivateRoute>
      <Layout>
        <SuspenseWrapper>{children}</SuspenseWrapper>
      </Layout>
    </PrivateRoute>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
            <Route path="/signup" element={<SuspenseWrapper><Signup /></SuspenseWrapper>} />
            <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPassword /></SuspenseWrapper>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/cards"
              element={
                <ProtectedLayout>
                  <Cards />
                </ProtectedLayout>
              }
            />
            <Route
              path="/cards/:cardId/invoice"
              element={
                <ProtectedLayout>
                  <Invoice />
                </ProtectedLayout>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedLayout>
                  <Subscriptions />
                </ProtectedLayout>
              }
            />
            <Route
              path="/balance"
              element={
                <ProtectedLayout>
                  <Balance />
                </ProtectedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
