// Test MongoDB connection with detailed diagnostics
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env manually for testing
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  // Extract and display parts of the URI (safely)
  const match = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
  if (match) {
    const [, username, password] = match;
    console.log('📋 Connection Details:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password.substring(0, 3)}${'*'.repeat(password.length - 6)}${password.substring(password.length - 3)}`);
    console.log(`  Full URI: ${uri}\n`);
  }

  const client = new MongoClient(uri, { 
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000 
  });

  try {
    console.log('🔌 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    console.log('✅ Ping successful:', result);
    
    // List databases
    const databases = await client.db('admin').admin().listDatabases();
    console.log(`✅ Found ${databases.databases.length} database(s)`);
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔍 Auth Error - likely causes:');
      console.error('  1. Wrong password for user "iamnah97_db_user"');
      console.error('  2. User does not exist in MongoDB Atlas');
      console.error('  3. Special characters in password not URL-encoded');
      console.error('\n💡 Fix: Go to MongoDB Atlas > Database Access > iamnah97_db_user');
      console.error('   and verify the password or reset it');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n🔍 Network Error - DNS lookup failed');
      console.error('  Check if the cluster name is correct');
    }
    
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
