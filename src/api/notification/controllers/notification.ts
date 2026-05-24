import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::notification.notification', ({ strapi }: { strapi: any }) => ({

  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const notifications = await strapi.db.query('api::notification.notification').findMany({
      where: { recipient: { id: user.id } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: notifications };
  },

  async markAsRead(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const id = Number(ctx.params.id);
    if (!id) return ctx.badRequest('Invalid notification ID');

    const notif = await strapi.db.query('api::notification.notification').findOne({
      where: { id },
      populate: { recipient: true },
    });
    if (!notif) return ctx.notFound('Notification not found');
    if (String(notif.recipient?.id) !== String(user.id)) return ctx.forbidden('Access denied');

    await strapi.db.query('api::notification.notification').update({
      where: { id },
      data: { isRead: true },
    });
    return { data: { id, isRead: true } };
  },

  async markAllAsRead(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');

    // updateMany with relation filter is unreliable in Strapi v5 db.query —
    // fetch IDs first, then bulk-update individually
    const unread = await strapi.db.query('api::notification.notification').findMany({
      where: { recipient: { id: user.id }, isRead: false },
      select: ['id'],
    });
    await Promise.all(
      unread.map((n: any) =>
        strapi.db.query('api::notification.notification').update({
          where: { id: n.id },
          data: { isRead: true },
        })
      )
    );
    return { data: { ok: true, count: unread.length } };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const id = Number(ctx.params.id);
    if (!id) return ctx.badRequest('Invalid notification ID');

    const notif = await strapi.db.query('api::notification.notification').findOne({
      where: { id },
      populate: { recipient: true },
    });
    if (!notif) return ctx.notFound('Notification not found');
    if (String(notif.recipient?.id) !== String(user.id)) return ctx.forbidden('Access denied');

    await strapi.db.query('api::notification.notification').delete({ where: { id } });
    return { data: { id } };
  },
}));
