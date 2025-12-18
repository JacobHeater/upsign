const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Global setup running...');

  process.env.DATABASE_URL = 'file:./test.db';

  const dbPath = path.join(__dirname, 'prisma', 'test.db');

  console.log('dbPath', dbPath);

  // Delete the database file if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted test db file');
  } else {
    console.log('Test db file not found');
  }

  // Push the schema to create tables
  console.log('Pushing schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: { ...process.env } });
  console.log('Schema pushed.');
};
