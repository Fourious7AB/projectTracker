const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AEO Tracker Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://arupbera800_db_user:121@cluster0.9grwmqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key_here_change_in_production_${Date.now()}
JWT_EXPIRE=7d`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🎉 Backend setup complete!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Run: node scripts/seedData.js (to populate with test data)');
