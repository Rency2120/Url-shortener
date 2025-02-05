# Advanced URL Shortener

A feature-rich URL shortening service with real-time analytics, Redis caching, and Google OAuth authentication.

# Live Demo: https://url-shortener-o037.onrender.com  
# API Documentation: https://url-shortener-o037.onrender.com/api-docs

## Features

### Core Functionality
- URL shortening with custom aliases
- Redirect to original URLs with 301/302 responses
- Rate limiting (10 requests/minute) for URL creation
- Redis caching for improved performance

### Authentication
- Google OAuth 2.0 authentication
- Session-based authentication using cookies
- Secure logout functionality

### Analytics
- Real-time click tracking with geolocation
- Device and browser detection
- Detailed statistics including:
  - Total clicks vs unique visitors
  - Click trends over time
  - Operating system breakdown
  - Device type analysis
  - Geographic distribution
- Topic-based analytics grouping

### Technical Features
- Swagger API documentation
- Docker containerization
- MongoDB for data persistence
- Redis for caching and rate limiting
- Express-validator for input validation
- Error handling middleware

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Docker (optional)
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```
MONGO_URI=mongo_url
REDIS_URL=redis_url
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Running with Docker**
```bash
docker-compose up --build
```

### Running Locally
```bash
npm run dev
```

The application will be available at `http://localhost:5000/api`

## API Endpoints

| Endpoint                  | Method | Description                    |
|-------------------------- |--------|--------------------------------|
| `/auth/google`            |  GET   | Initiate Google OAuth flow     |
| `/auth/logout`            |  POST  | Logout user                    |
| `/shorten`                |  POST  | Create short URL               |
| `/:alias`                 |  GET   | Redirect to original URL       |
| `/analytics/alias/:alias` |  GET   | Get analytics for specific URL |
| `/analytics/topic/:topic` |  GET   | Get analytics by topic         |
| `/analytics/overall`      |  GET   | Get overall user analytics     |

## Challenges & Solutions

### 1. Real-time Analytics Processing
**Challenge**: High-volume click tracking impacting database performance  
**Solution**: Implemented Redis caching with 1-hour TTL for frequent queries

### 2. Rate Limiting Abuse
**Challenge**: Preventing brute-force attacks on URL creation  
**Solution**: Integrated Express Rate Limit with Redis-backed storage

### 3. Accurate Geolocation
**Challenge**: Localhost IP addresses in development  
**Solution**: Fallback to external IP lookup service for non-public IPs

### 4. Session Management
**Challenge**: Maintaining stateless authentication  
**Solution**: Implemented secure cookie-based sessions with CSRF protection

### 5. Deployment Complexity
**Challenge**: Coordinating multiple services (Node, Redis, MongoDB)  
**Solution**: Docker containerization with compose for local/prod parity

## Deployment

The application is deployed using Github on Render.app. To deploy your own instance:

1. Create a Render account
2. Link your GitHub repository
3. Add required environment variables
4. Deploy 





