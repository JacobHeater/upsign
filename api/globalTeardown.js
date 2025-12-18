const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('Global teardown running...');

  const dbPath = path.join(__dirname, 'prisma', 'test.db');

  console.log('dbPath', dbPath);

  // Delete the database file if it exists
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Deleted test db file');
    } else {
      console.log('Test db file not found');
    }
  } catch (e) {
    console.log('Failed to delete test db file:', e.message);
  }
};
