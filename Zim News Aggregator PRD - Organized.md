# Zim Top News Aggregator - Product Requirements Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Vision & Strategy](#product-vision--strategy)
3. [Technical Architecture](#technical-architecture)
4. [Core Features & User Stories](#core-features--user-stories)
5. [Advanced Algorithms](#advanced-algorithms)
6. [Content & Sources](#content--sources)
7. [Business Model](#business-model)
8. [Performance Requirements](#performance-requirements)
9. [Implementation Roadmap](#implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Product Overview
The **Zim Top News Aggregator** is a comprehensive digital platform designed to consolidate, rank, and analyze news content from across Zimbabwe's media landscape. The system consists of:

- **Backend**: Scalable microservices architecture with automated web scraping, content processing, and API services
- **Frontend**: Modern, responsive web application with dynamic feeds and user engagement features
- **Admin Panel**: Content management interface for scraper configuration and monitoring

### 1.2 Core Value Proposition
- **Centralized Access**: Single source for all Zimbabwean news across the political spectrum
- **Intelligent Ranking**: Proprietary algorithms for trending content and journalist credibility
- **Media Literacy**: Transparent source attribution and bias indicators
- **Real-time Engagement**: Community-driven content curation through voting and sharing

### 1.3 Target Audience
- **Primary**: Zimbabweans (domestic and diaspora) seeking comprehensive news coverage
- **Secondary**: International stakeholders (journalists, researchers, NGOs, diplomats, investors)

---

## 2. Product Vision & Strategy

### 2.1 Market Opportunity
Zimbabwe's fragmented media landscape includes:
- **State Media**: The Herald, The Chronicle, Sunday Mail
- **Independent Press**: NewsDay, Daily News, The Standard
- **Diaspora Publications**: New Zimbabwe, Nehanda Radio, ZimEye

**Challenge**: Users must navigate multiple sources to get complete coverage
**Solution**: Intelligent aggregation with bias transparency and quality scoring

### 2.2 Competitive Advantage
- **Local Context**: Deep understanding of Zimbabwean media landscape
- **Source Classification**: State vs Independent vs Diaspora categorization
- **Journalist Trust Scores**: Multi-factor credibility assessment
- **Trending Algorithm**: Time-decay + engagement weighting

---

## 3. Technical Architecture

### 3.1 Microservices Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │────│   API Gateway    │────│  Load Balancer  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │ User Service │ │Feed Service │ │Article Svc│
        └──────────────┘ └─────────────┘ └───────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │Auth & Profile│ │Ranking Svc  │ │Ingestion  │
        └──────────────┘ └─────────────┘ └───────────┘
```

### 3.2 Core Services

#### API Gateway
- **Technology**: Kong/AWS API Gateway
- **Functions**: Request routing, authentication, rate limiting, response aggregation

#### User Service
- **Technology**: Node.js/Express or Python/FastAPI
- **Functions**: Registration, authentication, profile management, preferences

#### Ingestion Service
- **Technology**: Python with Scrapy/BeautifulSoup
- **Functions**: Web scraping, RSS parsing, API integration, content normalization

#### Article Service
- **Technology**: Node.js/Express with PostgreSQL
- **Functions**: CRUD operations, deduplication, content storage

#### Ranking & Analytics Service
- **Technology**: Python with NumPy/Pandas
- **Functions**: Trending score calculation, trust score computation, analytics

#### Feed Service
- **Technology**: Node.js/Express with Redis caching
- **Functions**: Feed generation, personalization, caching

### 3.3 Data Architecture

#### Primary Database (PostgreSQL)
```sql
-- Core Tables
users (user_id, username, email, password_hash, created_at)
sources (source_id, name, base_url, logo_url, affiliation, credibility_score)
journalists (journalist_id, full_name, source_id, profile_image_url, trust_score)
categories (category_id, name)
articles (article_id, headline, url, snippet, image_url, source_id, journalist_id, category_id, published_at, trending_score)
votes (vote_id, user_id, article_id, vote_type, created_at)
shares (share_id, user_id, article_id, platform, created_at)
```

#### Search Engine (Elasticsearch)
- Full-text search index for articles
- Real-time updates via message queue
- Faceted search by source, category, date

#### Message Queue (RabbitMQ/Apache Kafka)
- Asynchronous processing pipeline
- Event-driven architecture
- Scalable content processing

---

## 4. Core Features & User Stories

### 4.1 User Authentication
**Story**: *"As a new user, I want to create an account easily so I can vote on articles and personalize my experience."*

**Features**:
- Email/password registration with validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- User profile management

### 4.2 News Feed Experience
**Story**: *"As a reader, I want to see trending news in an engaging, scrollable feed."*

**Features**:
- Card-based layout with images and metadata
- Infinite scroll with lazy loading
- Real-time engagement counters
- Source attribution with logos
- Responsive design for all devices

### 4.3 Content Discovery
**Story**: *"As a user interested in specific topics, I want to filter by category and search for specific terms."*

**Features**:
- Category-based navigation (Politics, Business, Sports, etc.)
- Full-text search with highlighting
- Advanced filters (source affiliation, date range)
- Saved searches and alerts (Pro feature)

### 4.4 User Engagement
**Story**: *"As an engaged reader, I want to vote on articles and share them with my network."*

**Features**:
- Like/Upvote system with one vote per user per article
- Social sharing (Facebook, Twitter, WhatsApp, Copy Link)
- Engagement analytics and leaderboards
- Comment system (future enhancement)

---

## 5. Advanced Algorithms

### 5.1 Trending Score Algorithm

**Formula**:
```
TrendingScore = (w_up × Upvotes + w_like × Likes + w_share × Shares - Downvotes) / (TimeSincePublicationInHours + 2)^G
```

**Parameters**:
- `w_up = 2` (upvote weight)
- `w_like = 1` (like weight)  
- `w_share = 3` (share weight)
- `G = 1.8` (gravity/decay factor)

**Update Frequency**: Every 15 minutes or real-time on engagement events

### 5.2 Journalist Trust Score

**Formula**:
```
TrustScore = (w_A × UserEngagementScore) + (w_B × SourceCredibilityScore) + (w_C × BestPracticesScore)
```

**Components**:
- **User Engagement (40%)**: Normalized average upvotes per article
- **Source Credibility (40%)**: Average credibility of associated publications
- **Best Practices (20%)**: Citation frequency, correction policy, originality

**Update Frequency**: Daily batch calculation

---

## 6. Content & Sources

### 6.1 Initial Source List

#### High Priority Sources
| Source | URL | Type | Affiliation |
|--------|-----|------|-------------|
| The Herald | herald.co.zw | Print/Digital | State |
| NewsDay | newsday.co.zw | Print/Digital | Independent |
| Daily News | dailynews.co.zw | Print/Digital | Independent |
| The Chronicle | chronicle.co.zw | Print/Digital | State |
| New Zimbabwe | newzimbabwe.com | Digital | Diaspora |
| The Standard | thestandard.co.zw | Print/Digital | Independent |

#### Medium Priority Sources
| Source | URL | Type | Affiliation |
|--------|-----|------|-------------|
| ZimEye | zimeye.net | Digital | Diaspora |
| Bulawayo24 | bulawayo24.com | Digital | Independent |
| iHarare | iharare.com | Digital | Independent |
| Nehanda Radio | nehandaradio.com | Digital | Diaspora |

### 6.2 Content Categories
- Politics & Government
- Business & Economy
- Sports
- Technology
- Health & Society
- Entertainment
- International News

---

## 7. Business Model

### 7.1 Monetization Phases

#### Phase 1: Advertising (0-6 months)
- Programmatic advertising via Google AdSense
- Native ads integrated into feed
- Focus on user growth and engagement

#### Phase 2: Freemium (6+ months)
**Free Tier**:
- Full news access with ads
- Basic engagement features
- Standard search

**Pro Tier ($4.99/month)**:
- Ad-free experience
- Advanced filtering by source affiliation
- Personalized alerts and notifications
- Unlimited saved articles
- Historical trend analytics

#### Phase 3: Data Services (12+ months)
- API access for researchers and institutions
- Custom news monitoring dashboards
- Historical data exports
- White-label solutions

### 7.2 Key Performance Indicators

| Category | Metric | Year 1 Goal | Measurement |
|----------|--------|-------------|-------------|
| **Engagement** | Monthly Active Users | 10,000 | Google Analytics |
| | Average Session Duration | >3 minutes | Google Analytics |
| | Engagement Rate | 15% QoQ growth | Internal DB |
| **Performance** | Page Load Speed (LCP) | <2.5 seconds | PageSpeed Insights |
| | API Response Time (p95) | <200ms | Prometheus |
| **Business** | Pro Conversion Rate | 1% | Payment Gateway |
| | Monthly Recurring Revenue | $500 | Financial Tracking |

---

## 8. Performance Requirements

### 8.1 Performance Standards
- **Page Load Time**: <2.5 seconds (LCP)
- **API Latency**: <200ms (95th percentile)
- **Interaction Response**: <100ms (button clicks)

### 8.2 Scalability Targets
- **Concurrent Users**: 10,000 initial, 100,000+ future
- **Article Volume**: 10,000 articles/day processing capacity
- **Database**: Horizontal scaling with read replicas

### 8.3 Availability Requirements
- **User-facing Services**: 99.9% uptime
- **Background Processing**: 99.5% uptime
- **Graceful Degradation**: Fallback to simple chronological feeds

### 8.4 Security Standards
- **Data Encryption**: TLS 1.3 for transmission, AES-256 at rest
- **Authentication**: JWT with refresh tokens
- **Input Validation**: Server-side sanitization for all inputs
- **OWASP Compliance**: Protection against top 10 vulnerabilities

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Core microservices architecture setup
- Basic user authentication and management
- Initial scraper development for top 5 sources
- Simple article storage and API

### Phase 2: Core Features (Months 4-6)
- Frontend web application development
- Trending algorithm implementation
- User engagement features (voting, sharing)
- Category and search functionality

### Phase 3: Advanced Features (Months 7-9)
- Journalist trust score system
- Advanced filtering and personalization
- Mobile optimization
- Performance optimization

### Phase 4: Monetization (Months 10-12)
- Advertising integration
- Pro tier features development
- Analytics dashboard
- Business intelligence tools

### Phase 5: Scale & Expand (Year 2+)
- Advanced AI/ML features
- Mobile applications
- API monetization
- Regional expansion

---

## Appendices

### A. Technology Stack Recommendations
- **Frontend**: React.js with Next.js, Tailwind CSS
- **Backend**: Node.js/Express, Python/FastAPI
- **Database**: PostgreSQL, Redis, Elasticsearch
- **Infrastructure**: AWS/GCP, Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana, Sentry

### B. Third-Party Integrations
- **Authentication**: Auth0 or AWS Cognito
- **Payments**: Stripe or PayPal
- **Email**: SendGrid or AWS SES
- **Analytics**: Google Analytics, Mixpanel
- **Error Tracking**: Sentry or Rollbar

### C. Compliance Considerations
- **Data Protection**: GDPR-like privacy practices
- **Accessibility**: WCAG 2.1 AA compliance
- **Content Policy**: Clear editorial guidelines
- **Copyright**: Fair use and attribution policies 