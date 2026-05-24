import { factories } from '@strapi/strapi';

const POPULATE: any = {
  reviewer: { fields: ['id', 'username', 'email', 'displayName', 'avatar'] },
  reviewee: { fields: ['id', 'username', 'email', 'displayName', 'avatar'] },
  skill:    { populate: { category: true } },
};

export default factories.createCoreController('api::review.review', ({ strapi }: { strapi: any }) => ({

  async find(ctx: any) {
    // Koa/qs parses bracket notation into nested objects
    const f: any = ctx.query.filters || {};
    const reviewerFilter = f?.reviewer?.id?.$eq ?? f?.reviewer?.id;
    const revieweeFilter = f?.reviewee?.id?.$eq  ?? f?.reviewee?.id;
    const skillFilter    = f?.skill?.id?.$eq     ?? f?.skill?.id ?? ctx.query.skill;
    const where: any = {};
    if (reviewerFilter) where.reviewer = { id: reviewerFilter };
    if (revieweeFilter) where.reviewee = { id: revieweeFilter };
    if (skillFilter)    where.skill    = { id: skillFilter };
    const reviews = await strapi.db.query('api::review.review')
      .findMany({ where, populate: POPULATE, orderBy: { createdAt: 'desc' } });
    return { data: reviews };
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const review = await strapi.db.query('api::review.review').findOne({ where: { id }, populate: POPULATE });
    if (!review) return ctx.notFound('Review not found');
    return { data: review };
  },

  async getUserRating(ctx: any) {
    const { userId } = ctx.params;
    const reviews = await strapi.db.query('api::review.review').findMany({ where: { reviewee: { id: userId } } });
    if (!reviews.length) return { data: { userId, averageRating: 0, totalReviews: 0 } };
    const sum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    return { data: { userId, averageRating: parseFloat((sum / reviews.length).toFixed(2)), totalReviews: reviews.length } };
  },

  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { skill: skillId, rating, comment, serviceRequest: bookingRequestId } = body;
    if (!skillId || !rating) return ctx.badRequest('skill and rating are required');
    if (rating < 1 || rating > 5) return ctx.badRequest('Rating must be between 1 and 5');
    const skill = await strapi.db.query('api::skill.skill').findOne({ where: { id: skillId }, populate: { user: true } });
    if (!skill) return ctx.notFound('Skill not found');
    if (skill.user?.id === user.id) return ctx.badRequest('You cannot review your own skill');
    const existing = await strapi.db.query('api::review.review').findOne({ where: { reviewer: { id: user.id }, skill: { id: skillId } } });
    if (existing) return ctx.badRequest('You have already reviewed this skill');
    const review = await strapi.db.query('api::review.review').create({
      data: { rating, comment: comment || '', reviewer: user.id, reviewee: skill.user?.id || null, skill: skillId, bookingRequest: bookingRequestId || null },
      populate: POPULATE,
    });
    // Notify the reviewee
    if (skill.user?.id) {
      const reviewerName = user.displayName || user.username || 'Someone';
      await (strapi.service('api::notification.notification') as any).send({
        type: 'review',
        title: 'New Review Received',
        message: `${reviewerName} gave you ${rating}★ on "${skill.title}"`,
        recipientId: skill.user.id,
        actionLink: '/dashboard/reviews',
      });
    }

    ctx.status = 201;
    return { data: review };
  },

  async update(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const existing = await strapi.db.query('api::review.review').findOne({ where: { id }, populate: { reviewer: true } });
    if (!existing) return ctx.notFound('Review not found');
    if (existing.reviewer?.id !== user.id) return ctx.forbidden('You can only edit your own reviews');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { rating, comment } = body;
    if (rating !== undefined && (rating < 1 || rating > 5)) return ctx.badRequest('Rating must be between 1 and 5');
    const updateData: any = {};
    if (rating !== undefined)  updateData.rating  = rating;
    if (comment !== undefined) updateData.comment = comment;
    const updated = await strapi.db.query('api::review.review').update({ where: { id }, data: updateData, populate: POPULATE });
    return { data: updated };
  },

  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const existing = await strapi.db.query('api::review.review').findOne({ where: { id }, populate: { reviewer: true } });
    if (!existing) return ctx.notFound('Review not found');
    if (existing.reviewer?.id !== user.id) return ctx.forbidden('You can only delete your own reviews');
    await strapi.db.query('api::review.review').delete({ where: { id } });
    return { data: { id } };
  },
}));
