'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rocket, Users, Heart, Github, LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function Navbar() {
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            subscription.unsubscribe()
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setIsDropdownOpen(false)
    }

    const isActive = (path: string) => {
        return pathname === path ? 'font-bold text-white border-b-2 border-[#f78166]' : 'text-gh-text-primary hover:text-gh-text-secondary'
    }

    return (
        <nav className="bg-gh-bg-secondary border-b border-gh-border py-4 px-6 mb-8 relative z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity">
                        <div className="bg-white rounded-full p-1">
                            <Github className="h-6 w-6 text-gh-bg" />
                        </div>
                        <span>GitMatch.ai</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm">
                        <Link href="/dashboard" className={`flex items-center gap-2 py-1 transition-all ${isActive('/dashboard')}`}>
                            <Rocket className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link href="/developers" className={`flex items-center gap-2 py-1 transition-all ${isActive('/developers')}`}>
                            <Users className="h-4 w-4" />
                            Talent Wall
                        </Link>
                        <Link href="/contribute" className={`flex items-center gap-2 py-1 transition-all ${isActive('/contribute')}`}>
                            <Heart className="h-4 w-4" />
                            Contribute
                        </Link>
                    </div>
                </div>

                <div>
                    {loading ? (
                        <div className="h-8 w-8 rounded-full bg-gh-border animate-pulse"></div>
                    ) : user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 group focus:outline-none"
                            >
                                <span className="text-sm font-medium text-white hidden md:block group-hover:text-gh-link transition-colors">
                                    {user.user_metadata?.user_name}
                                </span>
                                <div className="h-8 w-8 rounded-full border border-gh-border overflow-hidden group-hover:border-gh-text-secondary transition-colors relative">
                                    <Image
                                        src={user.user_metadata?.avatar_url || 'https://avatars.githubusercontent.com/u/10001?v=4'}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gh-text-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gh-bg-secondary border border-gh-border rounded-md shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                    <div className="px-4 py-2 border-b border-gh-border md:hidden">
                                        <p className="text-sm text-white font-bold">@{user.user_metadata?.user_name}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} className="text-sm font-bold text-white hover:text-gh-link transition-colors">
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
