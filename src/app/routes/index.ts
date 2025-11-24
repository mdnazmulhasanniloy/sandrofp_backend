import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { notificationRoutes } from '../modules/notification/notificaiton.route';
import { contentsRoutes } from '../modules/contents/contents.route';
import { dashboardRoutes } from '../modules/dashboard/dashboard.route';
import { categoryRoutes } from '../modules/category/category.route';
import { productsRoutes } from '../modules/products/products.route';
import { paymentsRoutes } from '../modules/payments/payments.route';
import { reportContentRoutes } from '../modules/reportContent/reportContent.route';
import { exchangesRoutes } from '../modules/exchanges/exchanges.route';
import { reviewsRoutes } from '../modules/reviews/reviews.route';
import { chatRoutes } from '../modules/chat/chat.route';
import { messagesRoutes } from '../modules/messages/messages.route';
import uploadRouter from '../modules/uploads/route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/contents',
    route: contentsRoutes,
  },
  {
    path: '/dashboard',
    route: dashboardRoutes,
  },
  {
    path: '/categories',
    route: categoryRoutes,
  },
  {
    path: '/products',
    route: productsRoutes,
  },
  {
    path: '/payments',
    route: paymentsRoutes,
  },
  {
    path: '/reports',
    route: reportContentRoutes,
  },
  {
    path: '/exchanges',
    route: exchangesRoutes,
  },
  {
    path: '/uploads',
    route: uploadRouter,
  },
  {
    path: '/reviews',
    route: reviewsRoutes,
  },
  {
    path: '/chats',
    route: chatRoutes,
  },
  {
    path: '/messages',
    route: messagesRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
