# Backend API Documentation

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   └── userController.js
├── services/            # Business logic
│   └── userService.js
├── routes/             # API routes
│   ├── index.js        # Main routes
│   ├── userRoutes.js   # User routes
│   └── healthRoutes.js # Health check routes
├── middleware/         # Custom middleware
│   ├── errorHandler.js # Global error handler
│   └── logger.js      # Request logging
├── models/            # Data models
│   └── User.js        # User model
├── config/            # Configuration files
│   └── database.js    # Database config
├── server.js          # Main server file
├── package.json       # Dependencies
└── Dockerfile         # Docker configuration
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Features

- ✅ **MVC Architecture** - Controllers, Services, Models separation
- ✅ **Error Handling** - Global error handler with proper HTTP status codes
- ✅ **Request Logging** - Detailed request/response logging
- ✅ **Data Validation** - Input validation with error messages
- ✅ **CRUD Operations** - Complete user management
- ✅ **Search Functionality** - Search users by name or email
- ✅ **Docker Support** - Containerized application
- ✅ **Environment Configuration** - Environment-based settings

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## API Examples

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### Get All Users
```bash
curl http://localhost:5000/api/users
```

### Search Users
```bash
curl "http://localhost:5000/api/users?search=john"
```

### Update User
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","email":"johnsmith@example.com"}'
```

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/1
```
