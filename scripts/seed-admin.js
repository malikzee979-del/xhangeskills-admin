'use strict';

/**
 * Seed admin user
 * Run from backend directory:
 *   node ../scripts/seed-admin.js
 */

let strapi;

async function seedAdmin() {
  const userService = strapi.plugin('users-permissions').service('user');
  
  console.log('\n━━━ Creating Admin User ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check if admin already exists
  const adminExists = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { username: 'admin' },
  });

  if (adminExists) {
    console.log('✓ Admin user already exists');
    console.log(`  Username: ${adminExists.username}`);
    console.log(`  Email: ${adminExists.email}\n`);
    return;
  }

  // Get authenticated role
  const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'authenticated' },
  });

  if (!authRole) {
    console.error('✗ Authenticated role not found');
    return;
  }

  // Create admin user
  try {
    const admin = await userService.add({
      username: 'admin',
      email: 'admin@xchangeskills.io',
      password: 'Admin@123',
      displayName: 'Administrator',
      provider: 'local',
      confirmed: true,
      blocked: false,
      role: authRole.id,
    });

    console.log('✓ Admin user created successfully!\n');
    console.log('  Username: admin');
    console.log('  Email: admin@xchangeskills.io');
    console.log('  Password: Admin@123');
    console.log('  Role: authenticated\n');
  } catch (error) {
    console.error('✗ Failed to create admin user:', error.message);
  }
}

// Bootstrap and run
async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  strapi = app;
  app.log.level = 'error';

  await seedAdmin();

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err);
  process.exit(1);
});
