const ctrl = () => strapi.controller('api::message.message') as any;

export default {
  routes: [
    {
      method: 'GET',
      path: '/messages/unread-count',
      handler: async (ctx: any, next: any) => ctrl().getUnreadCount(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/messages/:id/read',
      handler: async (ctx: any, next: any) => ctrl().markAsRead(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/messages',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/messages/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/messages',
      handler: async (ctx: any, next: any) => ctrl().create(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/messages/:id',
      handler: async (ctx: any, next: any) => ctrl().update(ctx, next),
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/messages/:id',
      handler: async (ctx: any, next: any) => ctrl().delete(ctx, next),
      config: { auth: false },
    },
  ],
};
