import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

// 24h for email verification, 1h for password reset
const EMAIL_VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS  = 60 * 60 * 1000;

function makeToken(expiryMs: number): { token: string; stored: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + expiryMs;
  return { token, stored: `${token}.${expiry}` };
}

function checkToken(stored: string | null | undefined, provided: string): 'ok' | 'invalid' | 'expired' {
  if (!stored) return 'invalid';
  const dot = stored.lastIndexOf('.');
  if (dot === -1) return 'invalid';
  const storedToken = stored.substring(0, dot);
  const expiry      = parseInt(stored.substring(dot + 1), 10);
  if (storedToken !== provided) return 'invalid';
  if (Date.now() > expiry)      return 'expired';
  return 'ok';
}

export default ({ strapi }: { strapi: any }) => ({
  // ── Signup ─────────────────────────────────────────────────────────────────
  async signup(ctx: any) {
    try {
      const { email, password, firstName, lastName, username } = ctx.request.body;

      if (!email || !password) {
        return ctx.badRequest('Email and password are required');
      }

      const existing = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } });

      if (existing) {
        return ctx.badRequest('Email already registered');
      }

      const { token, stored } = makeToken(EMAIL_VERIFY_EXPIRY_MS);

      const userService = strapi.plugin('users-permissions').service('user');
      await userService.add({
        username:           username || email.split('@')[0],
        email,
        password,
        firstName:          firstName || '',
        lastName:           lastName  || '',
        confirmed:          false,
        confirmationToken:  stored,
      });

      try {
        await sendVerificationEmail(email, token);
      } catch (mailErr: any) {
        strapi.log.error('Failed to send verification email:', mailErr?.message);
      }

      ctx.send({
        ok: true,
        message: 'Account created! Please check your email to verify your account before logging in.',
      });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Signup failed');
    }
  },

  // ── Verify email ───────────────────────────────────────────────────────────
  async verifyEmail(ctx: any) {
    try {
      const token = ctx.query?.token as string;
      if (!token) return ctx.badRequest('Verification token is required');

      // We stored `rawToken.expiry` in confirmationToken, so we need to find
      // a user whose stored token starts with our raw token.
      // To avoid a full table scan, we rebuild the "storedToken starts with rawToken"
      // by fetching users with `confirmed: false` and a non-null confirmationToken
      // and matching in JS. In practice the token is unique so it's one row max.
      // A better approach: store the raw token hash separately—but here we search DB.
      // We use a LIKE query via strapi.db if available, otherwise fetch candidates.
      const users = await strapi.db
        .query('plugin::users-permissions.user')
        .findMany({ where: { confirmed: false } });

      const user = users.find((u: any) => {
        if (!u.confirmationToken) return false;
        const dot = u.confirmationToken.lastIndexOf('.');
        return dot !== -1 && u.confirmationToken.substring(0, dot) === token;
      });

      if (!user) return ctx.badRequest('Invalid verification token');

      const result = checkToken(user.confirmationToken, token);
      if (result === 'expired') return ctx.badRequest('Verification link has expired. Please sign up again.');

      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data:  { confirmed: true, confirmationToken: null },
      });

      const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

      ctx.send({
        ok: true,
        jwt,
        user: {
          id:          user.id,
          email:       user.email,
          username:    user.username,
          displayName: user.displayName || user.username,
          avatar:      user.avatar || '',
          location:    user.location || '',
        },
      });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Email verification failed');
    }
  },

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(ctx: any) {
    try {
      const { identifier, password, email } = ctx.request.body;
      const loginIdentifier = (email || identifier || '').trim();

      if (!loginIdentifier || !password) {
        return ctx.badRequest('Email/identifier and password are required');
      }

      let user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: loginIdentifier } });

      if (!user) {
        user = await strapi.db
          .query('plugin::users-permissions.user')
          .findOne({ where: { username: loginIdentifier } });
      }

      if (!user) return ctx.badRequest('User not found');
      if (user.blocked) return ctx.badRequest('Your account has been blocked');

      if (!user.confirmed) {
        return ctx.badRequest('Please verify your email address before logging in. Check your inbox for the verification link.');
      }

      const valid = await strapi
        .plugin('users-permissions')
        .service('user')
        .validatePassword(password, user.password);

      if (!valid) return ctx.badRequest('Invalid credentials');

      const token = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

      ctx.send({
        jwt: token,
        user: {
          id:          user.id,
          email:       user.email,
          username:    user.username,
          displayName: user.displayName || user.username,
          avatar:      user.avatar || '',
          location:    user.location || '',
        },
      });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Login failed');
    }
  },

  // ── Forgot password ────────────────────────────────────────────────────────
  async forgotPassword(ctx: any) {
    try {
      const { email } = ctx.request.body;
      if (!email) return ctx.badRequest('Email is required');

      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } });

      if (user && !user.blocked) {
        const { token, stored } = makeToken(RESET_TOKEN_EXPIRY_MS);

        await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: user.id },
          data:  { resetPasswordToken: stored },
        });

        try {
          await sendPasswordResetEmail(email, token);
        } catch (mailErr: any) {
          strapi.log.error('Failed to send password reset email:', mailErr?.message);
        }
      }

      // Always return success to avoid email enumeration
      ctx.send({ ok: true, message: 'If the email is registered, a reset link will be sent.' });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Forgot password failed');
    }
  },

  // ── Reset password ─────────────────────────────────────────────────────────
  async resetPassword(ctx: any) {
    try {
      const { token, password, code } = ctx.request.body;
      const rawToken = token || code;

      if (!rawToken || !password) {
        return ctx.badRequest('Token and password are required');
      }

      // Find user whose stored resetPasswordToken matches
      const users = await strapi.db
        .query('plugin::users-permissions.user')
        .findMany({ where: { confirmed: true } });

      const user = users.find((u: any) => {
        if (!u.resetPasswordToken) return false;
        const dot = u.resetPasswordToken.lastIndexOf('.');
        return dot !== -1 && u.resetPasswordToken.substring(0, dot) === rawToken;
      });

      if (!user) return ctx.badRequest('Invalid or expired reset token');

      const result = checkToken(user.resetPasswordToken, rawToken);
      if (result === 'expired') return ctx.badRequest('Reset link has expired. Please request a new one.');

      await strapi.plugin('users-permissions').service('user').edit(user.id, {
        password,
        resetPasswordToken: null,
      });

      ctx.send({ ok: true, message: 'Password updated successfully. You can now log in.' });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Reset password failed');
    }
  },

  // ── Change password ────────────────────────────────────────────────────────
  async changePassword(ctx: any) {
    try {
      const authUser = ctx.state.user;
      if (!authUser) return ctx.unauthorized('Authentication required');

      const { currentPassword, newPassword, confirmPassword } = ctx.request.body;
      if (!currentPassword || !newPassword) return ctx.badRequest('currentPassword and newPassword are required');
      if (newPassword !== confirmPassword)   return ctx.badRequest('Passwords do not match');
      if (newPassword.length < 6)            return ctx.badRequest('New password must be at least 6 characters');

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: authUser.id } });
      if (!user) return ctx.notFound('User not found');

      const valid = await strapi.plugin('users-permissions').service('user').validatePassword(currentPassword, user.password);
      if (!valid) return ctx.badRequest('Current password is incorrect');

      await strapi.plugin('users-permissions').service('user').edit(user.id, { password: newPassword });
      ctx.send({ ok: true, message: 'Password changed successfully' });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Change password failed');
    }
  },

  // ── Get current user ───────────────────────────────────────────────────────
  async getCurrentUser(ctx: any) {
    try {
      const authUser = ctx.state.user;
      if (!authUser) return ctx.unauthorized('Not authenticated');

      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { id: authUser.id } });

      ctx.send({
        id:          user?.id          ?? authUser.id,
        email:       user?.email       ?? authUser.email,
        username:    user?.username    ?? authUser.username,
        displayName: user?.displayName || user?.username || authUser.username,
        avatar:      user?.avatar      || '',
        location:    user?.location    || '',
      });
    } catch (err: any) {
      ctx.badRequest(err?.message || 'Failed to get current user');
    }
  },
});
