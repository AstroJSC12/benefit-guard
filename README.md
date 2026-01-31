# BenefitGuard

Your personal AI co-pilot for navigating healthcare, dental, and vision insurance.

## Features

- **AI Chat Assistant**: Get personalized guidance about your insurance coverage, benefits, and rights
- **Document Processing**: Upload insurance documents (SBC, EOB, denial letters, bills) for context-aware responses
- **Knowledge Base**: Pre-loaded with federal laws (No Surprises Act, ACA, HIPAA) and state regulations
- **Voice Access**: Call a phone number to talk to the AI assistant (Twilio integration)
- **Provider Lookup**: Find nearby urgent care centers and hospitals
- **RAG Pipeline**: Combines your uploaded documents with centralized knowledge for accurate responses

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL + Prisma ORM
- **Vector Store**: pgvector for RAG embeddings
- **LLM**: OpenAI GPT-4
- **Auth**: NextAuth.js (credentials provider)
- **Voice**: Twilio Voice integration

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL with pgvector extension
- OpenAI API key
- Twilio account (optional, for voice features)

### Installation

1. Clone the repository and install dependencies:
```bash
cd benefit-guard
npm install
```

2. Copy the environment example and configure:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/benefitguard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="sk-your-key"
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed  # Seeds the knowledge base
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed knowledge base
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── chat/          # Chat/RAG endpoint
│   │   ├── conversations/ # Conversation management
│   │   ├── documents/     # Document upload/processing
│   │   ├── providers/     # Provider lookup
│   │   └── voice/         # Twilio webhook
│   ├── auth/              # Auth pages (signin, signup)
│   ├── dashboard/         # Protected dashboard pages
│   └── onboarding/        # User onboarding flow
├── components/            # React components
│   ├── auth/              # Auth forms
│   ├── chat/              # Chat interface
│   ├── documents/         # Document upload
│   ├── onboarding/        # Onboarding wizard
│   ├── providers/         # Provider list, session provider
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and services
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── documents.ts       # PDF processing
│   ├── openai.ts          # OpenAI client and prompts
│   ├── providers.ts       # Provider lookup (mock)
│   └── rag.ts             # RAG retrieval pipeline
└── types/                 # TypeScript types
```

## Voice Access (Twilio)

To enable phone access:

1. Get a Twilio phone number
2. Set the webhook URL to `https://yourdomain.com/api/voice/twilio`
3. Configure your Twilio credentials in `.env`
4. Users can link their phone number in settings for personalized responses

## Deployment

Deploy to Vercel:

```bash
vercel
```

Ensure your PostgreSQL database has the pgvector extension enabled.

## License

MIT
