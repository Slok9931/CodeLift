import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ExerciseService from '../services/exercise'
import WorkoutService from '../services/workout'
import SetService from '../services/set'
import type { Exercise, Workout } from '../types'
import Loading from './Loading'
import { Button } from './ui/button'
import { Clock, Pause, Check, Minus, Plus } from 'lucide-react'
import { capitalize } from '../lib/utils'
import Input from './ui/input'

interface DropsetRep {
    id: string
    weight: string
    reps: string
}

interface SetInput {
    id: string
    type: 'normal' | 'dropset'
    dropsetReps: DropsetRep[]
    weight: string
    reps: string
    saved: boolean
}

const SetPage: React.FC = () => {
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const workoutId = searchParams.get('workoutId')
    const muscle = searchParams.get('muscle')
    const setType = searchParams.get('setType') as 'normal' | 'dropset' | 'superset'
    const primaryExerciseId = searchParams.get('primary_exercise')
    const secondaryExerciseId = searchParams.get('secondary_exercise')

    const [workout, setWorkout] = useState<Workout | null>(null)
    const [primaryExercise, setPrimaryExercise] = useState<Exercise | null>(null)
    const [secondaryExercise, setSecondaryExercise] = useState<Exercise | null>(null)
    const [loading, setLoading] = useState(true)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [endingWorkout, setEndingWorkout] = useState(false)

    const [primarySets, setPrimarySets] = useState<SetInput[]>([
        {
            id: '1',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
        {
            id: '2',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
        {
            id: '3',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
        {
            id: '4',
            type: setType === 'dropset' ? 'dropset' : 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
    ])

    const [secondarySets, setSecondarySets] = useState<SetInput[]>([
        {
            id: '1',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
        {
            id: '2',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
        {
            id: '3',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
        {
            id: '4',
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false
        },
    ])

    useEffect(() => {
        if (workoutId && primaryExerciseId) {
            fetchData()
        }
    }, [workoutId, primaryExerciseId, secondaryExerciseId])

    useEffect(() => {
        if (workout && !workout.endTime) {
            const interval = setInterval(() => {
                const start = new Date(workout.startTime).getTime()
                const now = Date.now()
                setElapsedTime(Math.floor((now - start) / 1000))
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [workout])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [workoutRes, primaryRes] = await Promise.all([
                WorkoutService.getWorkoutById(workoutId!),
                ExerciseService.getExerciseById(primaryExerciseId!),
            ])
            setWorkout(workoutRes.workout)
            setPrimaryExercise(primaryRes.exercise)

            if (secondaryExerciseId) {
                const secondaryRes = await ExerciseService.getExerciseById(secondaryExerciseId)
                setSecondaryExercise(secondaryRes.exercise)
            }
        } catch (err) {
            console.error('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const handleEndWorkout = async () => {
        if (!workout) return
        try {
            setEndingWorkout(true)
            await WorkoutService.updateWorkout(workout.workoutId, {
                endTime: new Date(),
            })
            navigate('/')
        } catch (err) {
            console.error('Failed to end workout')
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

    const handleSaveSet = async (setInput: SetInput, isPrimary: boolean) => {
        if (!user || !workout || !primaryExercise) return

        if (setInput.type === 'normal') {
            if (!setInput.weight || !setInput.reps) return
        } else if (setInput.type === 'dropset') {
            const allValid = setInput.dropsetReps.every(dr => dr.weight && dr.reps)
            if (!allValid) return
        }

        try {
            const setNumber = isPrimary
                ? primarySets.filter(s => s.saved).length + 1
                : secondarySets.filter(s => s.saved).length + 1

            let setData
            if (setInput.type === 'dropset') {
                setData = {
                    userId: user._id,
                    workoutId: workout.workoutId,
                    setNumber,
                    type: setType,
                    primary_exercise_id: primaryExercise.exerciseId,
                    secondary_exercise_id: secondaryExercise?.exerciseId,
                    primary_reps: setInput.dropsetReps.map(dr => parseInt(dr.reps)),
                    primary_weight: setInput.dropsetReps.map(dr => parseFloat(dr.weight)),
                }
            } else {
                setData = {
                    userId: user._id,
                    workoutId: workout.workoutId,
                    setNumber,
                    type: setType,
                    primary_exercise_id: primaryExercise.exerciseId,
                    secondary_exercise_id: secondaryExercise?.exerciseId,
                    primary_reps: [parseInt(setInput.reps)],
                    primary_weight: [parseFloat(setInput.weight)],
                }
            }

            await SetService.addSet(setData)

            if (isPrimary) {
                setPrimarySets(prev =>
                    prev.map(s => (s.id === setInput.id ? { ...s, saved: true } : s))
                )
            } else {
                setSecondarySets(prev =>
                    prev.map(s => (s.id === setInput.id ? { ...s, saved: true } : s))
                )
            }
        } catch (err) {
            console.error('Failed to save set')
        }
    }

    const handleRemoveSet = (setId: string, isPrimary: boolean) => {
        if (isPrimary) {
            setPrimarySets(prev => prev.filter(s => s.id !== setId))
        } else {
            setSecondarySets(prev => prev.filter(s => s.id !== setId))
        }
    }

    const handleAddSet = (isPrimary: boolean) => {
        const newSet: SetInput = {
            id: Date.now().toString(),
            type: 'normal',
            weight: '',
            reps: '',
            dropsetReps: [
                { id: 'dr1', weight: '', reps: '' },
                { id: 'dr2', weight: '', reps: '' }
            ],
            saved: false,
        }
        if (isPrimary) {
            setPrimarySets(prev => [...prev, newSet])
        } else {
            setSecondarySets(prev => [...prev, newSet])
        }
    }

    const handleAddDropsetRep = (setId: string, isPrimary: boolean) => {
        const newDropsetRep: DropsetRep = {
            id: `dr${Date.now()}`,
            weight: '',
            reps: ''
        }

        if (isPrimary) {
            setPrimarySets(prev =>
                prev.map(s =>
                    s.id === setId
                        ? { ...s, dropsetReps: [...s.dropsetReps, newDropsetRep] }
                        : s
                )
            )
        } else {
            setSecondarySets(prev =>
                prev.map(s =>
                    s.id === setId
                        ? { ...s, dropsetReps: [...s.dropsetReps, newDropsetRep] }
                        : s
                )
            )
        }
    }

    const handleRemoveDropsetRep = (setId: string, repId: string, isPrimary: boolean) => {
        if (isPrimary) {
            setPrimarySets(prev =>
                prev.map(s =>
                    s.id === setId
                        ? { ...s, dropsetReps: s.dropsetReps.filter(dr => dr.id !== repId) }
                        : s
                )
            )
        } else {
            setSecondarySets(prev =>
                prev.map(s =>
                    s.id === setId
                        ? { ...s, dropsetReps: s.dropsetReps.filter(dr => dr.id !== repId) }
                        : s
                )
            )
        }
    }

    const updateDropsetRep = (setId: string, repId: string, field: 'weight' | 'reps', value: string, isPrimary: boolean) => {
        if (isPrimary) {
            setPrimarySets(prev =>
                prev.map(s =>
                    s.id === setId
                        ? {
                            ...s,
                            dropsetReps: s.dropsetReps.map(dr =>
                                dr.id === repId ? { ...dr, [field]: value } : dr
                            )
                        }
                        : s
                )
            )
        } else {
            setSecondarySets(prev =>
                prev.map(s =>
                    s.id === setId
                        ? {
                            ...s,
                            dropsetReps: s.dropsetReps.map(dr =>
                                dr.id === repId ? { ...dr, [field]: value } : dr
                            )
                        }
                        : s
                )
            )
        }
    }

    if (loading) {
        return <Loading fullScreen message="Loading workout..." />
    }

    if (!workout) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="text-destructive text-lg font-semibold mb-2">Workout not found</div>
            </div>
        )
    }
    if (!primaryExercise) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="text-destructive text-lg font-semibold mb-2">Primary exercise not found</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-12 z-10 bg-background border-b border-border pb-4 -mt-4">
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
            </div>

            <div className="bg-card border border-border rounded-xl p-4 mb-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-primary">{capitalize(muscle || '')}</div>
                    <div className="text-xs text-muted-foreground">{capitalize(setType)}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                    {primaryExercise.title}
                    {secondaryExercise && ` + ${secondaryExercise.title}`}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-base font-semibold text-foreground">{primaryExercise.title}</h3>
                    <div className="flex items-center justify-start text-xs text-muted-foreground mb-4">
                        {capitalize(primaryExercise.primary_muscle)} | {capitalize(primaryExercise.equipment)}
                    </div>
                    <div className="space-y-3">
                        {primarySets.map((set, index) => (
                            <div
                                key={set.id}
                                className={`flex flex-col gap-3 p-3 rounded-lg border transition-all ${set.saved
                                    ? 'bg-success/10 border-success animate-pulse'
                                    : 'bg-background border-border'
                                    }`}
                            >
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-sm font-semibold text-muted-foreground w-8">#{index + 1}</span>
                                    {setType !== 'superset' && (
                                        <>
                                            <label className="flex items-center gap-1">
                                                <Input
                                                    type="radio"
                                                    checked={set.type === 'normal'}
                                                    onChange={() =>
                                                        setPrimarySets(prev =>
                                                            prev.map(s =>
                                                                s.id === set.id ? { ...s, type: 'normal' } : s
                                                            )
                                                        )
                                                    }
                                                    disabled={set.saved}
                                                    className="accent-primary"
                                                />
                                                <span className="text-muted-foreground">Normal</span>
                                            </label>
                                            <label className="flex items-center gap-1">
                                                <Input
                                                    type="radio"
                                                    checked={set.type === 'dropset'}
                                                    onChange={() =>
                                                        setPrimarySets(prev =>
                                                            prev.map(s =>
                                                                s.id === set.id ? { ...s, type: 'dropset' } : s
                                                            )
                                                        )
                                                    }
                                                    disabled={set.saved}
                                                    className="accent-primary"
                                                />
                                                <span className="text-muted-foreground">Dropset</span>
                                            </label>
                                        </>
                                    )}
                                </div>

                                {set.type === 'normal' ? (
                                    <div className="flex flex-1 gap-2 items-center">
                                        <Input
                                            type="number"
                                            placeholder="Weight"
                                            value={set.weight}
                                            onChange={e =>
                                                setPrimarySets(prev =>
                                                    prev.map(s => (s.id === set.id ? { ...s, weight: e.target.value } : s))
                                                )
                                            }
                                            disabled={set.saved}
                                            className="w-24 px-2 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Reps"
                                            value={set.reps}
                                            onChange={e =>
                                                setPrimarySets(prev =>
                                                    prev.map(s => (s.id === set.id ? { ...s, reps: e.target.value } : s))
                                                )
                                            }
                                            disabled={set.saved}
                                            className="w-24 px-2 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                                        />
                                        {!set.saved && (
                                            <>
                                                <Button
                                                    onClick={() => handleRemoveSet(set.id, true)}
                                                    className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                                                >
                                                    <Minus size={16} />
                                                </Button>
                                                <Button
                                                    onClick={() => handleSaveSet(set, true)}
                                                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                                                    disabled={!set.weight || !set.reps}
                                                >
                                                    <Check size={16} />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {set.dropsetReps.map((dropRep, dropIndex) => (
                                            <div key={dropRep.id} className="flex gap-2 items-center">
                                                <span className="text-xs text-muted-foreground w-14">{dropIndex + 1}</span>
                                                <Input
                                                    type="number"
                                                    placeholder="Weight"
                                                    value={dropRep.weight}
                                                    onChange={e =>
                                                        updateDropsetRep(set.id, dropRep.id, 'weight', e.target.value, true)
                                                    }
                                                    disabled={set.saved}
                                                    className="w-24 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Reps"
                                                    value={dropRep.reps}
                                                    onChange={e =>
                                                        updateDropsetRep(set.id, dropRep.id, 'reps', e.target.value, true)
                                                    }
                                                    disabled={set.saved}
                                                    className="w-24 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                                                />
                                                {!set.saved && (
                                                    <>
                                                        {dropIndex < set.dropsetReps.length - 1 && (
                                                            <Button
                                                                onClick={() => handleRemoveDropsetRep(set.id, dropRep.id, true)}
                                                                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                                                            >
                                                                <Minus size={16} />
                                                            </Button>
                                                        )}
                                                        {dropIndex === set.dropsetReps.length - 1 && (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleAddDropsetRep(set.id, true)}
                                                                    className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition"
                                                                >
                                                                    <Plus size={16} />
                                                                </Button>
                                                                {set.dropsetReps.length > 1 && (
                                                                    <Button
                                                                        onClick={() => handleRemoveSet(set.id, true)}
                                                                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                                                                    >
                                                                        <Minus size={16} />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    onClick={() => handleSaveSet(set, true)}
                                                                    className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                                                                    disabled={!set.dropsetReps.every(dr => dr.weight && dr.reps)}
                                                                >
                                                                    <Check size={16} />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={() => handleAddSet(true)}
                        className="w-full mt-4"
                    >
                        <Plus size={16} className="mr-2" />
                        Add Set
                    </Button>
                </div>

                {setType === 'superset' && secondaryExercise && (
                    <div className="bg-card border border-border rounded-xl p-4 mb-4">
                        <h3 className="text-base font-semibold text-foreground">{secondaryExercise.title}</h3>
                        <div className="flex items-center justify-start text-xs text-muted-foreground mb-4">
                            {capitalize(secondaryExercise.primary_muscle)} | {capitalize(secondaryExercise.equipment)}
                        </div>
                        <div className="space-y-3">
                            {secondarySets.map((set, index) => (
                                <div
                                    key={set.id}
                                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${set.saved
                                        ? 'bg-success/10 border-success animate-pulse'
                                        : 'bg-background border-border'
                                        }`}
                                >
                                    <span className="text-sm font-semibold text-muted-foreground w-8">#{index + 1}</span>
                                    <Input
                                        type="number"
                                        placeholder="Weight"
                                        value={set.weight}
                                        onChange={e =>
                                            setSecondarySets(prev =>
                                                prev.map(s => (s.id === set.id ? { ...s, weight: e.target.value } : s))
                                            )
                                        }
                                        disabled={set.saved}
                                        className="flex-1 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Reps"
                                        value={set.reps}
                                        onChange={e =>
                                            setSecondarySets(prev =>
                                                prev.map(s => (s.id === set.id ? { ...s, reps: e.target.value } : s))
                                            )
                                        }
                                        disabled={set.saved}
                                        className="flex-1 rounded-lg border border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                                    />
                                    {!set.saved && (
                                        <>
                                            <Button
                                                onClick={() => handleRemoveSet(set.id, false)}
                                                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                                            >
                                                <Minus size={16} />
                                            </Button>
                                            <Button
                                                onClick={() => handleSaveSet(set, false)}
                                                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                                                disabled={!set.weight || !set.reps}
                                            >
                                                <Check size={16} />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => handleAddSet(false)}
                            className="w-full mt-4"
                        >
                            <Plus size={16} className="mr-2" />
                            Add Set
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SetPage