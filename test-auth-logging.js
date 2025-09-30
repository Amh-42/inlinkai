// Simple test script to verify auth logging works
const { authLogger } = require('./lib/auth-logger.ts');

console.log('🧪 Testing Auth Logging System...\n');

// Test different log levels and categories
authLogger.info('CONFIG', 'Test configuration log', { testKey: 'testValue' });
authLogger.warn('DATABASE', 'Test warning log', { warning: 'This is a test warning' });
authLogger.error('SOCIAL', 'Test error log', new Error('Test error'), { provider: 'linkedin' });
authLogger.debug('AUTH', 'Test debug log', { debugInfo: 'Detailed debug information' });

// Test specific auth event loggers
authLogger.socialSignInAttempt('linkedin', '/api/auth/sign-in/social', 'Mozilla/5.0 Test Browser', '127.0.0.1');
authLogger.socialSignInSuccess('linkedin', 'test-user-123', 'test@example.com', '/api/auth/sign-in/social');
authLogger.socialSignInError('linkedin', new Error('Test social sign-in error'), '/api/auth/sign-in/social');

authLogger.databaseConnection(true);
authLogger.configValidation('TEST_CONFIG', true, 'test-value');
authLogger.sessionEvent('login', 'test-user-123', { sessionId: 'test-session' });

console.log('✅ Test logs written to logs/auth.log');
console.log('\n📋 Recent logs:');
console.log('================');
console.log(authLogger.getRecentLogs(20));
