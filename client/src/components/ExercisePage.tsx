import React, { useEffect, useState, useCallback } from 'react'
import ExerciseService from '../services/exercise'
import type { Exercise } from '../types'
import Loading from './Loading'
import { Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { capitalize } from '../lib/utils'
import Input from './ui/input'
import Dropdown from './ui/dropdown'
import { Button } from './ui/button'

const ExercisePage: React.FC = () => {
    const navigate = useNavigate()
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    const [filters, setFilters] = useState({
        search: '',
        muscle: '',
        equipment: '',
    })

    const muscles = [
        { value: '', label: 'All Muscles' },
        { value: 'biceps', label: 'Biceps' },
        { value: 'triceps', label: 'Triceps' },
        { value: 'chest', label: 'Chest' },
        { value: 'back', label: 'Back' },
        { value: 'legs', label: 'Legs' },
        { value: 'shoulders', label: 'Shoulders' },
        { value: 'core', label: 'Core' },
    ]
    const equipments = [
        { value: '', label: 'All Equipment' },
        { value: 'dumbbell', label: 'Dumbbell' },
        { value: 'barbell', label: 'Barbell' },
        { value: 'bodyweight', label: 'Bodyweight' },
        { value: 'machine', label: 'Machine' },
        { value: 'kettlebell', label: 'Kettlebell' },
        { value: 'resistance band', label: 'Resistance Band' },
    ]

    const fetchExercises = useCallback(async (pageNum: number, reset = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }

            const params = {
                page: pageNum,
                limit: 25,
                ...(filters.search && { search: filters.search }),
                ...(filters.muscle && { muscle: filters.muscle }),
                ...(filters.equipment && { equipment: filters.equipment }),
            }

            const response = await ExerciseService.getAllExercises(params)
            const newExercises = response.exercises || []

            if (reset) {
                setExercises(newExercises)
            } else {
                setExercises((prev) => [...prev, ...newExercises])
            }

            setHasMore(newExercises.length === 25)
            setError(null)
        } catch (err) {
            setError('Failed to load exercises')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [filters])

    useEffect(() => {
        setPage(1)
        fetchExercises(1, true)
    }, [filters])

    useEffect(() => {
        if (page > 1) {
            fetchExercises(page)
        }
    }, [page])

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({ search: '', muscle: '', equipment: '' })
    }

    if (loading && exercises.length === 0) {
        return <Loading fullScreen message="Loading exercises..." />
    }

    if (error && exercises.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="text-destructive text-lg font-semibold mb-2">{error}</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-12 z-5 bg-background border-b border-border flex items-center gap-2 py-3 -mt-4">
                <Input
                    type="text"
                    placeholder="Search exercises..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full"
                />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition"
                >
                    <Filter size={20} className="text-primary" />
                </button>
            </div>

            <div
                className={
                    'z-5 top-24 sticky bg-card border-b border-border px-4 overflow-hidden space-y-3 rounded-b-xl transition-all duration-500' +
                    (showFilters ? ' max-h-[400px] py-4 opacity-100' : ' max-h-0 py-0 opacity-0 pointer-events-none')
                }
                style={{ willChange: 'max-height, opacity, padding' }}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Filters</span>
                    <button
                        onClick={clearFilters}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                        Clear All
                    </button>
                </div>

                <div>
                    <Dropdown
                        label="Muscle Group"
                        value={filters.muscle}
                        onChange={(val) => handleFilterChange('muscle', val)}
                        options={muscles}
                    />
                </div>

                <div>
                    <Dropdown
                        label="Equipment"
                        value={filters.equipment}
                        onChange={(val) => handleFilterChange('equipment', val)}
                        options={equipments}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {loading && exercises.length === 0 ? (
                    <div className="flex justify-center py-10">
                        <Loading message="Loading exercises..." />
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        No exercises found
                    </div>
                ) : (
                    <>
                        {exercises.map((exercise) => (
                            <div
                                key={exercise._id}
                                className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer hover:border-primary"
                                onClick={() => navigate(`/exercise/${exercise.exerciseId}`)}
                            >
                                <div className="flex gap-3 p-3">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={'./Placeholder_image.jpg'} // exercise.imageUrl
                                            alt={exercise.title}
                                            className="w-20 h-20 rounded-lg object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image'
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">
                                            {exercise.title}
                                        </h3>
                                        <div className="flex gap-2 mb-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                                {capitalize(exercise.primary_muscle)}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary/50 text-secondary-foreground">
                                                {capitalize(exercise.equipment)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {exercise.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className="flex justify-center py-4">
                                {!loadingMore ? (<Button
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={loadingMore}
                                >
                                    Load More
                                </Button>) : (<Loading message="Loading more exercises..." />)}
                            </div>
                        )}

                        {!hasMore && exercises.length > 0 && (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                No more exercises to load
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ExercisePage
