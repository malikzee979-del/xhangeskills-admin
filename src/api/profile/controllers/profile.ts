import { factories } from '@strapi/strapi';

const POPULATE: any = { user: { fields: ['id', 'username', 'email', 'displayName', 'avatar', 'location'] } };

export default factories.createCoreController('api::profile.profile', ({ strapi }: { strapi: any }) => ({

  async getMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    let profile = await strapi.db.query('api::profile.profile').findOne({ where: { user: { id: user.id } }, populate: POPULATE });
    if (!profile) {
      profile = await strapi.db.query('api::profile.profile').create({
        data: { displayName: user.displayName || user.username, bio: '', user: user.id },
        populate: POPULATE,
      });
    }
    return { data: profile };
  },

  async updateMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { bio, displayName, location, profilePicUrl, phone, address } = body;
    let profile = await strapi.db.query('api::profile.profile').findOne({ where: { user: { id: user.id } } });
    const updateData: any = {};
    if (bio !== undefined)           updateData.bio           = bio;
    if (displayName !== undefined)   updateData.displayName   = displayName;
    if (location !== undefined)      updateData.location      = location;
    if (profilePicUrl !== undefined) updateData.profilePicUrl = profilePicUrl;
    if (phone !== undefined)         updateData.phone         = phone;
    if (address !== undefined)       updateData.address       = address;
    if (!profile) {
      profile = await strapi.db.query('api::profile.profile').create({ data: { user: user.id, ...updateData }, populate: POPULATE });
    } else {
      profile = await strapi.db.query('api::profile.profile').update({ where: { id: profile.id }, data: updateData, populate: POPULATE });
    }
    return { data: profile };
  },

  async find(ctx: any) {
    const where: any = {};
    const userIdFilter = ctx.query['filters[user][id][$eq]'];
    if (userIdFilter) where.user = { id: userIdFilter };
    const profiles = await strapi.db.query('api::profile.profile')
      .findMany({ where, populate: POPULATE, orderBy: { createdAt: 'desc' } });
    return { data: profiles };
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const profile = await strapi.db.query('api::profile.profile').findOne({ where: { id }, populate: POPULATE });
    if (!profile) return ctx.notFound('Profile not found');
    return { data: profile };
  },

  async update(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentication required');
    const { id } = ctx.params;
    const existing = await strapi.db.query('api::profile.profile').findOne({ where: { id }, populate: { user: true } });
    if (!existing) return ctx.notFound('Profile not found');
    if (existing.user?.id !== user.id) return ctx.forbidden('You can only edit your own profile');
    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const { bio, displayName, location, profilePicUrl, phone, address } = body;
    const updateData: any = {};
    if (bio !== undefined)           updateData.bio           = bio;
    if (displayName !== undefined)   updateData.displayName   = displayName;
    if (location !== undefined)      updateData.location      = location;
    if (profilePicUrl !== undefined) updateData.profilePicUrl = profilePicUrl;
    if (phone !== undefined)         updateData.phone         = phone;
    if (address !== undefined)       updateData.address       = address;
    const updated = await strapi.db.query('api::profile.profile').update({ where: { id }, data: updateData, populate: POPULATE });
    return { data: updated };
  },
}));
