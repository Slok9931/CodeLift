import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import WorkoutService from '../services/workout'
import SetService from '../services/set'
import type { Set, Workout } from '../types'
import Loading from './Loading'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BarChart3, CalendarDays, Dumbbell, Flame, Layers, Scale, Target, Timer } from 'lucide-react'
import { capitalize } from '../lib/utils'

type SetTypeCount = {
  normal: number
  dropset: number
  superset: number
}

type DayMetric = {
  label: string
  key: string
  workouts: number
  seconds: number
}

type AnalyticsState = {
  totalWorkouts: number
  completedWorkouts: number
  thisWeekWorkouts: number
  totalDurationSeconds: number
  averageDurationSeconds: number
  currentStreakDays: number
  totalSets: number
  totalVolume: number
  topExercise: string
  topExerciseVolume: number
  topMuscle: string
  topMuscleSets: number
  maxWeight: number
  maxWeightExercise: string
  setTypeCount: SetTypeCount
  recentDays: DayMetric[]
}

const MAX_WORKOUTS_FOR_SET_ANALYTICS = 16

const getWorkoutDurationSeconds = (workout: Workout): number => {
  if (!workout.endTime) return 0
  const start = new Date(workout.startTime).getTime()
  const end = new Date(workout.endTime).getTime()
  return Math.max(0, Math.floor((end - start) / 1000))
}

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hrs === 0) return `${mins}m`
  return `${hrs}h ${mins}m`
}

const startOfDayKey = (date: Date): string => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized.toISOString().slice(0, 10)
}

const buildLast7Days = (): DayMetric[] => {
  const days: DayMetric[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = startOfDayKey(d)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    days.push({ label, key, workouts: 0, seconds: 0 })
  }
  return days
}

