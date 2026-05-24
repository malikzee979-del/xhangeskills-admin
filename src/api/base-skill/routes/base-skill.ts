export default {
  routes: [
    {
      method: 'GET',
      path: '/base-skills',
      handler: 'base-skill.find',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/base-skills/:id',
      handler: 'base-skill.findOne',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/base-skills',
      handler: 'base-skill.create',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/base-skills/:id',
      handler: 'base-skill.update',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/base-skills/:id',
      handler: 'base-skill.delete',
      config: { auth: false },
    },
  ],
};
