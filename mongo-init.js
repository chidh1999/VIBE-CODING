// MongoDB initialization script
db = db.getSiblingDB('user_management');

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'user_management'
    }
  ]
});

// Create initial collections
db.createCollection('users');

// Insert some sample data
db.users.insertMany([
  {
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
]);

print('✅ MongoDB initialization completed');
print('📊 Database: user_management');
print('👥 Sample users inserted');
