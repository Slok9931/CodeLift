import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ExerciseService from '../services/exercise'
import type { Exercise } from '../types'
import Loading from './Loading'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, Dumbbell, ListChecks, Target } from 'lucide-react'
import { capitalize } from '../lib/utils'

const ExerciseDetailPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const instructionSteps = React.useMemo(() => {
    const description = exercise?.description?.trim() || ''
    if (!description) return []

    if (/Step:\s*\d+/i.test(description)) {
      return description
        .split(/Step:\s*\d+\s*/i)
        .map((step) => step.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
    }

    const multiline = description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (multiline.length > 1) {
      return multiline
    }

    return []
  }, [exercise])

  useEffect(() => {
    if (exerciseId) {
      fetchExerciseDetails()
    }
  }, [exerciseId])

  const fetchExerciseDetails = async () => {
    if (!exerciseId) return

    try {
      setLoading(true)
      const response = await ExerciseService.getExerciseById(exerciseId)
      setExercise(response.exercise)
      setError(null)
    } catch (err) {
      setError('Failed to load exercise details')
      console.error('Failed to fetch exercise:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading fullScreen message="Loading exercise details..." />
  }

  if (error || !exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="text-destructive text-lg font-semibold mb-4">
          {error || 'Exercise not found'}
        </div>
        <Button onClick={() => navigate('/exercise')} variant="outline">
          <ArrowLeft size={16} className="mr-2" />
          Back to Exercises
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border py-4 -mt-4">
        <Button
          onClick={() => navigate('/exercise')}
          variant="outline"
          className="mb-3"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Exercises
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <Card>
          <CardContent className="p-0 relative">
            <div className="w-full aspect-video bg-muted rounded-xl overflow-hidden">
              <img
                src={exercise.photoUrl || './Placeholder_image.jpg'}
                alt={exercise.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image'
                }}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl">
              <div className="text-white text-lg font-semibold line-clamp-2">
                {capitalize(exercise.title)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Dumbbell size={24} className="text-primary" />
              Exercise Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                <Target size={14} className="mr-1.5" />
                {capitalize(exercise.primary_muscle)}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-secondary/50 text-secondary-foreground border border-secondary/20">
                {capitalize(exercise.equipment)}
              </span>
            </div>

            {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Secondary Muscles</h3>
                <div className="flex gap-2 flex-wrap">
                  {exercise.secondary_muscles.map((muscle, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border"
                    >
                      {capitalize(muscle)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <ListChecks size={16} className="text-primary" />
                Instructions
              </h3>

              {instructionSteps.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
                  {instructionSteps.map((step, index) => (
                    <li key={`${index}-${step.slice(0, 24)}`}>{step}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exercise.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ExerciseDetailPage
