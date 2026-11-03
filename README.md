# GitMatch.ai

GitMatch.ai analyzes a GitHub repository's file structure and generates an AI-assisted technical report covering its likely purpose, technology stack, project structure, and implementation patterns. Sign in with GitHub to submit a repository and view its scan status and report.

**Live app:** [git-match-ai.vercel.app](https://git-match-ai.vercel.app)

## Tech stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/) and TypeScript
- [Supabase](https://supabase.com/) for GitHub OAuth, sessions, and data storage
- [Google Gemini](https://ai.google.dev/) for AI-generated reports
- Tailwind CSS 4

## Getting started

### Prerequisites

- Node.js and npm
- A Supabase project configured with GitHub OAuth
- A Google Gemini API key

### Install and configure

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/SatyamPote/GitMatch.ai.git
   cd GitMatch.ai
   npm install
   ```

2. Create `.env.local` in the project root with your credentials:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GEMINI_API_KEYS=your-gemini-api-key
   ```

   `GEMINI_API_KEYS` accepts one or more comma-separated keys. Keep API keys private and do not commit `.env.local`.

3. In Supabase, enable the GitHub OAuth provider and configure its callback URL as:

   ```text
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```

   Add your local and deployed app URLs to Supabase's allowed redirect URLs. The app returns from authentication at `/auth/callback`.

4. Configure the Supabase database tables used by the app. The scan action reads and writes `users` and `scans`; make sure their columns and access policies support the operations in `app/actions.ts`.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |

## How repository analysis works

After GitHub sign-in, submit a repository URL. The server action records a scan, retrieves the repository details and file tree through the GitHub API, and sends a truncated listing of up to 500 file paths to Gemini for a Markdown report. Scan status and the generated report are stored in Supabase.

The current implementation fetches repository data without an authenticated GitHub API token, so analysis is intended for public repositories. It analyzes file names and paths rather than source file contents; generated descriptions are inferences and may not fully reflect the project.

## Deploying

Deploy the app to [Vercel](https://vercel.com/) or another platform that supports Next.js. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEYS` in the deployment environment, then configure the Supabase OAuth provider and redirect URLs for your deployed domain.

## License

This project is distributed under the [MIT License](LICENSE).
