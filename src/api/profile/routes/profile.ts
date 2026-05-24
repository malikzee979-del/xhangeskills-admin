const ctrl = () => strapi.controller('api::profile.profile') as any;

export default {
  routes: [
    {
      method: 'GET',
      path: '/profiles/me',
      handler: async (ctx: any, next: any) => ctrl().getMe(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/profiles/me',
      handler: async (ctx: any, next: any) => ctrl().updateMe(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/profiles',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/profiles/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/profiles/:id',
      handler: async (ctx: any, next: any) => ctrl().update(ctx, next),
      config: { auth: false },
    },
  ],
};
