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

    const currentPage =
        pages.find(({ path }) => location.pathname.startsWith(path))?.page || 'CodeLift'

    return (
        <div className="app-shell-wrap">
            <div className="app-shell flex flex-col overflow-auto">
                <nav className="sticky top-0 z-10 border-b border-border/80 px-5 py-4 bg-card/95 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                        <h1 className="text-xl flex items-center gap-2 font-semibold tracking-tight">
                            <span className="text-primary">
                                <NotebookTabs size={21} />
                            </span>
                            <span>
                                Code<span className="text-primary">Lift</span>
                            </span>
                        </h1>
                        <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/60 text-muted-foreground font-medium">
                            {currentPage}
                        </span>
                    </div>
                </nav>

                <main className="flex-1 overflow-y-auto px-5">
                    <Outlet />
                </main>

                {user && (
                    <footer className="z-10 border-t border-border/80 bg-card/95 backdrop-blur px-2 py-2 shrink-0">
                        <div className="flex items-center justify-between gap-1">
                            {pages.map(({ name, icon: Icon, path }) => {
                                const isActive = location.pathname.startsWith(path)
                                const isProfile = name === 'Profile'

                                return (
                                    <button
                                        key={name}
                                        onClick={() => navigate(path)}
                                        className={`flex flex-col items-center flex-1 py-1.5 px-2 rounded-xl border transition-colors ${
                                            isActive
                                                ? 'bg-primary/12 border-primary/40 text-primary'
                                                : 'border-transparent text-muted-foreground hover:bg-muted/50'
                                        }`}
                                        type="button"
                                    >
                                        {isProfile && user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt="Profile"
                                                className={`h-7 w-7 rounded-full object-cover border-2 ${
                                                    isActive ? 'border-primary' : 'border-muted'
                                                }`}
                                            />
                                        ) : (
                                            <Icon size={20} strokeWidth={2.1} className={isActive ? 'text-primary' : ''} />
                                        )}
                                        <span className={`text-[11px] mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>{name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </footer>
                )}
            </div>
        </div>
    )
}

export default Layout
