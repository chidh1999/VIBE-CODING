const User = require('../models/User');
const Role = require('../models/Role');

const initData = async () => {
  try {
    console.log('🔄 Initializing default data...');

    // Check if admin role exists
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('📝 Creating admin role...');
      adminRole = new Role({
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          'read_users',
          'write_users', 
          'delete_users',
          'read_roles',
          'write_roles',
          'delete_roles',
          'admin_access'
        ],
        isActive: true
      });
      await adminRole.save();
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role already exists');
    }

    // Check if user role exists
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      console.log('📝 Creating user role...');
      userRole = new Role({
        name: 'user',
        description: 'Regular user with limited access',
        permissions: ['read_users'],
        isActive: true
      });
      await userRole.save();
      console.log('✅ User role created');
    } else {
      console.log('✅ User role already exists');
    }

    // Check if admin user exists
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('📝 Creating admin user...');
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password',
        role: adminRole._id
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Check if regular user exists
    let regularUser = await User.findOne({ email: 'user@example.com' });
    if (!regularUser) {
      console.log('📝 Creating regular user...');
      regularUser = new User({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password',
        role: userRole._id
      });
      await regularUser.save();
      console.log('✅ Regular user created');
    } else {
      console.log('✅ Regular user already exists');
    }

    console.log('🎉 Data initialization completed!');
    console.log('\n📋 Default credentials:');
    console.log('Admin: admin@example.com / password');
    console.log('User: user@example.com / password');
    
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    throw error;
  }
};

module.exports = initData;
