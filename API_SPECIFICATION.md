# API Specification - ResumeSection

## Base URL
- Development: `http://localhost:5000`
- Production: `https://api.resumesection.com`

## Authentication
Tous les endpoints (sauf `/` et `/register`) nécessitent un header JWT:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response (200, 201)
```json
{
  "data": {},
  "msg": "Description"
}
```

### Error Response (400, 401, 403, 422, 500)
```json
{
  "msg": "Description de l'erreur",
  "error": "Détails additionnels (si applicable)",
  "errors": {"field": ["message"]} // Pour validations
}
```

## Endpoints

### 1. Health Check
```
GET /
```

**Response:** `200 OK`
```json
{
  "msg": "ResumeSection backend running"
}
```

---

### 2. Register User
```
POST /register
```

**Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password_123",
  "role": "section"  // optional, default: "section", values: "admin", "section"
}
```

**Response:** `201 Created`
```json
{
  "msg": "user created",
  "id": 1
}
```

**Errors:**
- `400` - username/password missing
- `400` - username already exists
- `403` - User creation only allowed by admin after bootstrap

---

### 3. Login
```
POST /login
```

**Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password_123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin"
}
```

**Errors:**
- `400` - username/password missing
- `401` - invalid credentials

---

### 4. Create Report
```
POST /report
Authorization: Bearer <token>
```

**Body:**
```json
{
  "date": "2024-01-15",
  "preacher": "Jean Dupont",
  "total_attendees": 150,
  "men": 60,
  "women": 70,
  "children": 15,
  "youth": 5,
  "offering": 500.50,
  "notes": "Service notable"
}
```

**Flexible Field Names Accepted:**
- `total_attendees`: `totalFaithful`, `total_faithful`, `totalFaithfulCount`, `total`, etc.
- `men`: `menCount`, `men_count`
- `women`: `womenCount`, `women_count`
- `children`: `childrenCount`, `children_count`, `kids`
- `youth`: `youthCount`, `youth_count`
- `offering`: `offrande`, `offre`, `don`
- `preacher`: `predicateur`

**Numeric Coercion:** Strings are auto-converted to numbers
- `"150"` → `150`
- `"150,50"` → `150.5`
- `""` → `null`

**Response:** `201 Created`
```json
{
  "msg": "report created",
  "id": 42
}
```

**Errors:**
- `400` - Invalid JSON
- `401` - Token missing/invalid
- `422` - Validation failed (see errors field)

**Validation Rules:**
```python
date          # Required, format YYYY-MM-DD
preacher      # Required, string
total_attendees # Required, integer >= 0
men           # Optional, integer >= 0
women         # Optional, integer >= 0
children      # Optional, integer >= 0
youth         # Optional, integer >= 0
offering      # Optional, float >= 0
notes         # Optional, string
```

---

### 5. Get Summary
```
GET /summary?start=2024-01-01&end=2024-12-31
Authorization: Bearer <token>
```

**Headers:**
- Authorization: Bearer (admin only)

**Query Parameters:**
- `start` (optional): Filter start date (YYYY-MM-DD)
- `end` (optional): Filter end date (YYYY-MM-DD)

**Response:** `200 OK`
```json
[
  {
    "id": 42,
    "section_id": 1,
    "date": "2024-01-15",
    "preacher": "Jean Dupont",
    "total_attendees": 150,
    "men": 60,
    "women": 70,
    "children": 15,
    "youth": 5,
    "offering": 500.50,
    "notes": "Service notable",
    "submitted_by": "john_doe",
    "submitted_at": "2024-01-15T14:30:00"
  }
]
```

**Errors:**
- `401` - Token invalid/missing
- `403` - User not admin
- `400` - Invalid date format

---

### 6. Export Summary PDF
```
GET /summary/pdf?start=2024-01-01&end=2024-12-31&token=<token>
```

**Authentication:**
- Via header: `Authorization: Bearer <token>`
- OR via query param: `?token=<token>`

**Query Parameters:**
- `start` (optional): Filter start date (YYYY-MM-DD)
- `end` (optional): Filter end date (YYYY-MM-DD)
- `token` (optional): JWT token (if not in header)

**Response:** `200 OK` - PDF File
- Content-Type: `application/pdf`
- File: `summary.pdf`

**Error Responses:**
- `401` - Token invalid/missing
- `403` - User not admin
- `400` - Invalid date format

---

## Error Codes Reference

| Code | Message | Meaning |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Token missing, invalid, or expired |
| 403 | Forbidden | User lacks permissions (e.g., not admin) |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Internal server error |

---

## Authentication Flow

### 1. Register (First User - Bootstrap)
```
POST /register → 201 OK {id: 1}
```

### 2. Login
```
POST /login → 200 OK {access_token: "...", role: "admin"}
```

### 3. Use Token
```
Any endpoint with Authorization: Bearer <token>
```

### 4. Token Expiration
- Default: 8 hours
- Response: `401 {msg: "Token expiré"}`
- Solution: Re-login to get new token

---

## Rate Limiting (Future)
Currently NOT implemented. Planned for v1.1.0

---

## Pagination (Future)
Currently NOT implemented. All reports returned. Planned for v1.1.0

---

## Field Validation Examples

### Valid Report Creation
```json
{
  "date": "2024-01-15",
  "preacher": "Jean Dupont",
  "total_attendees": "150",
  "offering": "500,50"
}
```
✓ Will convert strings to numbers automatically

### Invalid Report Creation
```json
{
  "date": "15-01-2024",
  "preacher": "Jean",
  "total_attendees": -50
}
```
✗ Wrong date format, negative attendees

---

## Common Use Cases

### Create Report & Check
```bash
# Create
curl -X POST http://localhost:5000/report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Get Summary
curl -X GET http://localhost:5000/summary \
  -H "Authorization: Bearer $TOKEN"
```

### Export Weekly Report
```bash
curl -X GET "http://localhost:5000/summary/pdf?start=2024-01-01&end=2024-01-07" \
  -H "Authorization: Bearer $TOKEN" \
  -o report.pdf
```

### Export with Query Param (Browser)
```
http://localhost:5000/summary/pdf?token=YOUR_TOKEN&start=2024-01-01
```

---

## Date Format
- Always use: `YYYY-MM-DD`
- Example: `2024-12-31`
- ISO 8601 standard

---

## Version
- API Version: 1.0.0
- Last Updated: 2024-11-26
