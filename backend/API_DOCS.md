# Totoz Wellness API Documentation

## Base URL
`http://localhost:5000`

## Authentication Endpoints

### Register User
- **URL:** `POST /auth/register`
- **Body:**
```json
{
  "name": "string",
  "age": "number",
  "email": "string",
  "password": "string", 
  "gender": "string"
}