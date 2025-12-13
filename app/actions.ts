'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// API Keys provided by user
const GEMINI_KEYS = [
    'AIzaSyDcrWH41icbtxanwbwnQ7ObCNSyg6xAL7M',
    'AIzaSyAtz6aacO4fxDhHleqUh4nt-st3We87Bq4'
]

const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

async function generateWithFallback(prompt: string, keyAttempt = 0, modelAttempt = 0): Promise<string> {
    if (keyAttempt >= GEMINI_KEYS.length) {
        throw new Error('All Gemini API keys failed.');
    }

    const apiKey = GEMINI_KEYS[keyAttempt];
    const modelName = MODELS_TO_TRY[modelAttempt];

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.warn(`Key ${keyAttempt + 1} with Model ${modelName} failed:`, error.message);

        // Try next model with same key
        if (modelAttempt + 1 < MODELS_TO_TRY.length) {
            return generateWithFallback(prompt, keyAttempt, modelAttempt + 1);
        }
        // Try next key with first model
        return generateWithFallback(prompt, keyAttempt + 1, 0);
    }
}

export async function deployAgentAction(repoUrl: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('You must be logged in to deploy an agent.')
    }

    try {
        // 1. Check/Create User Profile
        const { data: profile } = await supabase.from('users').select('id').eq('id', user.id).single()
        if (!profile) {
            await supabase.from('users').insert({
                id: user.id,
                github_username: user.user_metadata?.user_name || 'unknown',
                avatar_url: user.user_metadata?.avatar_url || '',
                role: 'maintainer'
            })
        }

        // 2. Create Scan Record
        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .insert({
                repo_url: repoUrl,
                user_id: user.id,
                status: 'analyzing'
            })
            .select()
            .single()

        if (scanError) throw scanError

        // 3. AI Analysis
        try {
            const repoPath = repoUrl.replace('https://github.com/', '').replace(/\/$/, '')

            // A. Fetch Repo Details
            const repoRes = await fetch(`https://api.github.com/repos/${repoPath}`)
            if (!repoRes.ok) throw new Error('Failed to fetch repo info from GitHub')
            const repoData = await repoRes.json()
            const defaultBranch = repoData.default_branch || 'main'

            // B. Fetch File Tree
            const treeRes = await fetch(`https://api.github.com/repos/${repoPath}/git/trees/${defaultBranch}?recursive=1`)
            if (!treeRes.ok) throw new Error('Failed to fetch file tree. Is the repo public?')
            const treeData = await treeRes.json()

            const files = treeData.tree
                ?.filter((f: any) => f.type === 'blob')
                .map((f: any) => f.path)
                .slice(0, 500)
                .join('\n') || 'No files found'

            const prompt = `
You are an expert Senior Software Engineer and Tech Lead.
Analyze the following file structure of a GitHub repository and generate a comprehensive technical report.

**Repository URL**: ${repoUrl}
**File Structure (Truncated)**:
${files}

**Instructions**:
1.  **Project Overview**: What does this project likely do? Infer from file names and structure.
2.  **Tech Stack**: List languages, frameworks, and key libraries detected.
3.  **Project Structure**: Generate a clean, ASCII-style tree diagram of the most important directories and files.
4.  **Key Implementation Details**: Highlight any specific patterns (e.g., Next.js App Router, Redux, Supabase, Docker, etc.).

**Output Format**: Markdown. Use headers (##) and bullet points. Be professional and concise.
            `

            // C. Generate with Fallback
            const aiSummary = await generateWithFallback(prompt)

            // D. Update DB
            await supabase
                .from('scans')
                .update({
                    ai_summary: aiSummary,
                    status: 'completed'
                })
                .eq('id', scan.id)

        } catch (aiError: any) {
            console.error('Gemini Analysis Failed:', aiError)

            await supabase
                .from('scans')
                .update({
                    status: 'failed',
                    ai_summary: `AI Analysis Failed: ${aiError.message}`
                })
                .eq('id', scan.id)
        }

        return { success: true, scanId: scan.id }

    } catch (error: any) {
        console.error('Server Action Error:', error)
        return { success: false, error: error.message }
    }
}
