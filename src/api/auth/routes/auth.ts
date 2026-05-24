const ctrl = () => strapi.controller('api::auth.auth') as any;

export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'auth.login',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/signup',
      handler: async (ctx: any, next: any) => ctrl().signup(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/auth/verify-email',
      handler: async (ctx: any, next: any) => ctrl().verifyEmail(ctx, next),
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/auth/me',
      handler: async (ctx: any, next: any) => ctrl().getCurrentUser(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/change-password',
      handler: async (ctx: any, next: any) => ctrl().changePassword(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/forgot-password',
      handler: async (ctx: any, next: any) => ctrl().forgotPassword(ctx, next),
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      handler: async (ctx: any, next: any) => ctrl().resetPassword(ctx, next),
      config: { auth: false },
    },
  ],
};
