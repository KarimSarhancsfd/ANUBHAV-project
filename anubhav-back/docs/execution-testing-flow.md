# ANUBHAV Gaming Studio - Backend Execution & Testing Guide

## Prerequisites
- Node.js v18+
- MySQL database
- Environment variables configured (.env)

## Environment Variables Required
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=anubhav_gaming
NODE_ENV=development
BCRYPT_ROUNDS=10
DEEPSEEK_API_KEY=your_api_key
```

## Execution Flow

### 1. Database Setup
```bash
# Ensure MySQL is running
# Create database if not exists
CREATE DATABASE anubhav_gaming;
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run start:dev
```

### 4. Access API Documentation
- Swagger UI: http://localhost:3000/api
- Health Check: http://localhost:3000/

## Testing Flow

### Automated Tests
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

### Manual API Testing (Postman)

#### Step 1: Register a User
```http
POST {{baseUrl}}/user/auth/register
Content-Type: application/json

{
  "email": "player@gaming.com",
  "password": "securePass123",
  "name": "Test Player",
  "country_id": 1
}
```

#### Step 2: Login (Get JWT Token)
```http
POST {{baseUrl}}/user/auth/login
Content-Type: application/json

{
  "email": "player@gaming.com",
  "password": "securePass123"
}
```
**Save the access_token for subsequent requests**

#### Step 3: Test Protected Endpoints
Use the token in Authorization header:
```
Authorization: Bearer {{accessToken}}
```

### Testing Order (Recommended)
1. **Auth** → Register, Login
2. **Economy** → Check wallet, view products
3. **Player Progress** → View dashboard
4. **Challenge Units** → Create/answer challenges
5. **Match Sessions** → Create/submit sessions
6. **Live Ops** → View events, trigger events
7. **Groups** → Create/manage groups
8. **Notifications** → Send/view notifications

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Response Format
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { }
}
```
