# NODEJS_AND_REACTJS - User Management System

A full-stack user management system with authentication, role-based access control, and password management.

## 🚀 Quick Start

### Option 1: One-Command Start (Recommended)
```bash
./start.sh
```

### Option 2: Manual Docker Compose
```bash
docker-compose up -d --build
```

## 🌐 Application URLs

- **Frontend**: http://localhost:2222
- **Backend API**: http://localhost:1111/api
- **MongoDB**: localhost:20711

## 🔐 Default Login Credentials

- **Admin**: `admin@example.com` / `password`
- **User**: `user@example.com` / `password`

## 📋 Features

### 🔑 Authentication System
- Login/Logout with JWT tokens
- Role-based access control
- Protected routes
- Password hashing with bcrypt

### 👥 User Management
- Create, Read, Update, Delete users
- Assign roles to users
- Reset passwords to default (123456)
- Search and filter users

### 🎭 Role Management
- Create and manage roles
- Permission-based access control
- Role assignment to users

### 🎨 User Interface
- **Admin Dashboard**: Full user and role management
- **User Dashboard**: Basic user interface
- Responsive design
- Modern UI components

## 🛠️ Development

### Backend (Node.js + Express)
```bash
cd backend
npm install
npm run dev  # With nodemon
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

### Database (MongoDB)
```bash
# Using Docker
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

## 📁 Project Structure

```
├── backend/
│   ├── controllers/     # API controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   └── scripts/        # Database scripts
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom hooks
│   │   └── services/    # API services
│   └── public/         # Static files
└── docker-compose.yml  # Docker configuration
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset password

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build --force-recreate
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Input validation
- Role-based access control

## 🎯 User Roles

### Admin Role
- Full access to user management
- Full access to role management
- Can reset user passwords
- Access to admin dashboard

### User Role
- Limited access to user information
- Access to user dashboard
- Cannot manage other users

## 📝 Environment Variables

Create `.env` file in backend directory:
```env
NODE_ENV=production
PORT=1111
MONGODB_URI=mongodb://admin:password123@mongodb:27017/user_management?authSource=admin
JWT_SECRET=your-secret-key
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port
   sudo lsof -ti:1111 | xargs kill -9
   sudo lsof -ti:2222 | xargs kill -9
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB container
   docker-compose logs mongodb
   ```

3. **Frontend not loading**
   ```bash
   # Check frontend container
   docker-compose logs frontend
   ```

## 📊 Monitoring

- Health check: http://localhost:1111/api/health
- View container status: `docker-compose ps`
- View logs: `docker-compose logs -f [service-name]`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.# VIBE-CODING
