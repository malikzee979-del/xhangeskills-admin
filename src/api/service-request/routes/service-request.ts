const ctrl = () => strapi.controller('api::service-request.service-request') as any;

export default {
  routes: [
    {
      method: 'GET',
      path: '/service-requests',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/service-requests/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/service-requests',
      handler: async (ctx: any, next: any) => ctrl().create(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/service-requests/:id',
      handler: async (ctx: any, next: any) => ctrl().update(ctx, next),
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/service-requests/:id',
      handler: async (ctx: any, next: any) => ctrl().delete(ctx, next),
      config: { auth: false },
    },
  ],
};
