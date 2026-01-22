import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import WorkoutService from '../services/workout'
import type { Workout } from '../types'
import Loading from './Loading'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Plus, Clock, Calendar, Play, Pause } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatDate, formatTime } from '../lib/utils'

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingWorkout, setCreatingWorkout] = useState(false)
  const [endingWorkout, setEndingWorkout] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeWorkoutId = searchParams.get('workoutId')
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (user?._id) {
      fetchWorkouts()
    }
  }, [user])

  useEffect(() => {
    if (activeWorkoutId) {
      fetchActiveWorkout()
    } else {
      setActiveWorkout(null)
      setElapsedTime(0)
    }
  }, [activeWorkoutId])

  useEffect(() => {
    if (activeWorkout && !activeWorkout.endTime) {
      const interval = setInterval(() => {
        const start = new Date(activeWorkout.startTime).getTime()
        const now = Date.now()
        setElapsedTime(Math.floor((now - start) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activeWorkout])

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const response = await WorkoutService.getWorkoutsByUserId(user!._id)
      setWorkouts(response.workouts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
      setError(null)
    } catch (err) {
      setError('Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveWorkout = async () => {
    try {
      const response = await WorkoutService.getWorkoutById(activeWorkoutId!)
      setActiveWorkout(response.workout)
    } catch (err) {
      console.error('Failed to fetch active workout')
    }
  }

  const handleStartWorkout = async () => {
    if (!user) return
    try {
      setCreatingWorkout(true)
      const now = new Date()
      const response = await WorkoutService.addWorkout({
        userIds: [user._id],
        date: now,
        startTime: now,
      })
      setSearchParams({ workoutId: response.workout.workoutId })
      fetchWorkouts()
    } catch (err) {
      setError('Failed to start workout')
    } finally {
      setCreatingWorkout(false)
    }
  }

  const handleEndWorkout = async () => {
    if (!activeWorkout) return
    try {
      setEndingWorkout(true)
      await WorkoutService.updateWorkout(activeWorkout.workoutId, {
        endTime: new Date(),
      })
      setSearchParams({})
      fetchWorkouts()
    } catch (err) {
      setError('Failed to end workout')
    } finally {
      setEndingWorkout(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateWorkoutDuration = (workout: Workout) => {
    if (!workout.endTime) return 'In Progress'
    const start = new Date(workout.startTime).getTime()
    const end = new Date(workout.endTime).getTime()
    const durationSeconds = Math.floor((end - start) / 1000)
    return formatDuration(durationSeconds)
  }

  if (authLoading) {
    return <Loading fullScreen message="Loading dashboard..." />
  }

  if (error && workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="text-destructive text-lg font-semibold mb-2">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-12 z-10 bg-background border-b border-border pb-4 pt-2">
        {activeWorkout && !activeWorkout.endTime ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Clock size={24} />
              <span className="text-3xl font-bold font-mono">{formatDuration(elapsedTime)}</span>
            </div>
            <Button
              onClick={handleEndWorkout}
              disabled={endingWorkout}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Pause size={20} className="mr-2" />
              {endingWorkout ? 'Ending...' : 'End Workout'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleStartWorkout}
            disabled={creatingWorkout}
            className="w-full"
          >
            <Plus size={20} className="mr-2" />
            {creatingWorkout ? 'Starting...' : 'Start New Workout'}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loading message="Loading workouts..." />
          </div>
        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Play size={48} className="text-muted-foreground mb-4" />
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No workouts yet</p>
              <p className="text-sm">Start your first workout to track your progress</p>
            </div>
          </div>
        ) : (
          workouts.map((workout) => (
            <Card
              key={workout._id}
              className="hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/workout/${workout.workoutId}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    {formatDate(workout.date)}
                  </span>
                  {workout.endTime ? (
                    <span className="text-sm font-normal text-success">
                      Completed
                    </span>
                  ) : (
                    <span className="text-sm font-normal text-warning">
                      Ongoing
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={16} />
                    <span>Start: {formatTime(workout.startTime)}</span>
                  </div>
                  {workout.endTime && (
                    <div className="text-muted-foreground">
                      End: {formatTime(workout.endTime)}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Duration: {calculateWorkoutDuration(workout)}
                  </div>
                  {workout.endTime && (
                    <div className="text-xs text-primary font-semibold">
                      View Details →
                    </div>
                  )}
                </div>
                {workout.notes && (
                  <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {workout.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default DashboardPage
