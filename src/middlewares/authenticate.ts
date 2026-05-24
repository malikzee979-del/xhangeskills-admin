export default (_config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: any) => {
    const authHeader = ctx.request?.header?.authorization || ctx.headers?.authorization;

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();

      if (token) {
        try {
          const jwtService = strapi.plugin('users-permissions').service('jwt');
          const payload = await jwtService.verify(token);

          if (payload?.id) {
            const user = await strapi.db
              .query('plugin::users-permissions.user')
              .findOne({ where: { id: payload.id } });

            if (user && !user.blocked) {
              ctx.state.user = user;
            }
          }
        } catch (err: any) {
          strapi.log.warn(`[authenticate] JWT verify failed: ${err?.message}`);
          // Invalid / expired token — leave ctx.state.user undefined.
          // Route handlers that require auth will return 401 themselves.
        }
      }
    }

    await next();
  };
};
