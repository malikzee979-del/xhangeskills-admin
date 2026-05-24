import { factories } from '@strapi/strapi';

const POPULATE: any = {
  reporter:     { fields: ['id', 'username', 'email', 'displayName'] },
  reportedUser: { fields: ['id', 'username', 'email', 'displayName'] },
};
const VALID_STATUSES = ['PENDING', 'REVIEWED', 'RESOLVED'];

export default factories.createCoreController('api::report.report', ({ strapi }: { strapi: any }) => ({

  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const reports = await strapi.db.query('api::report.report')
      .findMany({ where: { reporter: { id: user.id } }, populate: POPULATE, orderBy: { createdAt: 'desc' } });
    return { data: reports };
  },

  async findOne(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const report = await strapi.db.query('api::report.report').findOne({ where: { id }, populate: POPULATE });
    if (!report) return ctx.notFound('Report not found');
    if (report.reporter?.id !== user.id) return ctx.forbidden('Access denied');
    return { data: report };
  },

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { reason, description, reportedUser: reportedUserId, bookingRequest, message } = body;
    if (!reason) return ctx.badRequest('reason is required');
    if (!reportedUserId) return ctx.badRequest('reportedUser is required');
    if (Number(reportedUserId) === user.id) return ctx.badRequest('You cannot report yourself');
    const report = await strapi.db.query('api::report.report').create({
      data: { reason, description: description || '', status: 'PENDING', reporter: user.id, reportedUser: reportedUserId, bookingRequest: bookingRequest || null, message: message || null },
      populate: POPULATE,
    });
    ctx.status = 201;
    return { data: report };
  },

  async updateStatus(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    if (!body.status || !VALID_STATUSES.includes(body.status)) return ctx.badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    const existing = await strapi.db.query('api::report.report').findOne({ where: { id } });
    if (!existing) return ctx.notFound('Report not found');
    const updated = await strapi.db.query('api::report.report').update({ where: { id }, data: { status: body.status }, populate: POPULATE });
    return { data: updated };
  },
}));
