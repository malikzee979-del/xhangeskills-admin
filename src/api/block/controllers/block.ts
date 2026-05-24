import { factories } from '@strapi/strapi';

const POPULATE: any = {
  blocker: { fields: ['id', 'username', 'email', 'displayName'] },
  blocked: { fields: ['id', 'username', 'email', 'displayName'] },
};

export default factories.createCoreController('api::block.block', ({ strapi }: { strapi: any }) => ({

  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const where: any = { blocker: { id: user.id } };
    const blockedFilter = ctx.query['filters[blocked][id][$eq]'];
    if (blockedFilter) where.blocked = { id: blockedFilter };
    const blocks = await strapi.db.query('api::block.block').findMany({ where, populate: POPULATE });
    return { data: blocks };
  },

  async findOne(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const block = await strapi.db.query('api::block.block').findOne({ where: { id }, populate: POPULATE });
    if (!block) return ctx.notFound('Block not found');
    if (block.blocker?.id !== user.id) return ctx.forbidden('Access denied');
    return { data: block };
  },

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { blocked: blockedUserId } = body;
    if (!blockedUserId) return ctx.badRequest('blocked user ID is required');
    if (Number(blockedUserId) === user.id) return ctx.badRequest('You cannot block yourself');
    const existing = await strapi.db.query('api::block.block').findOne({ where: { blocker: { id: user.id }, blocked: { id: blockedUserId } } });
    if (existing) return ctx.badRequest('User is already blocked');
    const block = await strapi.db.query('api::block.block').create({ data: { blocker: user.id, blocked: blockedUserId }, populate: POPULATE });
    ctx.status = 201;
    return { data: block };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const block = await strapi.db.query('api::block.block').findOne({ where: { id }, populate: { blocker: true } });
    if (!block) return ctx.notFound('Block not found');
    if (block.blocker?.id !== user.id) return ctx.forbidden('You can only remove your own blocks');
    await strapi.db.query('api::block.block').delete({ where: { id } });
    return { data: { id } };
  },
}));
