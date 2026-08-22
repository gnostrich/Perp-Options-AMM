# Temporal.Exchange Frontend

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Lightweight Charts & Recharts
- **Web3**: Wagmi & Viem
- **Animations**: GSAP & Motion
- **Trading**: Hyperliquid SDK

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd perp-frontend-hyperliquid
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── transact/       # Trading and price band components
│   └── ...
├── layouts/            # Layout components
├── lib/                # Utility functions and configurations
├── store/              # Zustand state management
└── wagmi.ts           # Wagmi configuration for Web3 integration
```

## Resources

- **Temporal.Exchange**: [https://temporal.exchange](https://temporal.exchange)

## Support

For support and questions about this frontend application, please contact the development team. For questions about Temporal.Exchange platform features, visit the official documentation or community channels.
