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
import SetPage from './components/SetPage.tsx'
import WorkoutPage from './components/WorkoutPage.tsx'
import ExerciseDetailPage from './components/ExerciseDetailPage.tsx'
import AnalyticsPage from './components/AnalyticsPage.tsx'

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
                  <AnalyticsPage />
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
            <Route
              path="/sets"
              element={
                <ProtectedRoute user={user}>
                  <SetPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/:workoutId"
              element={
                <ProtectedRoute user={user}>
                  <WorkoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise/:exerciseId"
              element={
                <ProtectedRoute user={user}>
                  <ExerciseDetailPage />
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
