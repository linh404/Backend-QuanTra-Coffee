import fs from 'fs'
import path from 'path'

// Load .env file manually
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) continue
    
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').trim()
    
    // Only set if not already set (environment variables take precedence)
    if (!process.env[key?.trim()]) {
      process.env[key?.trim()] = value
    }
  }
}

// Ensure required env vars are set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://root:password@127.0.0.1:3306/green_store'
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key'
}

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-key'
}

