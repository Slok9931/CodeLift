import React, { useEffect, useState } from 'react'
import UserService from '../services/user'
import type { User } from '../types'
import Loading from './Loading'
import { capitalize } from '../lib/utils'

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        name: user?.name || '',
        gender: '',
        height: '',
        weight: '',
        age: '',
    })
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        UserService.getUserProfile()
            .then((data) => {
                setUser(data.user)
                setLoading(false)
            })
            .catch(() => {
                setError('Failed to load profile')
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        if (editing && user) {
            setForm({
                name: user.name || '',
                gender: user.gender || '',
                height: user.height?.toString() || '',
                weight: user.weight?.toString() || '',
                age: user.age?.toString() || '',
            })
        }
        // eslint-disable-next-line
    }, [editing])

    const startEditing = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setEditing(true)
        setSaveError(null)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSaveError(null)
        try {
            const updated = await UserService.updateUserProfile({
                name: form.name,
                gender: form.gender as 'male' | 'female' | 'other',
                height: form.height ? Number(form.height) : undefined,
                weight: form.weight ? Number(form.weight) : undefined,
                age: form.age ? Number(form.age) : undefined,
            })
            setUser(updated.user)
            setEditing(false)
        } catch (err) {
            setSaveError('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <Loading fullScreen message="Loading profile..." />
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="text-destructive text-lg font-semibold mb-2">{error || 'No profile found'}</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
                <div className="relative">
                    <img
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=DC2626&color=fff`}
                        alt={user.name}
                        className="h-24 w-24 rounded-full object-cover border-4 border-primary shadow-lg"
                    />
                </div>
                <div className="mt-4 text-center">
                    <div className="text-xl font-bold text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
            </div>

            <form className="w-full mt-6" onSubmit={handleSave}>
                <div className="bg-card rounded-xl shadow p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Gender</span>
                        {editing ? (
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="input input-bordered rounded-lg px-2 py-1 bg-background border border-border text-foreground"
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        ) : (
                            <span className="font-medium text-foreground">{capitalize(user.gender) || '-'}</span>
                        )}
                    </div>
                    <div className="w-full h-px bg-muted-foreground/20"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Height</span>
                        {editing ? (
                            <input
                                name="height"
                                type="number"
                                min="0"
                                value={form.height}
                                onChange={handleChange}
                                className="input input-bordered rounded-lg px-2 py-1 bg-background border border-border text-foreground w-20 text-right"
                                placeholder="cm"
                            />
                        ) : (
                            <span className="font-medium text-foreground">{user.height ? `${user.height} cm` : '-'}</span>
                        )}
                    </div>
                    <div className="w-full h-px bg-muted-foreground/20"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Weight</span>
                        {editing ? (
                            <input
                                name="weight"
                                type="number"
                                min="0"
                                value={form.weight}
                                onChange={handleChange}
                                className="input input-bordered rounded-lg px-2 py-1 bg-background border border-border text-foreground w-20 text-right"
                                placeholder="kg"
                            />
                        ) : (
                            <span className="font-medium text-foreground">{user.weight ? `${user.weight} kg` : '-'}</span>
                        )}
                    </div>
                    <div className="w-full h-px bg-muted-foreground/20"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Age</span>
                        {editing ? (
                            <input
                                name="age"
                                type="number"
                                min="0"
                                value={form.age}
                                onChange={handleChange}
                                className="input input-bordered rounded-lg px-2 py-1 bg-background border border-border text-foreground w-20 text-right"
                            />
                        ) : (
                            <span className="font-medium text-foreground">{user.age || '-'}</span>
                        )}
                    </div>
                </div>
                {saveError && <div className="text-destructive text-sm text-center mt-2">{saveError}</div>}
                <button
                    type={editing ? 'submit' : 'button'}
                    className="mt-8 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60"
                    onClick={editing ? undefined : startEditing}
                    disabled={saving}
                >
                    {editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
                </button>
                {editing && (
                    <button
                        type="button"
                        className="mt-2 w-full py-2 rounded-xl bg-muted text-foreground font-semibold shadow hover:bg-muted/80 transition"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                )}
            </form>
        </div>
    )
}

export default ProfilePage