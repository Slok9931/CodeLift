import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.ts'
import LoginPage from './components/LoginPage.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import Layout from './components/Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import DashboardPage from './components/DashboardPage.tsx'
import ProfilePage from './components/ProfilePage.tsx'
import Loading from './components/Loading.tsx'
import ExercisePage from './components/ExercisePage.tsx'

const App: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading fullScreen message="Loading CodeLift..." />
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route element={<Layout user={user} />}>
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise"
              element={
                <ProtectedRoute user={user}>
                  <ExercisePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute user={user}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