const getCurrentStreakDays = (completedWorkouts: Workout[]): number => {
  if (!completedWorkouts.length) return 0

  const completedDays = new Set(
    completedWorkouts.map((w) => startOfDayKey(new Date(w.date)))
  )

  let streak = 0
  const cursor = new Date()

  while (completedDays.has(startOfDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

const defaultState: AnalyticsState = {
  totalWorkouts: 0,
  completedWorkouts: 0,
  thisWeekWorkouts: 0,
  totalDurationSeconds: 0,
  averageDurationSeconds: 0,
  currentStreakDays: 0,
  totalSets: 0,
  totalVolume: 0,
  topExercise: '-',
  topExerciseVolume: 0,
  topMuscle: '-',
  topMuscleSets: 0,
  maxWeight: 0,
  maxWeightExercise: '-',
  setTypeCount: { normal: 0, dropset: 0, superset: 0 },
  recentDays: buildLast7Days(),
}

const AnalyticsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsState>(defaultState)

  useEffect(() => {
    if (user?._id) {
      void fetchAnalytics(user._id)
    }
  }, [user?._id])

  const fetchAnalytics = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const workoutResponse = await WorkoutService.getWorkoutsByUserId(userId)
      const workouts = workoutResponse.workouts || []
      const completedWorkouts = workouts.filter((w) => !!w.endTime)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const thisWeekWorkouts = completedWorkouts.filter(
        (w) => new Date(w.date) >= sevenDaysAgo
      ).length

      const totalDurationSeconds = completedWorkouts.reduce(
        (acc, workout) => acc + getWorkoutDurationSeconds(workout),
        0
      )

      const averageDurationSeconds = completedWorkouts.length
        ? Math.floor(totalDurationSeconds / completedWorkouts.length)
        : 0

      const recentDays = buildLast7Days()
      const recentDaysMap = new Map(recentDays.map((day) => [day.key, day]))

      completedWorkouts.forEach((workout) => {
        const key = startOfDayKey(new Date(workout.date))
        const targetDay = recentDaysMap.get(key)
        if (!targetDay) return
        targetDay.workouts += 1
        targetDay.seconds += getWorkoutDurationSeconds(workout)
      })

      const workoutsForDeepStats = completedWorkouts
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, MAX_WORKOUTS_FOR_SET_ANALYTICS)

      const setDetails = await Promise.all(
        workoutsForDeepStats.map(async (workout) => {
          try {
            const response = await SetService.getSetsByWorkoutId(userId, workout.workoutId)
            return response.setsByExercise || {}
          } catch {
            return {}
          }
        })
      )

      const allSets: Set[] = setDetails.flatMap((byExercise) =>
        Object.values(byExercise).flat() as Set[]
      )

      const exerciseVolume = new Map<string, number>()
      const muscleSetCount = new Map<string, number>()
      const setTypeCount: SetTypeCount = { normal: 0, dropset: 0, superset: 0 }

      let totalVolume = 0
      let maxWeight = 0
      let maxWeightExercise = '-'

      allSets.forEach((setItem) => {
        if (setItem.type in setTypeCount) {
          setTypeCount[setItem.type as keyof SetTypeCount] += 1
        }

        const primary = setItem.primary_exercise
        const primaryTitle = primary?.title || 'Unknown exercise'
        const primaryMuscle = primary?.primary_muscle || 'unknown'

        muscleSetCount.set(primaryMuscle, (muscleSetCount.get(primaryMuscle) || 0) + 1)

        let setVolume = 0

        setItem.primary_weight.forEach((weight, index) => {
          const reps = setItem.primary_reps[index] || 0
          setVolume += weight * reps
          if (weight > maxWeight) {
            maxWeight = weight
            maxWeightExercise = primaryTitle
          }
        })

        if (setItem.secondary_weight && setItem.secondary_reps) {
          setItem.secondary_weight.forEach((weight, index) => {
            const reps = setItem.secondary_reps?.[index] || 0
            setVolume += weight * reps
          })
        }

        exerciseVolume.set(primaryTitle, (exerciseVolume.get(primaryTitle) || 0) + setVolume)
        totalVolume += setVolume
      })

      const [topExercise = '-', topExerciseVolume = 0] =
        [...exerciseVolume.entries()].sort((a, b) => b[1] - a[1])[0] || []

      const [topMuscle = '-', topMuscleSets = 0] =
        [...muscleSetCount.entries()].sort((a, b) => b[1] - a[1])[0] || []

      setAnalytics({
        totalWorkouts: workouts.length,
        completedWorkouts: completedWorkouts.length,
        thisWeekWorkouts,
        totalDurationSeconds,
        averageDurationSeconds,
        currentStreakDays: getCurrentStreakDays(completedWorkouts),
        totalSets: allSets.length,
        totalVolume,
        topExercise,
        topExerciseVolume,
        topMuscle,
        topMuscleSets,
        maxWeight,
        maxWeightExercise,
        setTypeCount,
        recentDays,
      })
    } catch {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const maxDailyWorkouts = useMemo(() => {
    const values = analytics.recentDays.map((d) => d.workouts)
    return Math.max(...values, 1)
  }, [analytics.recentDays])

  if (authLoading || loading) {
    return <Loading fullScreen message="Building your analytics..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="text-destructive text-lg font-semibold mb-2">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4 py-4">
      <Card className="bg-gradient-to-br from-primary/20 via-card to-card border-primary/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Performance Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">Total Workouts</div>
            <div className="text-xl font-bold">{analytics.totalWorkouts}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">This Week</div>
            <div className="text-xl font-bold">{analytics.thisWeekWorkouts}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">Current Streak</div>
            <div className="text-xl font-bold flex items-center gap-1">
              <Flame size={16} className="text-warning" />
              {analytics.currentStreakDays}d
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background/60 p-3">
            <div className="text-xs text-muted-foreground">Avg Duration</div>
            <div className="text-xl font-bold">{formatDuration(analytics.averageDurationSeconds)}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              Total Sets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSets}</div>
            <div className="text-xs text-muted-foreground mt-1">From last {MAX_WORKOUTS_FOR_SET_ANALYTICS} workouts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale size={16} className="text-primary" />
              Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.totalVolume).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">kg x reps</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {analytics.recentDays.map((day) => {
              const barHeight = Math.max(6, Math.round((day.workouts / maxDailyWorkouts) * 100))
              return (
                <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-muted-foreground">{day.workouts}</div>
                  <div className="w-full rounded-md bg-secondary/70 overflow-hidden h-24 flex items-end">
                    <div
                      className="w-full bg-primary rounded-md transition-all"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{day.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target size={18} className="text-primary" />
            Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground flex items-center gap-2">
              <Dumbbell size={14} /> Top Exercise
            </span>
            <span className="font-semibold text-right">{capitalize(analytics.topExercise)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground">Top Exercise Volume</span>
            <span className="font-semibold">{Math.round(analytics.topExerciseVolume).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground">Most Trained Muscle</span>
            <span className="font-semibold">{capitalize(analytics.topMuscle)} ({analytics.topMuscleSets} sets)</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-muted-foreground">Heaviest Lift</span>
            <span className="font-semibold text-right">{analytics.maxWeight}kg ({capitalize(analytics.maxWeightExercise)})</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Timer size={18} className="text-primary" />
            Set Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['normal', 'dropset', 'superset'] as const).map((type) => {
            const count = analytics.setTypeCount[type]
            const maxCount = Math.max(
              analytics.setTypeCount.normal,
              analytics.setTypeCount.dropset,
              analytics.setTypeCount.superset,
              1
            )
            const width = Math.max(6, Math.round((count / maxCount) * 100))
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{capitalize(type)}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
