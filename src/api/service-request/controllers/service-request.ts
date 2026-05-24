import { factories } from '@strapi/strapi';

const POPULATE: any = {
  skill: { populate: { category: true } },
  requester: { fields: ['id', 'username', 'email', 'displayName', 'avatar', 'location'] },
  provider:  { fields: ['id', 'username', 'email', 'displayName', 'avatar', 'location'] },
};

export default factories.createCoreController(
  'api::service-request.service-request',
  ({ strapi }: { strapi: any }) => ({

    async find(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Authentication required');

      const type   = ctx.query.type;
      const status = ctx.query.status;

      if (type === 'received' || type === 'sent') {
        const where: any = type === 'received'
          ? { provider: { id: user.id } }
          : { requester: { id: user.id } };
        if (status) where.status = status;

        const results = await strapi.db
          .query('api::service-request.service-request')
          .findMany({ where, populate: POPULATE, orderBy: { createdAt: 'desc' } });
        return { data: results };
      }

      // Default: merge both sides, deduplicate
      const [asProvider, asRequester] = await Promise.all([
        strapi.db.query('api::service-request.service-request').findMany({
          where: status ? { provider: { id: user.id }, status } : { provider: { id: user.id } },
          populate: POPULATE, orderBy: { createdAt: 'desc' },
        }),
        strapi.db.query('api::service-request.service-request').findMany({
          where: status ? { requester: { id: user.id }, status } : { requester: { id: user.id } },
          populate: POPULATE, orderBy: { createdAt: 'desc' },
        }),
      ]);

      const seen = new Set<number>();
      const merged: any[] = [];
      for (const sr of [...asProvider, ...asRequester]) {
        if (!seen.has(sr.id)) { seen.add(sr.id); merged.push(sr); }
      }
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { data: merged };
    },

    async findOne(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Authentication required');
      const { id } = ctx.params;
      const sr = await strapi.db.query('api::service-request.service-request')
        .findOne({ where: { id }, populate: POPULATE });
      if (!sr) return ctx.notFound('Service request not found');
      if (user.id !== sr.requester?.id && user.id !== sr.provider?.id) return ctx.forbidden('Access denied');
      return { data: sr };
    },

    async create(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Authentication required');
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { skill: skillId, requestDetails, serviceMode, serviceLocation, duration, requestedTime } = body;
      if (!skillId || !requestDetails || !serviceMode || !duration) {
        return ctx.badRequest('skill, requestDetails, serviceMode, and duration are required');
      }
      const skill = await strapi.db.query('api::skill.skill')
        .findOne({ where: { id: skillId }, populate: { user: true } });
      if (!skill) return ctx.notFound('Skill not found');
      if (!skill.user) return ctx.badRequest('Skill has no owner');
      if (skill.user.id === user.id) return ctx.badRequest('You cannot request your own skill');

      const created = await strapi.db.query('api::service-request.service-request').create({
        data: {
          requestDetails, serviceMode,
          serviceLocation: serviceLocation || null,
          duration,
          requestedTime: requestedTime || null,
          status: 'pending',
          skill: skillId,
          requester: user.id,
          provider: skill.user.id,
        },
        populate: POPULATE,
      });
      // Notify the skill provider
      const requesterName = user.displayName || user.username || 'Someone';
      await (strapi.service('api::notification.notification') as any).send({
        type: 'request',
        title: 'New Skill Request',
        message: `${requesterName} requested your "${skill.title}" skill`,
        recipientId: skill.user.id,
        actionLink: '/dashboard/requests',
      });

      ctx.status = 201;
      return { data: created };
    },

    async update(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Authentication required');
      const { id } = ctx.params;
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { status, responseNote, requestDetails, serviceMode, serviceLocation, duration, requestedTime } = body;

      const sr = await strapi.db.query('api::service-request.service-request')
        .findOne({ where: { id }, populate: { requester: true, provider: true } });
      if (!sr) return ctx.notFound('Service request not found');

      const isRequester = sr.requester?.id === user.id;
      const isProvider  = sr.provider?.id  === user.id;
      if (!isRequester && !isProvider) return ctx.forbidden('Access denied');

      const updateData: any = {};
      if (status) {
        if ((status === 'accepted' || status === 'rejected') && !isProvider)
          return ctx.forbidden('Only the provider can accept or reject');
        updateData.status = status;
        if (status === 'accepted' || status === 'rejected')
          updateData.respondedAt = new Date().toISOString();
      }
      if (responseNote !== undefined) updateData.responseNote = responseNote;
      if (requestDetails !== undefined && isRequester && sr.status === 'pending') updateData.requestDetails = requestDetails;
      if (serviceMode !== undefined && isRequester && sr.status === 'pending') updateData.serviceMode = serviceMode;
      if (serviceLocation !== undefined) updateData.serviceLocation = serviceLocation;
      if (duration !== undefined && isRequester && sr.status === 'pending') updateData.duration = duration;
      if (requestedTime !== undefined) updateData.requestedTime = requestedTime;

      const updated = await strapi.db.query('api::service-request.service-request')
        .update({ where: { id }, data: updateData, populate: POPULATE });

      // When a request is accepted, auto-create a 1-to-1 chat between requester and provider
      if (status === 'accepted') {
        const requesterId = sr.requester?.id;
        const providerId  = sr.provider?.id;
        if (requesterId && providerId) {
          // Find existing 1:1 chat
          const requesterChats = await strapi.db.query('api::chat-participant.chat-participant')
            .findMany({ where: { user: { id: requesterId } }, populate: { chat: true } });
          const requesterChatIds = requesterChats.map((p: any) => p.chat?.id).filter(Boolean);

          let existingChatId: number | null = null;
          if (requesterChatIds.length) {
            const providerParticipants = await strapi.db.query('api::chat-participant.chat-participant')
              .findMany({ where: { user: { id: providerId }, chat: { id: { $in: requesterChatIds } } } });
            for (const pp of providerParticipants) {
              const chatId = pp.chat?.id || pp.chatId;
              const allP = await strapi.db.query('api::chat-participant.chat-participant')
                .findMany({ where: { chat: { id: chatId } } });
              if (allP.length === 2) { existingChatId = chatId; break; }
            }
          }

          if (!existingChatId) {
            const chat = await strapi.db.query('api::chat.chat').create({ data: {} });
            await Promise.all([
              strapi.db.query('api::chat-participant.chat-participant').create({ data: { user: requesterId, chat: chat.id, role: 'member' } }),
              strapi.db.query('api::chat-participant.chat-participant').create({ data: { user: providerId,  chat: chat.id, role: 'admin' } }),
            ]);
          }
        }
      }

      // Notify requester when their request is accepted or rejected
      if ((status === 'accepted' || status === 'rejected') && sr.requester?.id) {
        const skillTitle = updated.skill?.title || 'a skill';
        const providerName = user.displayName || user.username || 'The provider';
        await (strapi.service('api::notification.notification') as any).send({
          type: 'request',
          title: status === 'accepted' ? 'Request Accepted 🎉' : 'Request Declined',
          message: status === 'accepted'
            ? `${providerName} accepted your request for "${skillTitle}". A chat has been opened.`
            : `${providerName} declined your request for "${skillTitle}"${updateData.responseNote ? `: ${updateData.responseNote}` : '.'}`,
          recipientId: sr.requester.id,
          actionLink: '/dashboard/requests',
        });
      }

      return { data: updated };
    },

    async delete(ctx: any) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Authentication required');
      const { id } = ctx.params;
      const sr = await strapi.db.query('api::service-request.service-request')
        .findOne({ where: { id }, populate: { requester: true } });
      if (!sr) return ctx.notFound('Service request not found');
      if (sr.requester?.id !== user.id) return ctx.forbidden('Only the requester can delete');
      if (sr.status !== 'pending') return ctx.badRequest('Only pending requests can be deleted');
      await strapi.db.query('api::service-request.service-request').delete({ where: { id } });
      return { data: { id } };
    },
  })
);
