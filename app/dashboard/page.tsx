'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Rocket, History, ExternalLink, Loader2, Sparkles, Github } from 'lucide-react'
import { deployAgentAction } from '@/app/actions' // Import Server Action



interface Scan {
    id: string
    repo_url: string
    status: 'pending' | 'completed'
    ai_summary: string | null
    created_at: string
}

export default function Dashboard() {
    const [repoUrl, setRepoUrl] = useState('')
    const [scans, setScans] = useState<Scan[]>([])
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        fetchScans()

        const channel = supabase
            .channel('scans-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'scans',
                },
                (payload) => {
                    fetchScans()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchScans = async () => {
        const { data } = await supabase
            .from('scans')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setScans(data)
    }

    const handleDeploy = async () => {
        if (!repoUrl) return
        setLoading(true)
        setErrorMsg(null)

        try {
            const result = await deployAgentAction(repoUrl)

            if (!result.success) {
                setErrorMsg(result.error || 'Failed to deploy agent.')
                return
            }

            setRepoUrl('')
            fetchScans()
        } catch (error: any) {
            console.error('Error deploying agent:', error)
            setErrorMsg(error.message || 'Failed to deploy agent.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-white p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 border-b border-[#30363d] pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-2">
                            <Rocket className="h-8 w-8 text-white" />
                            GitMatch
                        </h1>
                        <p className="text-[#8b949e] mt-2">AI-Powered Repository Analysis & Matching</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Deploy Agent */}
                    <section className="lg:col-span-5 space-y-8">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-white mb-2">Deploy Analysis Agent</h2>
                            <p className="text-[#8b949e] text-sm mb-6">
                                Enter a GitHub repository URL to generate a technical graph.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-white mb-2">REPOSITORY URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com/username/project"
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white placeholder-[#8b949e] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] outline-none transition-all"
                                        value={repoUrl}
                                        onChange={(e) => setRepoUrl(e.target.value)}
                                    />
                                </div>

                                {errorMsg && (
                                    <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-md text-red-400 text-sm flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    onClick={handleDeploy}
                                    disabled={loading || !repoUrl}
                                    className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Deploy Agent</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Recent Scans */}
                    <section className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="h-5 w-5 text-[#8b949e]" />
                            <h2 className="text-xl font-semibold text-white">Analysis History</h2>
                        </div>

                        <div className="space-y-4">
                            {scans.length === 0 ? (
                                <div className="text-center py-16 border border-dashed border-[#30363d] rounded-md text-[#8b949e]">
                                    No repositories analyzed yet.
                                </div>
                            ) : (
                                scans.map((scan) => (
                                    <div key={scan.id} className="bg-[#161b22] border border-[#30363d] rounded-md p-6 hover:border-[#8b949e] transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-3">
                                            <a href={scan.repo_url} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline font-medium break-all flex items-center gap-2">
                                                <Github className="h-4 w-4" />
                                                {scan.repo_url.replace('https://github.com/', '')}
                                            </a>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${scan.status === 'completed'
                                                ? 'bg-[#238636]/10 text-[#34d399] border-[#238636]/20'
                                                : scan.status === 'failed'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20'
                                                }`}>
                                                {scan.status}
                                            </span>
                                        </div>

                                        <div className="prose prose-invert prose-sm max-w-none text-[#c9d1d9] leading-relaxed">
                                            {scan.ai_summary ? (
                                                <div className="whitespace-pre-wrap font-mono text-xs bg-[#0d1117] p-4 rounded-md border border-[#30363d] max-h-60 overflow-y-auto">
                                                    {scan.ai_summary}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[#8b949e] italic">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Analyzing repository structure...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
