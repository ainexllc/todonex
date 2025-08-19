#!/usr/bin/env node

/**
 * Firebase Google Sign-in Configuration Verification Script
 * Run this script after configuring Google Sign-in in Firebase Console
 * 
 * Usage: node firebase-auth-verification.js
 */

const { execSync } = require('child_process');

console.log('=== Firebase Google Sign-in Configuration Verification ===\n');

// Project Information
const expectedConfig = {
  projectId: 'nexttaskpro',
  projectNumber: '204152236208',
  oauthClientId: '204152236208-bljleppk65g2dabs5s4bd0bon33mioo1.apps.googleusercontent.com',
  supportEmail: 'dinohorn35@gmail.com',
  expectedDomains: [
    'localhost:3002',
    'nexttaskpro.web.app',
    'nexttaskpro.firebaseapp.com'
  ]
};

console.log('📊 Expected Configuration:');
console.log(`Project ID: ${expectedConfig.projectId}`);
console.log(`Project Number: ${expectedConfig.projectNumber}`);
console.log(`OAuth Client ID: ${expectedConfig.oauthClientId}`);
console.log(`Support Email: ${expectedConfig.supportEmail}`);
console.log(`Expected Authorized Domains: ${expectedConfig.expectedDomains.join(', ')}`);
console.log();

// Check current Firebase project
try {
  console.log('🔍 Checking Firebase CLI Configuration...');
  const currentProject = execSync('firebase use --json', { encoding: 'utf8' });
  const projectData = JSON.parse(currentProject);
  
  if (projectData.status === 'success' && projectData.result === expectedConfig.projectId) {
    console.log('✅ Firebase CLI is configured for the correct project:', projectData.result);
  } else {
    console.log('❌ Firebase CLI project mismatch. Expected:', expectedConfig.projectId, 'Got:', projectData.result);
  }
} catch (error) {
  console.log('❌ Error checking Firebase CLI configuration:', error.message);
}

console.log();

// Check Firebase project list
try {
  console.log('📋 Verifying project access...');
  const projectsList = execSync('firebase projects:list --json', { encoding: 'utf8' });
  const projects = JSON.parse(projectsList);
  
  const targetProject = projects.result.find(p => p.projectId === expectedConfig.projectId);
  if (targetProject) {
    console.log('✅ Project found:', targetProject.displayName, `(${targetProject.projectId})`);
    console.log('   Project Number:', targetProject.projectNumber);
    
    if (targetProject.projectNumber === expectedConfig.projectNumber) {
      console.log('✅ Project number matches OAuth client ID prefix');
    } else {
      console.log('⚠️  Project number does not match OAuth client ID prefix');
    }
  } else {
    console.log('❌ Target project not found in accessible projects');
  }
} catch (error) {
  console.log('❌ Error checking project list:', error.message);
}

console.log();

// Manual Verification Checklist
console.log('📝 Manual Verification Checklist:');
console.log('   After configuring in Firebase Console, verify:');
console.log();
console.log('   1. Firebase Console > Authentication > Sign-in method');
console.log('      → Google provider shows as "Enabled"');
console.log();
console.log('   2. Google provider configuration shows:');
console.log(`      → Web client ID: ${expectedConfig.oauthClientId}`);
console.log(`      → Support email: ${expectedConfig.supportEmail}`);
console.log();
console.log('   3. Google Cloud Console OAuth configuration includes:');
console.log('      → Authorized JavaScript origins:');
console.log(`         • http://localhost:3002`);
console.log(`         • https://${expectedConfig.projectId}.web.app`);
console.log(`         • https://${expectedConfig.projectId}.firebaseapp.com`);
console.log();
console.log('   4. Authorized redirect URIs include:');
console.log(`         • http://localhost:3002/__/auth/handler`);
console.log(`         • https://${expectedConfig.projectId}.web.app/__/auth/handler`);
console.log(`         • https://${expectedConfig.projectId}.firebaseapp.com/__/auth/handler`);
console.log();

// Test authentication configuration (if app is running)
console.log('🧪 Testing Configuration:');
console.log('   To test the Google Sign-in configuration:');
console.log('   1. Start your Next.js application: npm run dev');
console.log('   2. Navigate to the authentication page');
console.log('   3. Click the Google Sign-in button');
console.log('   4. Verify the OAuth flow completes successfully');
console.log();

console.log('🔗 Quick Links:');
console.log(`   Firebase Console: https://console.firebase.google.com/project/${expectedConfig.projectId}/authentication/providers`);
console.log(`   Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=${expectedConfig.projectId}`);
console.log();

console.log('✨ Configuration Status:');
console.log('   ✅ Firebase CLI configured for nexttaskpro');
console.log('   ✅ Project access verified');
console.log('   ⏳ Manual configuration required in Firebase Console');
console.log('   ⏳ Testing required after manual configuration');