export default {
  async getCounts(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const uid = user.id;

    const [mySkills, requestsSent, requestsReceived, pendingRequests, chatsCount] = await Promise.all([
      strapi.db.query('api::skill.skill').count({ where: { user: { id: uid } } }),
      strapi.db.query('api::service-request.service-request').count({ where: { requester: { id: uid } } }),
      strapi.db.query('api::service-request.service-request').count({ where: { provider: { id: uid } } }),
      strapi.db.query('api::service-request.service-request').count({ where: { provider: { id: uid }, status: 'pending' } }),
      strapi.db.query('api::chat-participant.chat-participant').count({ where: { user: { id: uid } } }),
    ]);

    const reviews = await strapi.db.query('api::review.review').findMany({ where: { reviewee: { id: uid } } });
    const avgRating = reviews.length
      ? parseFloat((reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length).toFixed(2))
      : 0;

    const [completedAsRequester, completedAsProvider] = await Promise.all([
      strapi.db.query('api::service-request.service-request').count({ where: { requester: { id: uid }, status: 'completed' } }),
      strapi.db.query('api::service-request.service-request').count({ where: { provider: { id: uid }, status: 'completed' } }),
    ]);

    return {
      data: {
        mySkills,
        requestsSent,
        requestsReceived,
        pendingRequests,
        reviewsReceived: reviews.length,
        averageRating: avgRating,
        totalExchanges: completedAsRequester + completedAsProvider,
        chats: chatsCount,
      },
    };
  },
};
