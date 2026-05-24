import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::skill.skill', ({ strapi }: { strapi: any }) => ({

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in to create a skill');

    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const entity = await strapi.db.query('api::skill.skill').create({
      data: { ...body, user: user.id, status: body.status ?? 'pending' },
      populate: { category: true, baseSkill: true, user: { fields: ['id', 'username', 'email', 'displayName'] } },
    });
    ctx.status = 201;
    return { data: entity };
  },

  async update(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized('You must be logged in');

    const existing = await strapi.db.query('api::skill.skill').findOne({
      where: { id },
      populate: { user: true },
    });
    if (!existing) return ctx.notFound('Skill not found');
    if (String(existing.user?.id) !== String(user.id)) return ctx.forbidden('You can only modify your own skills');

    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const updated = await strapi.db.query('api::skill.skill').update({
      where: { id },
      data: body,
      populate: { category: true, baseSkill: true, user: { fields: ['id', 'username', 'email', 'displayName'] } },
    });
    return { data: updated };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized('You must be logged in');

    const existing = await strapi.db.query('api::skill.skill').findOne({
      where: { id },
      populate: { user: true, serviceRequests: true },
    });
    if (!existing) return ctx.notFound('Skill not found');
    if (String(existing.user?.id) !== String(user.id)) return ctx.forbidden('You can only delete your own skills');
    if (existing.serviceRequests?.length > 0) return ctx.badRequest('Cannot delete skill with active service requests');

    await strapi.db.query('api::skill.skill').delete({ where: { id } });
    return { data: { id } };
  },

  async find(ctx: any) {
    // Koa/qs parses bracket notation into nested objects:
    // ?filters[status][$eq]=X  →  ctx.query.filters.status.$eq = 'X'
    const f: any = ctx.query.filters || {};
    const statusFilter = f?.status?.$eq ?? f?.status;
    const catFilter    = f?.category?.id?.$eq ?? f?.category?.id;
    const qFilter      = (ctx.query._q as string) || '';

    // Build conditions array then collapse with $and to avoid Strapi v5
    // issues when mixing top-level keys with $or in the same where object
    const conditions: any[] = [];
    if (statusFilter)   conditions.push({ status: statusFilter });
    if (catFilter)      conditions.push({ category: { id: Number(catFilter) } });
    if (qFilter.trim()) conditions.push({
      $or: [
        { title:       { $containsi: qFilter.trim() } },
        { description: { $containsi: qFilter.trim() } },
      ],
    });

    const where = conditions.length === 0 ? {}
      : conditions.length === 1 ? conditions[0]
      : { $and: conditions };

    const skills = await strapi.db.query('api::skill.skill').findMany({
      where,
      populate: { category: true, baseSkill: true, user: { fields: ['id', 'username', 'email', 'displayName'] } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: skills };
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const skill = await strapi.db.query('api::skill.skill').findOne({
      where: { id },
      populate: { category: true, baseSkill: true, user: { fields: ['id', 'username', 'email', 'displayName'] } },
    });
    if (!skill) return ctx.notFound('Skill not found');
    return { data: skill };
  },

  async findMySkills(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const skills = await strapi.db.query('api::skill.skill').findMany({
      where: { user: { id: user.id } },
      populate: { category: true, baseSkill: true, user: { fields: ['id', 'username', 'email', 'displayName'] } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: skills };
  },

  async approve(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');
    const { id } = ctx.params;

    const skill = await strapi.db.query('api::skill.skill').findOne({ where: { id } });
    if (!skill) return ctx.notFound('Skill not found');
    if (skill.status !== 'pending') return ctx.badRequest('Only pending skills can be approved');

    const updated = await strapi.db.query('api::skill.skill').update({
      where: { id },
      data: { status: 'approved' },
    });
    return { data: updated };
  },

  async reject(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');
    const { id } = ctx.params;
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};

    const skill = await strapi.db.query('api::skill.skill').findOne({ where: { id } });
    if (!skill) return ctx.notFound('Skill not found');
    if (skill.status !== 'pending') return ctx.badRequest('Only pending skills can be rejected');

    const updated = await strapi.db.query('api::skill.skill').update({
      where: { id },
      data: { status: 'rejected', rejectionReason: body.reason || 'No reason provided' },
    });
    return { data: updated };
  },
}));
