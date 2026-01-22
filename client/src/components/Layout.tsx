import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { User } from '../types'
import { Dumbbell, BarChart2, User as UserIcon, HeartPulse, NotebookTabs } from 'lucide-react'

const pages = [
    { name: 'Workout', icon: HeartPulse, path: '/dashboard', page: 'My Workouts' },
    { name: 'Exercise', icon: Dumbbell, path: '/exercise', page: 'Exercises' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics', page: 'Analytics' },
    { name: 'Profile', icon: UserIcon, path: '/profile', page: 'My Profile' },
]

const Layout: React.FC<{ user: User | null }> = ({ user }) => {
    const location = useLocation()
    const navigate = useNavigate()
    return (
        <div className="h-[100vh] max-w-md w-full mx-auto flex flex-col border overflow-auto">
            <nav className="min-h-12 border-b flex items-center justify-between rounded-b-2xl px-4 py-3 bg-card shadow-lg sticky top-0 z-10">
                <h1 className="text-2xl flex items-center gap-2 font-bold text-center">
                    <span className='text-primary'><NotebookTabs /></span>
                    <div>
                        <span>Code</span>
                        <span className="text-primary">Lift</span>
                    </div>
                </h1>
                <div>
                    {pages.map(({ name, path, page }) => {
                        if (location.pathname === path) {
                            return <span key={name} className="text-md font-medium">{page}</span>
                        }
                        return null
                    })}
                </div>
            </nav>
            <main className="flex-grow my-8 mx-8">
                <Outlet />
            </main>
            {user && (
                <footer className="min-h-20 border-t flex items-center justify-between rounded-t-2xl py-3 text-center bottom-0 w-full sticky z-10 bg-card shadow-lg">
                    {pages.map(({ name, icon: Icon, path }) => {
                        const isActive = location.pathname === path
                        const isProfile = name === 'Profile'
                        return (
                            <button
                                key={name}
                                onClick={() => navigate(path)}
                                className={`flex flex-col items-center flex-1 py-1 px-2 rounded-xl transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40'}`}
                                style={{ outline: 'none', border: 'none', background: 'none' }}
                            >
                                {isProfile && user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt="Profile"
                                        className={`h-7 w-7 rounded-full object-cover border-2 ${isActive ? 'border-primary' : 'border-muted'}`}
                                    />
                                ) : (
                                    <Icon size={24} strokeWidth={2.2} className={isActive ? 'text-primary' : ''} />
                                )}
                                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>{name}</span>
                            </button>
                        )
                    })}
                </footer>
            )}
        </div>
    )
}

export default Layout
