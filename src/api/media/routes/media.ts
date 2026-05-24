const ctrl = () => strapi.controller('api::media.media') as any;

export default {
  routes: [
    {
      method: 'POST',
      path: '/media/upload',
      handler: async (ctx: any, next: any) => ctrl().upload(ctx, next),
      config: { auth: false },
    },
  ],
};
