const fs = require('fs');
const path = require('path');

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Parse .env file if present
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = getDatabaseUrl();
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

  // Replace provider in datasource db
  const updatedSchema = schema.replace(/provider\s*=\s*"[^"]+"/, `provider = "${targetProvider}"`);

  if (schema !== updatedSchema) {
    fs.writeFileSync(schemaPath, updatedSchema, 'utf8');
    console.log(`[WorkForge DB] Automatically configured Prisma schema provider to: "${targetProvider}"`);
  } else {
    console.log(`[WorkForge DB] Prisma schema provider already set to: "${targetProvider}"`);
  }
} catch (err) {
  console.error('[WorkForge DB] Error configuring Prisma schema provider:', err);
}
