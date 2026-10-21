# Auth Testing

## Admin (JWT email/password)
- Email: admin@esforconotavel.pt
- Password: Admin@2026

## Endpoints
- POST /api/auth/login {email,password} -> {user, token}, sets httpOnly access_token cookie
- GET /api/auth/me (cookie or Bearer token)
- POST /api/auth/logout
- POST /api/auth/google/session {session_id}
- Properties: POST/PUT/DELETE /api/properties (auth required), GET public
- POST /api/upload (auth, multipart file)

## Quick test
curl -c c.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@esforconotavel.pt","password":"Admin@2026"}'
curl -b c.txt http://localhost:8001/api/auth/me

## Google Auth
Emergent-managed. Backend exchanges session_id via demobackend.emergentagent.com. Google users auto-created with role=admin.
