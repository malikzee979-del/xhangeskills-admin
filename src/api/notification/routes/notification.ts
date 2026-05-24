const ctrl = () => strapi.controller('api::notification.notification') as any;

export default {
  routes: [
    {
      method: 'GET',
      path: '/notifications',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    // Use POST for action-style endpoints to avoid Koa conflicts with PUT /:id
    {
      method: 'POST',
      path: '/notifications/read-all',
      handler: async (ctx: any, next: any) => ctrl().markAllAsRead(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/notifications/:id/read',
      handler: async (ctx: any, next: any) => ctrl().markAsRead(ctx, next),
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: async (ctx: any, next: any) => ctrl().delete(ctx, next),
      config: { auth: false },
    },
  ],
};
