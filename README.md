# AI-Driven Trading Journal

A zero-code, AI-assisted trading journal application built with Next.js and Supabase.

## Features

- **Dashboard**: KPI tiles, calendar heat map, and recent trades table
- **Trade Management**: Log trades with rich metadata and track performance
- **Journal System**: Weekly and daily planning/review with AI-assisted insights
- **Risk/Reward Analysis**: Real-time calculation of risk, reward, and R-multiple
- **Partial Closures**: Support for partial position closures and reopening
- **AI Integration**: Auto-generated trade reviews and pattern detection

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI API integration for trade analysis
- **Visualization**: Recharts for data visualization
- **State Management**: React Context and React Query
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trading-journal.git
   cd trading-journal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update the `.env.local` file with your Supabase and OpenAI credentials.

5. Set up the Supabase database:
   - Create a new Supabase project
   - Run the SQL script in `supabase/schema.sql` to create the database schema
   - Enable Row-Level Security (RLS) policies

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
trading-journal/
├── app/                    # Next.js app directory
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard page
│   ├── journal/            # Journal pages
│   ├── trades/             # Trades listing and detail pages
│   └── settings/           # Settings pages
├── components/             # React components
│   ├── layout/             # Layout components
│   ├── trades/             # Trade-related components
│   └── ui/                 # UI components (shadcn/ui)
├── lib/                    # Utility functions and shared code
│   ├── supabase/           # Supabase client configuration
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── supabase/               # Supabase configuration and schema
```

## Database Schema

The application uses the following database tables:

- `instruments`: Trading instruments (stocks, futures, forex, etc.)
- `accounts`: User trading accounts
- `strategies`: Trading strategies
- `trades`: Trade records with risk/reward calculations
- `trade_closures`: Partial or full trade closures
- `journal_weeks`: Weekly journal entries
- `journal_days`: Daily journal entries

## Features in Detail

### Dashboard

The dashboard provides a quick overview of your trading performance with:

- KPI tiles showing key metrics (Profit Factor, Win Rate, etc.)
- Calendar heat map visualizing daily P&L
- Recent trades table for quick access to your latest activity

### Trade Management

- Log trades with comprehensive metadata
- Real-time risk/reward calculation
- Support for partial closures and position management
- Filter and search trades by various criteria

### Journal System

- Weekly planning and review
- Daily trading plans and reflections
- Integration with trades for context-aware journaling
- AI-assisted insights and pattern detection

### AI Integration

- Auto-generated trade reviews
- Pattern detection across your trading history
- Performance insights and improvement suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
