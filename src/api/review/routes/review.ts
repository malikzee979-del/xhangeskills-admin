const ctrl = () => strapi.controller('api::review.review') as any;

export default {
  routes: [
    {
      method: 'GET',
      path: '/reviews/user/:userId/rating',
      handler: async (ctx: any, next: any) => ctrl().getUserRating(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/reviews',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/reviews/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/reviews',
      handler: async (ctx: any, next: any) => ctrl().create(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/reviews/:id',
      handler: async (ctx: any, next: any) => ctrl().update(ctx, next),
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/reviews/:id',
      handler: async (ctx: any, next: any) => ctrl().delete(ctx, next),
      config: { auth: false },
    },
  ],
};
