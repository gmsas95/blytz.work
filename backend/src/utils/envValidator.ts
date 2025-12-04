/**
 * Enhanced environment variable access for Dokploy deployment
 * Tries multiple sources for env vars
 */

export function getEnvVar(key: string, defaultValue?: string): string {
  // Try multiple sources for environment variables
  const sources = [
    process.env[key],                           // Standard env
    process.env[`DOKPLOY_${key}`],              // Dokploy prefix
    process.env[`${key}_DOKPLOY`],              // Dokploy suffix
    process.env[`NEXT_PUBLIC_${key}`],          // Next.js prefix (if applicable)
    defaultValue                                // Fallback
  ];

  const value = sources.find(v => v !== undefined && v !== '');
  
  if (!value && !defaultValue) {
    console.error(`❌ Environment variable ${key} is required but not found`);
    console.error('Checked sources:', sources.map((v, i) => `${i}: ${v ? 'FOUND' : 'MISSING'}`));
    throw new Error(`Environment variable ${key} is required but not found`);
  }
  
  return value || defaultValue || '';
}

export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];
  
  for (const key of requiredVars) {
    try {
      getEnvVar(key);
    } catch (error) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables validated');
}