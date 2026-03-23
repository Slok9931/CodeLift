import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import SetService from '../services/set'
import type { Workout, Set } from '../types'
import Loading from './Loading'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Calendar, Clock, Dumbbell, ArrowLeft } from 'lucide-react'
import { formatDate, formatTime, capitalize } from '../lib/utils'

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [setsByExercise, setSetsByExercise] = useState<{ [key: string]: Set[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && workoutId) {
      fetchWorkoutData()
    }
  }, [user, workoutId])

  const fetchWorkoutData = async () => {
    if (!user || !workoutId) return
    
    try {
      setLoading(true)
      const response = await SetService.getSetsByWorkoutId(user._id, workoutId)
      setWorkout(response.workout)
      setSetsByExercise(response.setsByExercise)
      setError(null)
    } catch (err) {
      setError('Failed to load workout details')
      console.error('Failed to fetch workout data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateWorkoutDuration = () => {
    if (!workout) return '0:00:00'
    if (!workout.endTime) return 'In Progress'
    
    const start = new Date(workout.startTime).getTime()
    const end = new Date(workout.endTime).getTime()
    const durationSeconds = Math.floor((end - start) / 1000)
    
    const hrs = Math.floor(durationSeconds / 3600)
    const mins = Math.floor((durationSeconds % 3600) / 60)
    const secs = durationSeconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalSets = () => {
    return Object.values(setsByExercise).reduce((total, sets) => total + sets.length, 0)
  }

  const getSetTypeLabel = (type: string) => {
    switch (type) {
      case 'normal': return 'Normal'
      case 'dropset': return 'Dropset'
      case 'superset': return 'Superset'
      default: return type
    }
  }

  if (loading) {
    return <Loading fullScreen message="Loading workout details..." />
  }

  if (error || !workout) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <div className="text-destructive text-lg font-semibold mb-4">
          {error || 'Workout not found'}
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b border-border py-4">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="mb-3"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              {formatDate(workout.date)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span>Started: {formatTime(workout.startTime)}</span>
              </div>
              {workout.endTime && (
                <div className="text-muted-foreground">
                  Ended: {formatTime(workout.endTime)}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Duration: <span className="font-semibold text-foreground">{calculateWorkoutDuration()}</span>
              </div>
              <div className="text-muted-foreground">
                Total Sets: <span className="font-semibold text-foreground">{getTotalSets()}</span>
              </div>
            </div>
            {workout.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">{workout.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {Object.keys(setsByExercise).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Dumbbell size={48} className="text-muted-foreground mb-4" />
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No exercises recorded</p>
              <p className="text-sm">This workout has no sets yet</p>
            </div>
          </div>
        ) : (
          (() => {
            const allSets = Object.values(setsByExercise).flat();
            const supersetSets = allSets.filter(set => set.type === 'superset' && set.secondary_exercise);
            const supersetByNumber: { [key: number]: Set } = {};
            supersetSets.forEach(set => {
              supersetByNumber[set.setNumber] = set;
            });
            const supersetNumbers = Object.keys(supersetByNumber).map(Number).sort((a, b) => a - b);
            const normalCards = Object.entries(setsByExercise).map(([exerciseId, sets]) => {
              const filteredSets = sets.filter(set => set.type !== 'superset');
              if (filteredSets.length === 0) return null;
              const exercise = filteredSets[0]?.primary_exercise;
              if (!exercise) return null;
              return (
                <Card key={exerciseId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{capitalize(exercise.title)}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {capitalize(exercise.primary_muscle)} | {capitalize(exercise.equipment)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredSets.map((set) => (
                        <div
                          key={set._id}
                          className="bg-muted/30 border border-border rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground">
                              Set #{set.setNumber}
                            </span>
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-primary/10 rounded">
                              {getSetTypeLabel(set.type)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-semibold text-foreground">Primary: </span>
                              {set.primary_weight.map((weight, i) => (
                                <span key={i} className="text-muted-foreground">
                                  {weight}kg × {set.primary_reps[i]} reps
                                  {i < set.primary_weight.length - 1 && ' → '}
                                </span>
                              ))}
                            </div>
                            {set.secondary_exercise && set.secondary_weight && set.secondary_reps && (
                              <div className="text-sm">
                                <span className="font-semibold text-foreground">
                                  Secondary ({set.secondary_exercise.title}):
                                </span>
                                {set.secondary_weight.map((weight, i) => (
                                  <span key={i} className="text-muted-foreground">
                                    {' '}{weight}kg × {set.secondary_reps![i]} reps
                                    {set.secondary_weight && i < set.secondary_weight.length - 1 && ' → '}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            });
            let supersetCard = null;
            if (supersetNumbers.length > 0) {
              const firstSet = supersetByNumber[supersetNumbers[0]];
              supersetCard = (
                <Card key="superset">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Superset: {firstSet.primary_exercise.title} + {firstSet.secondary_exercise?.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {capitalize(firstSet.primary_exercise.primary_muscle)} | {capitalize(firstSet.primary_exercise.equipment)}
                      {' + '}
                      {capitalize(firstSet.secondary_exercise?.primary_muscle || '')} | {capitalize(firstSet.secondary_exercise?.equipment || '')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {supersetNumbers.map((num) => {
                        const set = supersetByNumber[num];
                        return (
                          <div key={num} className="bg-muted/30 border border-border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-foreground">Set #{num}</span>
                              <span className="text-xs text-muted-foreground px-2 py-1 bg-primary/10 rounded">Superset</span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-semibold text-foreground">{set.primary_exercise.title}:</span>
                                {set.primary_weight.map((weight, i) => (
                                  <span key={i} className="text-muted-foreground">
                                    {' '}{weight}kg × {set.primary_reps[i]} reps
                                    {i < set.primary_weight.length - 1 && ' → '}
                                  </span>
                                ))}
                              </div>
                              <div className="text-sm">
                                <span className="font-semibold text-foreground">{set.secondary_exercise?.title}:</span>
                                {set.secondary_weight && set.secondary_reps && set.secondary_weight.map((weight, i) => (
                                  <span key={i} className="text-muted-foreground">
                                    {' '}{weight}kg × {set.secondary_reps![i]} reps
                                    {set.secondary_weight && i < set.secondary_weight.length - 1 && ' → '}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            }
            return (
              <>
                {normalCards}
                {supersetCard}
              </>
            );
          })()
        )}
      </div>
    </div>
  )
}

export default WorkoutPage
