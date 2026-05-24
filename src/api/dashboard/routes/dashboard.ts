export default {
  routes: [
    {
      method: 'GET',
      path: '/dashboard/counts',
      handler: async (ctx: any, next: any) => {
        const ctrl = strapi.controller('api::dashboard.dashboard') as any;
        return ctrl.getCounts(ctx, next);
      },
      config: { auth: false },
    },
  ],
};
