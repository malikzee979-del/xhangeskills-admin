import { factories } from '@strapi/strapi';

const USER_FIELDS: any = { fields: ['id', 'username', 'email', 'displayName', 'avatar'] };

async function populatedChat(strapi: any, chatId: any) {
  return strapi.db.query('api::chat.chat').findOne({
    where: { id: chatId },
    populate: {
      participants: { populate: { user: USER_FIELDS } },
      messages: { populate: { sender: USER_FIELDS }, orderBy: { createdAt: 'asc' } },
    },
  });
}

function normalizeChat(chat: any, uid: string) {
  return {
    ...chat,
    participants: (chat.participants || []).map((p: any) => ({
      id: p.user?.id ?? p.id,
      username: p.user?.username,
      email: p.user?.email,
      displayName: p.user?.displayName,
      avatar: p.user?.avatar,
    })),
  };
}

export default factories.createCoreController('api::chat.chat', ({ strapi }: { strapi: any }) => ({

  async find(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const uid = String(user.id);
    const participations = await strapi.db.query('api::chat-participant.chat-participant')
      .findMany({ where: { user: { id: user.id } }, populate: { chat: true } });
    const chatIds = participations.map((p: any) => p.chat?.id).filter(Boolean);
    if (!chatIds.length) return { data: [] };
    const chats = await Promise.all(chatIds.map((id: any) => populatedChat(strapi, id)));
    const sorted = chats.filter(Boolean).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { data: sorted.map((c: any) => normalizeChat(c, uid)) };
  },

  async findOne(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const chat = await populatedChat(strapi, id);
    if (!chat) return ctx.notFound('Chat not found');
    const participantIds = (chat.participants || []).map((p: any) => p.user?.id ?? p.id);
    if (!participantIds.includes(user.id)) return ctx.forbidden('You are not in this chat');
    return { data: normalizeChat(chat, String(user.id)) };
  },

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const allIds = Array.from(new Set([user.id, ...(body.participants || []).map(Number)]));
    const chat = await strapi.db.query('api::chat.chat').create({ data: { title: body.title || null } });
    await Promise.all(allIds.map((uid: any) =>
      strapi.db.query('api::chat-participant.chat-participant').create({
        data: { user: uid, chat: chat.id, role: uid === user.id ? 'admin' : 'member' },
      })
    ));
    const populated = await populatedChat(strapi, chat.id);
    ctx.status = 201;
    return { data: populated };
  },

  async findOrCreate(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const otherUserId = Number(body.otherUserId);
    if (!otherUserId) return ctx.badRequest('otherUserId is required');

    const myParticipations = await strapi.db.query('api::chat-participant.chat-participant')
      .findMany({ where: { user: { id: user.id } }, populate: { chat: true } });
    const myChatsIds = myParticipations.map((p: any) => p.chat?.id).filter(Boolean);

    if (myChatsIds.length) {
      const otherParticipations = await strapi.db.query('api::chat-participant.chat-participant')
        .findMany({ where: { user: { id: otherUserId }, chat: { id: { $in: myChatsIds } } } });
      if (otherParticipations.length > 0) {
        const chatId = otherParticipations[0].chat?.id || otherParticipations[0].chatId;
        const allP = await strapi.db.query('api::chat-participant.chat-participant').findMany({ where: { chat: { id: chatId } } });
        if (allP.length === 2) {
          return { data: await populatedChat(strapi, chatId), created: false };
        }
      }
    }

    const chat = await strapi.db.query('api::chat.chat').create({ data: {} });
    await Promise.all([
      strapi.db.query('api::chat-participant.chat-participant').create({ data: { user: user.id, chat: chat.id, role: 'admin' } }),
      strapi.db.query('api::chat-participant.chat-participant').create({ data: { user: otherUserId, chat: chat.id, role: 'member' } }),
    ]);
    ctx.status = 201;
    return { data: await populatedChat(strapi, chat.id), created: true };
  },

  async markMessagesRead(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id: chatId } = ctx.params;
    const participation = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id: chatId } } });
    if (!participation) return ctx.forbidden('You are not in this chat');
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

  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const participant = await strapi.db.query('api::chat-participant.chat-participant')
      .findOne({ where: { user: { id: user.id }, chat: { id } } });
    if (!participant) return ctx.forbidden('You are not in this chat');
    await strapi.db.query('api::chat-participant.chat-participant').deleteMany({ where: { chat: { id } } });
    await strapi.db.query('api::message.message').deleteMany({ where: { chat: { id } } });
    await strapi.db.query('api::chat.chat').delete({ where: { id } });
    return { data: { id } };
  },
}));
