import * as fs from 'fs';
import * as path from 'path';

export default ({ strapi }: { strapi: any }) => ({
  async upload(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');

    const rawFiles = ctx.request.files?.files;
    if (!rawFiles) return ctx.badRequest('No file uploaded. Use field name "files".');

    const file     = Array.isArray(rawFiles) ? rawFiles[0] : rawFiles;
    const filePath = file.filepath ?? file.path;
    const fileName = file.originalFilename ?? file.newFilename ?? file.name ?? 'upload';

    if (!filePath) return ctx.badRequest('Could not read uploaded file path.');

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext        = path.extname(fileName) || '.jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const dest       = path.join(uploadsDir, uniqueName);

    fs.copyFileSync(filePath, dest);

    const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    ctx.body = [{ url: `${baseUrl}/uploads/${uniqueName}`, name: fileName }];
  },
});
