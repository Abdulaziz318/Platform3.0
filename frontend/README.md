LLM Experiment Platform - Complete Setup Guide (Windows)
🎯 What You're Getting
A fully functional Next.js frontend with:

✅ User authentication (login/register)
✅ Experiment creation interface
✅ Real-time dashboard with progress tracking
✅ Mock API (works immediately without backend)
✅ Beautiful UI with Tailwind CSS
✅ TypeScript for type safety

📋 Prerequisites

Node.js 18+ - Download from https://nodejs.org/
Text Editor - VS Code recommended (https://code.visualstudio.com/)
Git Bash or Command Prompt - Built into Windows

🚀 Quick Start (5 Steps)
Step 1: Install Node.js

Go to https://nodejs.org/
Download the LTS version (20.x)
Run installer, click "Next" through all options
Verify installation:

cmd   node --version
   npm --version
You should see version numbers like v20.x.x and 10.x.x
Step 2: Create Project
Open Command Prompt or PowerShell:
cmdcd Desktop
mkdir llm-experiment-platform
cd llm-experiment-platform
Step 3: Initialize Next.js
cmdnpx create-next-app@latest frontend
Answer the prompts:

TypeScript? → Yes
ESLint? → Yes
Tailwind CSS? → Yes
src/ directory? → No
App Router? → Yes
Customize import alias? → No

Wait for installation to complete (1-2 minutes).
Step 4: Install Dependencies
cmdcd frontend
npm install lucide-react
Step 5: Create Folder Structure
cmdmkdir lib
mkdir components
mkdir app\auth\login
mkdir app\auth\register
mkdir app\setup
mkdir app\experiments
mkdir app\experiments\[id]
📁 File Structure
Your frontend folder should look like this:
frontend/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          ← Copy from artifact
│   │   └── register/
│   │       └── page.tsx          ← Copy from artifact
│   ├── experiments/
│   │   ├── [id]/
│   │   │   └── page.tsx          ← Copy from artifact
│   │   └── page.tsx              ← Copy from artifact
│   ├── setup/
│   │   └── page.tsx              ← Copy from artifact
│   ├── layout.tsx                ← REPLACE with artifact
│   ├── page.tsx                  ← REPLACE with artifact
│   └── globals.css               ← REPLACE with artifact
├── components/
│   ├── Navbar.tsx                ← Copy from artifact
│   └── ProtectedRoute.tsx        ← Copy from artifact
├── lib/
│   ├── api.ts                    ← Copy from artifact
│   └── types.ts                  ← Copy from artifact (same file as api.ts)
├── package.json
└── tsconfig.json
📝 Copy Files from Artifacts
I've provided all the code in artifacts. Here's how to copy them:
For lib/api.ts AND lib/types.ts:
The artifact contains BOTH files. Look for comments like:
typescript// ==============================================
// FILE: lib/types.ts
// ==============================================
Copy each section to its respective file.
Steps to Copy:

Open VS Code in your frontend folder
For each file in the artifacts:

Find the section in the artifact (look for // FILE: path/to/file.tsx)
Create the file in your project
Copy the code (everything after the comment)
Save the file



12 Files to Copy:

✅ lib/types.ts - TypeScript interfaces
✅ lib/api.ts - API client with mock data
✅ app/layout.tsx - Root layout
✅ app/page.tsx - Landing page
✅ app/globals.css - Tailwind styles
✅ components/Navbar.tsx - Navigation bar
✅ components/ProtectedRoute.tsx - Auth wrapper
✅ app/auth/login/page.tsx - Login page
✅ app/auth/register/page.tsx - Register page
✅ app/setup/page.tsx - Experiment creation
✅ app/experiments/page.tsx - Dashboard
✅ app/experiments/[id]/page.tsx - Experiment detail

▶️ Run the App
cmdnpm run dev
Open browser to: http://localhost:3000
You should see the landing page!
🧪 Test the App (Mock Mode)
The app runs in MOCK MODE by default - no backend needed!
Try These Actions:

Click "Get Started" → Register page
Enter any email/password → Creates mock account
See dashboard → 2 fake experiments shown
Click "New Experiment" → Fill form (any values work)
Upload any CSV → Creates fake experiment
Watch progress bar → Simulates progress every 3 seconds
Click "Download Results" → Downloads mock CSV

Everything works without a backend!
🔧 Common Issues & Fixes
Issue: "npm not recognized"
Fix: Close and reopen Command Prompt after installing Node.js
Issue: Port 3000 already in use
Fix: Use a different port:
cmdnpm run dev -- -p 3001
Issue: TypeScript errors
Fix: Make sure all 12 files are copied correctly. Check for:

Missing imports at the top of files
Typos in file paths
Files in wrong folders

Issue: Styles not working
Fix: Make sure app/globals.css was replaced with the artifact version
Issue: Hot reload not working on Windows
Fix: Add to next.config.mjs:
javascript/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

export default nextConfig
🌐 Connect to Real Backend (Later)
When your Railway backend is ready:

Create .env.local in frontend folder:

bash   NEXT_PUBLIC_API_URL=https://your-backend.railway.app

Edit lib/api.ts:

typescript   const MOCK_MODE = false;  // Change to false

Restart dev server:

cmd   npm run dev
🚀 Deploy to Vercel (When Ready)
cmdnpm install -g vercel
vercel login
vercel
Follow prompts, then your app is live!
📚 Project Structure Explained
frontend/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout (navbar, fonts)
│   ├── page.tsx           # Landing page (/)
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login form
│   │   └── register/      # Registration form
│   ├── setup/             # Experiment creation
│   └── experiments/       # Dashboard and details
├── components/            # Reusable React components
│   ├── Navbar.tsx        # Top navigation
│   └── ProtectedRoute.tsx # Auth guard
├── lib/                   # Utilities
│   ├── api.ts            # API client (with mock)
│   └── types.ts          # TypeScript types
└── public/               # Static files
🎨 Customization Tips
Change Colors:
Edit tailwind.config.ts:
typescripttheme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
Change App Name:

Edit app/layout.tsx (metadata)
Edit components/Navbar.tsx (logo text)

Add Logo:

Put logo in public/logo.png
Edit components/Navbar.tsx:

tsx   <Image src="/logo.png" alt="Logo" width={32} height={32} />
📞 Need Help?
Checklist:

 Node.js installed? (node --version)
 All 12 files copied from artifacts?
 No TypeScript errors in terminal?
 Ran npm install lucide-react?
 In correct folder? (cd frontend)

Still Stuck?
Double-check:

File names exactly match (case-sensitive on some systems)
Files are in correct folders
No missing imports at top of files
npm run dev shows no errors

🎯 Next Steps
Once this works:

✅ Test all pages - Make sure everything works in mock mode
✅ Customize branding - Change colors, text, logo
✅ Build backend - Follow the Railway/Modal setup plan
✅ Connect backend - Switch MOCK_MODE to false
✅ Deploy - Push to Vercel

🎉 Success!
If you can:

See the landing page at http://localhost:3000
Login with any credentials
Create a fake experiment
See the progress bar animate

Congratulations! Your frontend is working perfectly. 🚀

Made with ❤️ for LLM Researchers