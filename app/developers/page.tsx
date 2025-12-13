'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, Loader2, User, Code, DollarSign, Sparkles, Github } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Developer {
    id: string
    description: string
    type: 'free' | 'paid'
    is_paid_request: boolean
    user_id: string
    users: {
        github_username: string
        avatar_url: string
        role: string
    }
}

export default function DevelopersPage() {
    const [developers, setDevelopers] = useState<Developer[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')

    const supabase = createClient()

    useEffect(() => {
        fetchDevelopers()
    }, [])

    const fetchDevelopers = async () => {
        try {
            const { data, error } = await supabase
                .from('contributions')
                .select(`
                *,
                users (
                    github_username,
                    avatar_url,
                    role
                )
            `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDevelopers(data as any)
        } catch (error) {
            console.error('Error fetching developers:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredDevelopers = developers.filter(dev => {
        if (filter === 'all') return true
        return dev.type === filter
    })

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 border-b border-slate-800/60 pb-8 backdrop-blur-sm sticky top-0 z-50 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                            GitMatch.ai
                        </Link>
                        <p className="text-slate-400 text-sm mt-1">Find the perfect contributor for your repo</p>
                    </div>

                    <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 backdrop-blur-md">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                        >
                            All Talent
                        </button>
                        <button
                            onClick={() => setFilter('free')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'free' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400'}`}
                        >
                            Free Contributors
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'paid' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-purple-400'}`}
                        >
                            Paid Pros
                        </button>
                    </div>

                    <Link href="/hire" className="hidden md:flex items-center gap-2 px-6 py-2 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors">
                        <Search className="h-4 w-4" />
                        <span>Post a Job</span>
                    </Link>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                    </div>
                ) : filteredDevelopers.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="h-8 w-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No developers found yet</h3>
                        <p className="text-slate-400 mb-6">Be the first to join the talent pool!</p>
                        <Link href="/contribute" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                            <Sparkles className="h-4 w-4" />
                            Become a Contributor
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDevelopers.map((dev) => (
                            <div key={dev.id} className="group relative bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 flex flex-col">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${dev.type === 'paid' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                        {dev.type === 'paid' ? <DollarSign className="h-3 w-3" /> : <Code className="h-3 w-3" />}
                                        {dev.type === 'paid' ? 'Freelancer' : 'Contributor'}
                                    </span>
                                </div>

                                <div className="p-6 pb-0 flex items-center gap-4">
                                    <div className="relative">
                                        {dev.users?.avatar_url ? (
                                            <Image
                                                src={dev.users.avatar_url}
                                                alt={dev.users.github_username}
                                                width={64}
                                                height={64}
                                                className="rounded-full ring-2 ring-slate-700 group-hover:ring-emerald-500/50 transition-all"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center ring-2 ring-slate-700">
                                                <User className="h-8 w-8 text-slate-500" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-slate-800">
                                            <Github className="h-3 w-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            @{dev.users?.github_username || 'Anonymous'}
                                        </h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{dev.users?.role || 'Developer'}</p>
                                    </div>
                                </div>

                                <div className="p-6 flex-1">
                                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
                                        "{dev.description}"
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-950/30 border-t border-slate-800/50 flex gap-2">
                                    <button className="flex-1 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                        Hire Me
                                    </button>
                                    <Link href={`https://github.com/${dev.users?.github_username}`} target="_blank" className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700">
                                        <Github className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
