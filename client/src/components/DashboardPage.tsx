import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import WorkoutService from '../services/workout'
import type { Exercise, Workout } from '../types'
import Loading from './Loading'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Plus, Clock, Calendar, Play, Pause, Dumbbell, Repeat, Layers } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatDate, formatTime, capitalize } from '../lib/utils'
import ExerciseService from '../services/exercise'
import Input from './ui/input'
const MUSCLES = [
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'legs', label: 'Legs' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'core', label: 'Core' },
]

const SET_TYPES = [
    { value: 'normal', label: 'Normal', icon: Dumbbell },
    { value: 'dropset', label: 'Dropset', icon: Repeat },
    { value: 'superset', label: 'Superset', icon: Layers },
]

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
    const selectedMuscle = searchParams.get('muscle')
    const selectedSetType = searchParams.get('setType')
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)
    const [exerciseSearch, setExerciseSearch] = useState('')
    const [exercisePage, setExercisePage] = useState(1)
    const [exerciseLoading, setExerciseLoading] = useState(false)
    const [exerciseList, setExerciseList] = useState<Exercise[]>([])
    const [exerciseHasMore, setExerciseHasMore] = useState(true)
    const [primaryExercise, setPrimaryExercise] = useState<Exercise | null>(null)
    const [secondaryExercise, setSecondaryExercise] = useState<Exercise | null>(null)

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
        if (selectedSetType && selectedMuscle) {
            fetchExercises(1, true)
        } else {
            setExerciseList([])
            setExercisePage(1)
            setExerciseHasMore(true)
            setPrimaryExercise(null)
            setSecondaryExercise(null)
        }
    }, [selectedSetType, selectedMuscle])

    useEffect(() => {
        if (selectedSetType && selectedMuscle && exercisePage > 1) {
            fetchExercises(exercisePage)
        }
    }, [exercisePage])

    const fetchExercises = async (pageNum: number, reset = false, searchTerm?: string) => {
        setExerciseLoading(true)
        try {
            const effectiveSearch = typeof searchTerm === 'string' ? searchTerm : exerciseSearch
            const params: {
                search?: string
                muscle?: string
                page?: number
                limit?: number
            } = {
                ...(selectedMuscle ? { muscle: selectedMuscle } : {}),
                ...(effectiveSearch ? { search: effectiveSearch } : {}),
                page: pageNum,
                limit: 25,
            }
            const response = await ExerciseService.getAllExercises(params)
            const newExercises = response.exercises || []
            if (reset) {
                setExerciseList(newExercises)
            } else {
                setExerciseList((prev) => [...prev, ...newExercises])
            }
            setExerciseHasMore(newExercises.length === 25)
        } catch {
            setExerciseList([])
            setExerciseHasMore(false)
        } finally {
            setExerciseLoading(false)
        }
    }

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
            <div className="sticky top-0 z-10 bg-background border-b py-4">
                {activeWorkout && !activeWorkout.endTime ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <Clock size={12} />
                            <span className="text-lg font-bold font-mono">{formatDuration(elapsedTime)}</span>
                        </div>
                        <Button
                            onClick={handleEndWorkout}
                            disabled={endingWorkout}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            <Pause size={12} className="mr-2" />
                            {endingWorkout ? 'Ending...' : 'End'}
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

            {activeWorkout && !activeWorkout.endTime && (
                <div className="flex flex-col items-center justify-center py-6 gap-6">
                    {!selectedMuscle && (
                        <div className="flex flex-wrap justify-center gap-3">
                            {MUSCLES.map((muscle) => (
                                <Button
                                    key={muscle.value}
                                    variant="outline"
                                    className="px-6 py-2 text-base font-semibold bg-muted/60 rounded-xl hover:bg-primary/30 hover:border-primary"
                                    onClick={() => setSearchParams({ workoutId: activeWorkoutId!, muscle: muscle.value })}
                                >
                                    {muscle.label}
                                </Button>
                            ))}
                        </div>
                    )}
                    {selectedMuscle && !selectedSetType && (
                        <div className="flex flex-wrap justify-center gap-3">
                            {SET_TYPES.map((setType) => (
                                <Button
                                    key={setType.value}
                                    variant="outline"
                                    className="px-6 py-2 text-base font-semibold flex items-center gap-2 bg-muted/60 rounded-xl hover:bg-primary/30 hover:border-primary"
                                    onClick={() => setSearchParams({ workoutId: activeWorkoutId!, muscle: selectedMuscle, setType: setType.value })}
                                >
                                    <setType.icon size={18} />
                                    {setType.label}
                                </Button>
                            ))}
                        </div>
                    )}

                    {selectedSetType && selectedMuscle && (
                        <div className="flex flex-col items-center justify-center pb-2 gap-4 w-full">
                            <div className="w-full max-w-3xl mx-auto">
                                <Input
                                    type="text"
                                    value={exerciseSearch}
                                    onChange={e => {
                                        const nextSearch = e.target.value
                                        setExerciseSearch(nextSearch)
                                        setExercisePage(1)
                                        fetchExercises(1, true, nextSearch)
                                    }}
                                    placeholder={`Search ${capitalize(selectedMuscle)} exercises...`}
                                    className="w-full px-4 py-2 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition"
                                />
                            </div>
                            <div className="w-full max-w-3xl mx-auto max-h-[58vh] overflow-y-auto pr-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
                                    {exerciseList.map((exercise) => {
                                        const isSelected =
                                            (primaryExercise && primaryExercise._id === exercise._id) ||
                                            (selectedSetType === 'superset' && secondaryExercise && secondaryExercise._id === exercise._id)
                                        return (
                                            <div
                                                key={exercise._id}
                                                className={`bg-card border border-border rounded-xl shadow-sm flex flex-col items-center justify-center p-2 cursor-pointer transition hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
                                                onClick={() => {
                                                    if (selectedSetType === 'superset') {
                                                        if (!primaryExercise) {
                                                            setPrimaryExercise(exercise)
                                                            setSearchParams({ workoutId: activeWorkoutId!, muscle: selectedMuscle, setType: selectedSetType, primary_exercise: exercise.exerciseId })
                                                        } else if (!secondaryExercise && exercise._id !== primaryExercise._id) {
                                                            setSecondaryExercise(exercise)
                                                            navigate(`/sets?workoutId=${activeWorkoutId}&muscle=${selectedMuscle}&setType=${selectedSetType}&primary_exercise=${primaryExercise.exerciseId}&secondary_exercise=${exercise.exerciseId}`)
                                                        }
                                                    } else {
                                                        setPrimaryExercise(exercise)
                                                        navigate(`/sets?workoutId=${activeWorkoutId}&muscle=${selectedMuscle}&setType=${selectedSetType}&primary_exercise=${exercise.exerciseId}`)
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={exercise.photoUrl || './Placeholder_image.jpg'}
                                                    alt={exercise.title}
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                    onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image' }}
                                                />
                                                <div className="text-xs font-semibold text-center text-foreground truncate w-full">
                                                    {capitalize(exercise.title)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {exerciseLoading && (
                                    <div className="flex justify-center py-4">
                                        <Loading message="Loading exercises..." />
                                    </div>
                                )}
                                {exerciseHasMore && !exerciseLoading && (
                                    <div className="flex justify-center py-4">
                                        <Button onClick={() => setExercisePage(p => p + 1)}>
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!activeWorkout && (<div className="flex-1 overflow-y-auto py-4 space-y-3">
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
                            onClick={() => {
                                if (!workout.endTime) {
                                    navigate(`/dashboard?workoutId=${workout.workoutId}`)
                                } else {
                                    navigate(`/workout/${workout.workoutId}`)
                                }
                            }}
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
            </div>)}
        </div>
    )
}

export default DashboardPage
