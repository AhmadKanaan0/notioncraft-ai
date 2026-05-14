# NotionCraft AI

An intelligent note-taking and document management application that combines the power of AI with a rich text editing experience. Build, organize, and enhance your documents with AI-powered features.

**🌐 Live Demo:** [notioncraft-ai.vercel.app](https://notioncraft-ai.vercel.app)

---

## ✨ Features

- **🤖 AI-Powered Writing Assistant** - Get intelligent suggestions and enhancements powered by Google's AI SDK
- **📝 Rich Text Editor** - Advanced document editing with Tiptap, featuring:
  - Multiple formatting options (bold, italic, underline, etc.)
  - Tables and task lists
  - Code blocks with syntax highlighting
  - Character count and word statistics
  - KaTeX support for mathematical equations
  - Collaborative editing capabilities

- **📚 Document Organization** - Create, manage, and organize your notes efficiently
- **🎨 Modern UI** - Clean, intuitive interface built with Radix UI components
- **🌓 Dark Mode** - Seamless light/dark theme support
- **☁️ Cloud Storage** - Supabase integration for secure data persistence
- **📱 Responsive Design** - Works beautifully on desktop, tablet, and mobile devices

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org) - React framework with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org) (94.3% of codebase)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) with animations
- **UI Components:** [Radix UI](https://www.radix-ui.com) - Headless component library
- **Rich Text Editor:** [Tiptap](https://www.tiptap.dev) - Headless editor with extensive extensions
- **Forms:** [React Hook Form](https://react-hook-form.com) with Zod validation
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query) - Powerful async state management

### Backend & Database
- **Database:** PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Backend as a Service:** [Supabase](https://supabase.com) - Auth, storage, and database
- **Database Driver:** [postgres](https://github.com/porsager/postgres) - Fast PostgreSQL client

### AI & Advanced Features
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai) with Google Gemini support
- **Real-time Collaboration:** Yjs + Y-Tiptap for collaborative editing
- **Command Palette:** cmdk for quick actions and navigation
- **Charts & Visualization:** Recharts for data visualization

### Additional Tools
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **Theme Management:** next-themes
- **Notifications:** Sonner toast notifications
- **Code Highlighting:** Lowlight with Shiki

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for database and auth)
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmadKanaan0/notioncraft-ai.git
   cd notioncraft-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   GOOGLE_API_KEY=your_google_ai_api_key
   
   DATABASE_URL=your_postgres_connection_string
   ```

4. **Set up the database**
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Open Drizzle Studio for database management |
| `npm run db:generate` | Generate database migrations |

---

## 📁 Project Structure

```
notioncraft-ai/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utility functions and helpers
│   ├── db/               # Database schemas (Drizzle)
│   └── styles/           # Global styles
├── public/               # Static assets
├── supabase/             # Supabase migrations and SQL
├── drizzle.config.ts     # Drizzle ORM configuration
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

---

## 🔐 Authentication & Authorization

The application uses Supabase Authentication for secure user management:
- Email/password authentication
- Session management with SSR support
- Protected routes and API endpoints
- User profile management

---

## 💾 Database Schema

The application uses PostgreSQL with Drizzle ORM. Key entities include:
- **Users** - User accounts and profiles
- **Documents** - Notes and documents created by users
- **Collaborators** - Real-time collaborative editing support

See [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) for detailed schema documentation.

---

## 🤖 AI Features

Powered by Google's Gemini AI:
- Smart writing suggestions
- Content enhancement and refinement
- Grammar and style improvements
- Context-aware completions

Integration uses the [Vercel AI SDK](https://sdk.vercel.ai) for streamlined AI interactions.

---

## 🌐 Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel project settings
4. Deploy!

[Learn more about Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying)

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Development Guidelines

- **Code Style:** Follow ESLint configuration
- **Type Safety:** Strict TypeScript checking enabled
- **Database Changes:** Use Drizzle migrations
- **Commits:** Use clear, descriptive commit messages

---

## 🐛 Known Issues & Roadmap

- Real-time collaboration improvements
- Mobile app support
- Export to multiple formats (PDF, DOCX, etc.)
- Advanced AI features (custom prompts, templates)
- Offline support

---

## 📄 License

This project is private. All rights reserved to Ahmad Kanaan.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an [issue](https://github.com/AhmadKanaan0/notioncraft-ai/issues)
- Check existing documentation in [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tiptap](https://www.tiptap.dev) - Rich text editor
- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration
- [Radix UI](https://www.radix-ui.com) - UI primitives
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

**Made with ❤️ by Ahmad Kanaan**
