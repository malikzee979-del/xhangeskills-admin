import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::notification.notification', ({ strapi }: { strapi: any }) => ({
  async send(data: {
    type: 'request' | 'review' | 'message' | 'system';
    title: string;
    message: string;
    recipientId: number | string;
    actionLink?: string;
  }) {
    try {
      await strapi.db.query('api::notification.notification').create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          actionLink: data.actionLink || null,
          recipient: Number(data.recipientId),
          isRead: false,
        },
      });
    } catch (err) {
      // Notification failure should never break the main action
      strapi.log.warn(`[notification] Failed to send notification: ${err}`);
    }
  },
}));
