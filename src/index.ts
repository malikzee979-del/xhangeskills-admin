import * as fs from 'fs';
import * as path from 'path';

export default {
  register() {},

  async bootstrap() {
    // Ensure the uploads directory exists — required by Strapi's local upload provider.
    // This runs on every startup so Docker volumes and fresh deployments both work.
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
  },
};
