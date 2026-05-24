const ctrl = () => strapi.controller('api::chat.chat') as any;

export default {
  routes: [
    {
      method: 'POST',
      path: '/chats/find-or-create',
      handler: async (ctx: any, next: any) => ctrl().findOrCreate(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/chats',
      handler: async (ctx: any, next: any) => ctrl().find(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/chats/:id',
      handler: async (ctx: any, next: any) => ctrl().findOne(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/chats',
      handler: async (ctx: any, next: any) => ctrl().create(ctx, next),
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/chats/:id',
      handler: async (ctx: any, next: any) => ctrl().delete(ctx, next),
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/chats/:id/read-messages',
      handler: async (ctx: any, next: any) => ctrl().markMessagesRead(ctx, next),
      config: { auth: false },
    },
  ],
};
