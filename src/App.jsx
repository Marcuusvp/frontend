import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthProvider'
import { PrivateRoute } from './components/PrivateRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { ForgotPassword } from './pages/ForgotPassword'
import { Dashboard } from './pages/Dashboard'
import { Cards } from './pages/Cards'
import { Invoice } from './pages/Invoice'
import { Subscriptions } from './pages/Subscriptions'
import { Balance } from './pages/Balance'
import { Profile } from './pages/Profile'

function ProtectedLayout({ children }) {
  return (
    <PrivateRoute>
      <Layout>
        {children}
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
