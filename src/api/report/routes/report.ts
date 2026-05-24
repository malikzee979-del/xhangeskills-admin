const ctrl = () => strapi.controller('api::report.report') as any;

export default {
  routes: [
    {
      method: 'PUT',
      path: '/reports/:id/status',
      handler: async (ctx: any, next: any) => ctrl().updateStatus(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/reports',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/reports/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/reports',
      handler: async (ctx: any, next: any) => ctrl().create(ctx, next),
      config: { auth: false },
    },
  ],
};
