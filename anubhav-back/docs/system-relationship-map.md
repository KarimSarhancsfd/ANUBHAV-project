# ANUBHAV Gaming Studio - System Architecture & Relationship Map

## Architecture Diagram (Textual)

```
                                    ┌─────────────────────────────────────────────┐
                                    │           Frontend Client                  │
                                    │    (Web/Mobile Application)                │
                                    └─────────────────┬───────────────────────────┘
                                                      │ HTTP/WebSocket
                                    ┌─────────────────▼───────────────────────────┐
                                    │         NestJS Application                 │
                                    │  (main.ts - Bootstrap & Configuration)      │
                                    └─────────────────┬───────────────────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    │                                 │                                 │
        ┌───────────▼──────────┐          ┌──────────▼──────────┐        ┌───────────▼──────────┐
        │    Auth Module       │          │   Common Module     │        │   User Module        │
        │  (JWT, OAuth)        │◄────────►│  (Filters, Cache)  │◄──────►│   (User CRUD)        │
        └─────────────────────┘          └─────────────────────┘        └─────────────────────┘
                    │
        ┌───────────▼──────────┐          ┌─────────────────────┐        ┌─────────────────────┐
        │   Economy Module     │          │   Live-Ops Module   │        │   Groups Module     │
        │ (Wallet, Purchase,  │◄────────►│ )   │        │ (Events, Config   (Team/Clan)       │
        │  Inventory)         │          └─────────────────────┘        └─────────────────────┘
        └─────────────────────┘
                    │
        ┌───────────▼──────────┐          ┌─────────────────────┐        ┌─────────────────────┐
        │ Player-Progress      │          │ Challenge-Units     │        │  Match-Sessions     │
        │ (XP, Level, Stats)   │          │ (Quizzes, Questions)│        │  (Game Sessions)    │
        └─────────────────────┘          └─────────────────────┘        └─────────────────────┘
                    │
        ┌───────────▼──────────┐          ┌─────────────────────┐        ┌─────────────────────┐
        │  Notifications       │          │   AI Module         │        │  User-Activities   │
        │  (Push, In-App)     │          │  (DeepSeek API)     │        │  (Tracking)         │
        └─────────────────────┘          └─────────────────────┘        └─────────────────────┘
                    │
        ┌───────────▼──────────┐          ┌─────────────────────┐        ┌─────────────────────┐
        │  Category           │          │   Country           │        │  Terms              │
        │  (Content Types)    │          │  (Geo-Location)     │        │  (Policies)         │
        └─────────────────────┘          └─────────────────────┘        └─────────────────────┘
                    │
        ┌───────────▼──────────┐          ┌─────────────────────┐
        │  Chat Gateway        │          │  User-Group-Chat    │
        │  (WebSocket)          │          │  (Group Messaging)  │
        └─────────────────────┘          └─────────────────────┘
                    │
                    └──────────────────────┬──────────────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   MySQL Database       │
                              │   (TypeORM Entities)   │
                              └─────────────────────────┘
```

## Module Dependencies

### Core Dependencies
- **Auth Module** → User Module (user lookup, token management)
- **Economy Module** → Chat Gateway (wallet updates via WebSocket)
- **Player Progress** → Economy Module (XP rewards → currency)
- **Match Sessions** → Challenge Units (linked quiz sessions)

### Data Flow

#### 1. Authentication Flow
```
User → Register/Login → UserService → AuthService → JWT Token
                                                    ↓
                                    Token stored in User entity
```

#### 2. Economy Flow
```
Purchase → PurchaseService → EconomyService (addCurrency)
                                    ↓
                    Wallet Update (Coins/Gems)
                                    ↓
                    Transaction Record
                                    ↓
                    WebSocket Emit (ChatGateway)
```

#### 3. Player Progression Flow
```
Complete Challenge → ChallengeService → PlayerProgressService
        ↓
    XP Awarded
        ↓
    Level Check → Level Up?
        ↓
    Gems Reward → EconomyService.addCurrency()
```

#### 4. Live Ops Flow
```
Admin Trigger → LiveOpsService → Event Dispatch
        ↓
    Check Conditions → Rewards Distribution
        ↓
    Player Notifications
```

## Error Handling Flow

```
Request → Controller → Service → Entity
                    ↓
            Error Occurs?
                    ↓
            AllExceptionsFilter
                    ↓
            Standardized Error Response
                    ↓
            Client Receives { statusCode, message }
```

## Security Layers

1. **Route Guards** - JWT validation (`JwtAuthGuard`)
2. **Role Guards** - Authorization (`RolesGuard`)
3. **ValidationPipe** - DTO validation
4. **Helmet** - HTTP security headers
5. **CORS** - Cross-origin request control
6. **Password Hashing** - bcrypt

## Database Entities Relationship

```
User (1) ──────► Wallet (1)
User (1) ──────► PlayerProgress (1)
User (1) ──────► Transaction (Many)
User (1) ──────► Group (Many)
User (1) ──────► Notification (Many)
User (1) ──────► UserActivity (Many)
User (1) ──────► MatchSession (Many)
ChallengeUnit (1) ──► Question (Many)
```

## WebSocket Events

- **wallet:update** - Real-time wallet balance changes
- **notification:new** - New notification received
- **match:update** - Match status changes
- **chat:message** - New chat messages
