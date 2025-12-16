#!/usr/bin/env node

/**
 * Firebase Configuration Checker that loads .env file
 */

const fs = require('fs');
const path = require('path');

// Load .env file manually
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#') && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return envVars;
}

// Firebase environment variables that need to be set
const requiredFirebaseVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

const backendFirebaseVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

// Check if environment variables are set
function checkEnvVars(vars, envVars, prefix = '') {
  console.log(`\n🔍 Checking ${prefix} Firebase environment variables:`);
  
  const results = vars.map(varName => {
    const value = envVars[varName];
    const isSet = value && value !== '' && value !== 'undefined';
    const isTemplate = value && (
      value.includes('${{') || 
      value.includes('${environment') ||
      value.includes('REPLACE_WITH_') ||
      value.includes('XXX') ||
      value.includes('placeholder') ||
      value.includes('G-XXXXXXXXXX')
    );
    
    return {
      name: varName,
      value: isSet ? (isTemplate ? 'TEMPLATE' : 'SET') : 'MISSING',
      isSet,
      isTemplate,
      preview: isSet && !isTemplate ? value.substring(0, 20) + '...' : 'N/A'
    };
  });
  
  results.forEach(result => {
    const status = result.isTemplate ? '⚠️' : (result.isSet ? '✅' : '❌');
    console.log(`  ${status} ${result.name}: ${result.value}`);
    if (result.isTemplate) {
      console.log(`    ⚠️ Contains template/placeholder: ${result.preview}`);
    }
  });
  
  const setCount = results.filter(r => r.isSet && !r.isTemplate).length;
  const templateCount = results.filter(r => r.isTemplate).length;
  
  console.log(`\n📊 Summary: ${setCount}/${vars.length} properly set, ${templateCount} contain templates`);
  
  return { setCount, templateCount, total: vars.length, results };
}

// Main check function
function runChecks() {
  console.log('🔥 Firebase Configuration Checker for BlytzWork');
  console.log('='.repeat(50));
  
  // Load .env file
  const envVars = loadEnvFile();
  console.log(`📁 Loaded .env file with ${Object.keys(envVars).length} variables`);
  
  // Check environment variables
  const frontendCheck = checkEnvVars(requiredFirebaseVars, envVars, 'Frontend');
  const backendCheck = checkEnvVars(backendFirebaseVars, envVars, 'Backend');
  
  // Overall assessment
  console.log('\n🎯 Overall Assessment:');
  
  const frontendEssential = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
  const frontendEssentialSet = frontendEssential.filter(varName => {
    const result = frontendCheck.results.find(r => r.name === varName);
    return result && result.isSet && !result.isTemplate;
  }).length;
  
  if (frontendEssentialSet === 3) {
    console.log('✅ Frontend Firebase: Essential variables are properly set');
  } else {
    console.log(`❌ Frontend Firebase: Only ${frontendEssentialSet}/3 essential variables set`);
    console.log('   Authentication will NOT work without these variables');
  }
  
  if (backendCheck.setCount >= 2) {
    console.log('✅ Backend Firebase: Variables are properly set');
  } else {
    console.log(`❌ Backend Firebase: Only ${backendCheck.setCount}/${backendCheck.total} variables set`);
  }
  
  // Generate Dokploy environment variables list
  console.log('\n📋 For Dokploy Environment Variables:');
  console.log('Copy these values to your Dokploy application settings:');
  console.log('');
  
  requiredFirebaseVars.forEach(varName => {
    const value = envVars[varName];
    if (value && !value.includes('REPLACE_WITH_') && !value.includes('G-XXXXXXXXXX')) {
      console.log(`${varName}=${value}`);
    } else {
      console.log(`# ${varName}=NEEDS_ACTUAL_VALUE`);
    }
  });
  
  backendFirebaseVars.forEach(varName => {
    const value = envVars[varName];
    if (value && !value.includes('REPLACE_WITH_')) {
      console.log(`${varName}=${value}`);
    } else {
      console.log(`# ${varName}=NEEDS_ACTUAL_VALUE`);
    }
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (frontendCheck.templateCount > 0) {
    console.log('⚠️ Replace template variables with actual Firebase values in Dokploy');
  }
  
  if (frontendEssentialSet < 3) {
    console.log('⚠️ Set the 3 essential Firebase variables in Dokploy:');
    console.log('   - NEXT_PUBLIC_FIREBASE_API_KEY');
    console.log('   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.log('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  
  console.log('\n📋 To fix in Dokploy:');
  console.log('1. Go to your application settings');
  console.log('2. Add/Update Environment Variables section');
  console.log('3. Set all Firebase variables with actual values (not templates)');
  console.log('4. Redeploy the application');
  
  // Exit with appropriate code
  const isHealthy = frontendEssentialSet === 3 && backendCheck.setCount >= 2;
  process.exit(isHealthy ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runChecks();
}

module.exports = { runChecks };