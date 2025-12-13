'use client'

import { createClient } from '@/utils/supabase/client'
import { Github } from 'lucide-react'

export default function Home() {
    const supabase = createClient()

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                {/* Header content if needed */}
            </div>

            <div className="relative flex place-items-center flex-col gap-6">
                <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent pb-2">
                    GitMatch.ai
                </h1>
                <p className="text-2xl text-slate-400 max-w-2xl">
                    Hire Developers Who Actually Understand Your Code.
                </p>

                <div className="mt-8">
                    <button
                        onClick={handleLogin}
                        className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white transition-all duration-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                    >
                        <Github className="mr-3 h-6 w-6" />
                        Login with GitHub
                        <div className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl" />
                    </button>
                </div>
            </div>
        </main>
    )
}
