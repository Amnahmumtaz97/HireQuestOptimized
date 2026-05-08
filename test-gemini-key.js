/**
 * Test script to verify Gemini API key is working
 * Run with: node test-gemini-key.js
 */

const fs = require('fs');
const path = require('path');

async function testGeminiKey() {
  console.log('🔍 Testing Gemini API Key...\n');

  // Read .env file directly
  const envPath = path.join(__dirname, '.env');
  let apiKey = '';
  let modelName = 'gemini-2.0-flash';

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('GEMINI_API_KEY=')) {
        apiKey = line.split('=')[1].trim();
      }
      if (line.startsWith('GEMINI_MODEL=')) {
        modelName = line.split('=')[1].trim();
      }
    });
  } catch (e) {
    console.error('❌ ERROR: Could not read .env file');
    process.exit(1);
  }

  console.log(`📝 API Key: ${apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}` : 'NOT SET'}`);
  console.log(`🤖 Model: ${modelName}\n`);

  if (!apiKey || !apiKey.trim()) {
    console.error('❌ ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
  }

  try {
    // Import Gemini SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Simple test prompt
    const testPrompt = 'Say "Gemini API is working!" in one sentence.';
    
    console.log('📤 Sending test request to Gemini...\n');
    const result = await model.generateContent(testPrompt);
    const response = result.response.text();

    console.log('✅ SUCCESS! Gemini API Key is working!\n');
    console.log('📨 Response from Gemini:');
    console.log(`   "${response}"\n`);
    
    console.log('✨ Your Gemini API configuration is valid and ready to use!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR: Gemini API Key test failed!\n');
    console.error('Error Details:');
    
    const errorMsg = error.message || error.toString();
    console.error(`  Message: ${errorMsg}\n`);

    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('unauthorized')) {
      console.error('💡 Tip: Your API key appears to be invalid or expired.');
      console.error('   Visit: https://aistudio.google.com/app/apikey\n');
    } else if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
      console.error('💡 Tip: Your API quota has been exceeded.');
      console.error('   Check your usage at: https://console.cloud.google.com\n');
    } else if (errorMsg.includes('PERMISSION_DENIED')) {
      console.error('💡 Tip: API key does not have permission to use Gemini.');
      console.error('   Verify permissions in Google Cloud Console.\n');
    } else if (errorMsg.includes('Cannot find module')) {
      console.error('💡 Tip: @google/generative-ai package is not installed.');
      console.error('   Run: npm install @google/generative-ai\n');
    }

    console.error('Full error:', error);
    process.exit(1);
  }
}

testGeminiKey();
