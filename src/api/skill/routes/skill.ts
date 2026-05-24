const ctrl = () => strapi.controller('api::skill.skill') as any;

export default {
  routes: [
    // /skills/me before /skills/:id
    {
      method: 'GET',
      path: '/skills/me',
      handler: async (ctx: any, next: any) => ctrl().findMySkills(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/skills',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/skills/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/skills',
      handler: async (ctx: any, next: any) => ctrl().create(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/skills/:id',
      handler: async (ctx: any, next: any) => ctrl().update(ctx, next),
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/skills/:id',
      handler: async (ctx: any, next: any) => ctrl().delete(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/skills/:id/approve',
      handler: async (ctx: any, next: any) => ctrl().approve(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/skills/:id/reject',
      handler: async (ctx: any, next: any) => ctrl().reject(ctx, next),
      config: { auth: false },
    },
  ],
};
