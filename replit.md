# MONSTA - Quantum AI Crypto Trading Platform

## Overview

MONSTA is a comprehensive cryptocurrency trading platform that combines AI-powered signals, real-time market analysis, and advanced trading tools. The platform serves as a quantum AI crypto trading hub, providing users with sophisticated market insights, automated trading capabilities, and professional-grade analytics for cryptocurrency markets.

The system integrates multiple data sources including Binance WebSocket API, CoinGecko, and Alternative.me to deliver real-time market data, whale tracking, smart money analysis, and AI-generated trading signals. The platform features a multi-tier subscription system with different access levels ranging from free to premium tiers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15.5.2 with React 19 and TypeScript
- **Styling**: Tailwind CSS with custom dark theme and glass morphism effects  
- **State Management**: Zustand for client-side state, React Context for UI state (sidebar, theme)
- **Animation**: Framer Motion for smooth transitions and interactions
- **Charts**: Multiple charting libraries - Recharts, Chart.js, Lightweight Charts for different visualization needs
- **PWA Support**: Service worker registration and mobile app capabilities
- **Mobile-First Design**: Responsive design with mobile bottom navigation and optimized mobile experience

### Backend Architecture  
- **Hybrid System**: Next.js API routes for frontend integration + FastAPI (Python) for AI/ML processing
- **Database**: SQLite for development, PostgreSQL for production with Prisma ORM
- **WebSocket Integration**: Real-time data streams from Binance and custom WebSocket connections
- **Caching**: Node-cache for performance optimization
- **Error Handling**: Comprehensive error boundaries and safe number formatting utilities

### Data Architecture
- **Real-time Data Sources**: Binance WebSocket API for live price feeds and trading data
- **Market Data**: CoinGecko API for comprehensive cryptocurrency information
- **AI Predictions**: Custom AI models for signal generation and market analysis
- **Time Series Data**: Historical price data and performance analytics
- **User Data**: Account management, subscription tiers, and personalized settings

### Module Architecture
- **Page-Based Modules**: Independent modules for different functionalities (signals, trading, portfolio, analytics)
- **Component Library**: Reusable components with consistent theming and responsive design
- **Hook System**: Custom React hooks for WebSocket connections, API calls, and data management
- **Utility Libraries**: Safe number formatting, API clients, and configuration management

### Security and Performance
- **Authentication**: Placeholder for NextAuth integration (currently bypassed for development)
- **API Security**: CORS configuration and request validation
- **Performance**: Dynamic imports, lazy loading, and optimized bundle splitting
- **Error Recovery**: Graceful error handling with fallback UI components

## External Dependencies

### Trading and Market Data APIs
- **Binance API**: Primary cryptocurrency exchange API for real-time market data, WebSocket streams, and trading information
- **CoinGecko API**: Comprehensive cryptocurrency data including market cap, historical prices, and market metrics
- **Alternative.me API**: Fear & Greed Index and market sentiment indicators
- **TradingView Widgets**: Professional charting capabilities and seasonal analysis tools

### Infrastructure and Hosting
- **AWS EC2**: Production server hosting on 13.209.84.93
- **PM2**: Process manager for Node.js applications with clustering and auto-restart
- **GitHub Actions**: CI/CD pipeline for automated deployment and server management
- **Vercel/Railway**: Alternative hosting platforms (configuration present)

### Development and Build Tools
- **TypeScript**: Type safety and enhanced development experience
- **ESLint**: Code quality and consistency enforcement
- **Prisma**: Database ORM and schema management
- **Next.js Build System**: Optimized production builds with static generation

### Third-Party Services
- **Telegram Bot API**: Integration for notifications and alerts (node-telegram-bot-api)
- **Email Services**: Nodemailer for transactional emails
- **Monitoring**: Basic health checks and error tracking
- **Analytics**: Built-in analytics for user behavior and system performance

### AI and Machine Learning
- **Custom AI Models**: Python FastAPI backend for AI predictions and signal generation
- **Data Processing**: Real-time market analysis and pattern recognition
- **WebSocket Streams**: Live data processing for instantaneous market updates

### Payment and Subscription
- **Subscription System**: Multi-tier access control (Free, Silver, Gold, Platinum, Signature, Master tiers)
- **User Management**: Account creation, authentication, and role-based permissions
- **Payment Integration**: Placeholder for payment processing systems