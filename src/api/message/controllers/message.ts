import { factories } from '@strapi/strapi';

const USER_FIELDS: any = { fields: ['id', 'username', 'email', 'displayName', 'avatar'] };

export default factories.createCoreController('api::message.message', ({ strapi }: { strapi: any }) => ({

  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    // Koa/qs parses ?filters[chat][id][$eq]=X into a nested object
    const f: any = ctx.query.filters || {};
    const chatId = f?.chat?.id?.$eq ?? f?.chat?.id ?? ctx.query['filters[chat][id][$eq]'];
    if (!chatId) return ctx.badRequest('Chat ID filter is required');
    const participation = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id: chatId } } });
    if (!participation) return ctx.forbidden('You are not in this chat');
    const messages = await strapi.db.query('api::message.message')
      .findMany({ where: { chat: { id: chatId } }, populate: { sender: USER_FIELDS }, orderBy: { createdAt: 'asc' } });
    return { data: messages };
  },

  async findOne(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const msg = await strapi.db.query('api::message.message').findOne({ where: { id }, populate: { sender: USER_FIELDS, chat: true } });
    if (!msg) return ctx.notFound('Message not found');
    const participation = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id: msg.chat?.id } } });
    if (!participation) return ctx.forbidden('Access denied');
    return { data: msg };
  },

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { chat: chatId, content } = body;
    if (!chatId || !content?.trim()) return ctx.badRequest('chat and content are required');
    const participation = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id: chatId } } });
    if (!participation) return ctx.forbidden('You are not in this chat');
    const msg = await strapi.db.query('api::message.message').create({
      data: { content: content.trim(), sender: user.id, chat: chatId },
      populate: { sender: USER_FIELDS },
    });
    await strapi.db.query('api::chat.chat').update({ where: { id: chatId }, data: { updatedAt: new Date().toISOString() } });

    // Notify the other participant(s) in the chat
    const otherParticipants = await strapi.db.query('api::chat-participant.chat-participant')
      .findMany({ where: { chat: { id: chatId }, user: { id: { $ne: user.id } } }, populate: { user: true } });
    const senderName = user.displayName || user.username || 'Someone';
    for (const p of otherParticipants) {
      if (p.user?.id) {
        await (strapi.service('api::notification.notification') as any).send({
          type: 'message',
          title: `New Message from ${senderName}`,
          message: String(content).trim().slice(0, 80),
          recipientId: p.user.id,
          actionLink: '/dashboard/chat',
        });
      }
    }

    ctx.status = 201;
    return { data: msg };
  },

  async update(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const msg = await strapi.db.query('api::message.message').findOne({ where: { id }, populate: { sender: true } });
    if (!msg) return ctx.notFound('Message not found');
    if (msg.sender?.id !== user.id) return ctx.forbidden('You can only edit your own messages');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const updated = await strapi.db.query('api::message.message')
      .update({ where: { id }, data: { content: body.content ?? msg.content }, populate: { sender: USER_FIELDS } });
    return { data: updated };
  },

  async markAsRead(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const msg = await strapi.db.query('api::message.message').findOne({ where: { id }, populate: { chat: true, sender: true } });
    if (!msg) return ctx.notFound('Message not found');
    const participation = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id: msg.chat?.id } } });
    if (!participation) return ctx.forbidden('Access denied');
    // Only mark as read if current user is the recipient (not the sender)
    if (String(msg.sender?.id) !== String(user.id)) {
      await strapi.db.query('api::message.message').update({ where: { id }, data: { isRead: true } });
    }
    return { data: { id, isRead: true } };
  },

  // Marks all messages in a chat as read for the current user (recipient only)
  async markChatRead(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { chatId } = ctx.params;
    const participation = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id: chatId } } });
    if (!participation) return ctx.forbidden('You are not in this chat');
    // Find all unread messages not sent by the current user
    const unread = await strapi.db.query('api::message.message').findMany({
      where: { chat: { id: chatId }, isRead: false },
      populate: { sender: true },
    });
    const toMark = unread.filter((m: any) => String(m.sender?.id) !== String(user.id));
    await Promise.all(
      toMark.map((m: any) =>
        strapi.db.query('api::message.message').update({ where: { id: m.id }, data: { isRead: true } })
      )
    );
    return { data: { chatId, marked: toMark.length } };
  },

  async getUnreadCount(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const participations = await strapi.db.query('api::chat-participant.chat-participant')
      .findMany({ where: { user: { id: user.id } }, populate: { chat: true } });
    const chatIds = participations.map((p: any) => p.chat?.id).filter(Boolean);
    if (!chatIds.length) return { data: { count: 0 } };
    // Count messages not sent by the user that haven't been read yet
    const unread = await strapi.db.query('api::message.message').count({
      where: { chat: { id: { $in: chatIds } }, isRead: false, sender: { id: { $ne: user.id } } },
    });
    return { data: { count: unread } };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const msg = await strapi.db.query('api::message.message').findOne({ where: { id }, populate: { sender: true } });
    if (!msg) return ctx.notFound('Message not found');
    if (msg.sender?.id !== user.id) return ctx.forbidden('You can only delete your own messages');
    await strapi.db.query('api::message.message').delete({ where: { id } });
    return { data: { id } };
  },
}));
