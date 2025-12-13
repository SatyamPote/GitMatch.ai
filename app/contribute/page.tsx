'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Heart, Github, ExternalLink, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface Scan {
    id: string
    repo_url: string
    ai_summary: string
    status: string
}

export default function ContributePage() {
    const [scans, setScans] = useState<Scan[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [applyingTo, setApplyingTo] = useState<string | null>(null) // Repo ID being applied to

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const { data: scansData } = await supabase
                .from('scans')
                .select('*')
                .eq('status', 'completed') // Only show active repos ready for help
                .order('created_at', { ascending: false })

            if (scansData) setScans(scansData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async (repoUrl: string) => {
        if (!user) {
            alert('Please sign in via the Dashboard to apply.')
            return
        }
        setApplyingTo(repoUrl)

        try {
            // Auto-create profile if missing
            const { data: profile } = await supabase.from('users').select('id').eq('id', user.id).single()
            if (!profile) {
                await supabase.from('users').insert({
                    id: user.id,
                    github_username: user.user_metadata?.user_name,
                    avatar_url: user.user_metadata?.avatar_url,
                    role: 'freelancer'
                })
            }

            // Create contribution request linked to this repo
            const { error } = await supabase
                .from('contributions')
                .insert({
                    user_id: user.id,
                    type: 'free', // Defaulting to free mainly for open source
                    description: `Applied to contribute to: ${repoUrl}`,
                    is_paid_request: false,
                    status: 'pending'
                })

            if (error) throw error

            alert(`Application sent for ${repoUrl}!`)
        } catch (error) {
            console.error('Error applying:', error)
            alert('Failed to send application.')
        } finally {
            setApplyingTo(null)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: User Profile "Resume" */}
            <div className="lg:col-span-4 space-y-6">
                <div className="card sticky top-24">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Your Profile
                    </h2>

                    {user ? (
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <Image
                                    src={user.user_metadata?.avatar_url}
                                    alt={user.user_metadata?.user_name}
                                    width={120}
                                    height={120}
                                    className="rounded-full ring-4 ring-gh-border"
                                />
                                <div className="absolute bottom-0 right-0 bg-gh-accent text-white p-1 rounded-full border-4 border-gh-bg-secondary">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white">@{user.user_metadata?.user_name}</h3>
                            <p className="text-gh-text-secondary mb-6">{user.email}</p>

                            <div className="w-full bg-gh-bg p-4 rounded-md border border-gh-border text-left space-y-3 mb-6">
                                <div>
                                    <span className="text-xs uppercase text-gh-text-secondary font-bold tracking-wider">Role</span>
                                    <p className="font-semibold text-white">Full Stack Developer</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase text-gh-text-secondary font-bold tracking-wider">Status</span>
                                    <p className="text-emerald-400 text-sm flex items-center gap-1">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Available for work
                                    </p>
                                </div>
                            </div>

                            <button className="btn-secondary w-full">
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle className="h-10 w-10 text-gh-text-secondary mx-auto mb-3" />
                            <p className="text-gh-text-secondary mb-4">Sign in to view your profile</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Open Opportunities */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Heart className="h-6 w-6 text-pink-500" />
                        Open Opportunities
                    </h1>
                    <span className="px-3 py-1 bg-gh-border rounded-full text-xs font-bold text-white">
                        {scans.length} Repos
                    </span>
                </div>

                <div className="space-y-4">
                    {scans.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gh-text-secondary">No open repositories found. <br />Deployed agents will appear here.</p>
                        </div>
                    ) : (
                        scans.map((scan) => (
                            <div key={scan.id} className="card hover:border-gh-link transition-colors group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gh-bg rounded-md border border-gh-border">
                                            <Github className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <a href={scan.repo_url} target="_blank" className="text-lg font-bold text-gh-link hover:underline break-all">
                                                {scan.repo_url.replace('https://github.com/', '')}
                                            </a>
                                            <div className="flex items-center gap-2 text-xs text-gh-text-secondary mt-1">
                                                <span>Updated recently</span>
                                                <span>•</span>
                                                <span>JavaScript/TypeScript</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleApply(scan.repo_url)}
                                        disabled={applyingTo === scan.repo_url}
                                        className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {applyingTo === scan.repo_url ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Apply to Contribute
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="bg-gh-bg p-4 rounded-md border border-gh-border text-sm text-gh-text-primary leading-relaxed">
                                    {scan.ai_summary || 'No summary available for this repository yet.'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
