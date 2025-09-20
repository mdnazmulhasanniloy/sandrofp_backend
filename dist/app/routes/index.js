"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_routes_1 = require("../modules/otp/otp.routes");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const notificaiton_route_1 = require("../modules/notification/notificaiton.route");
const contents_route_1 = require("../modules/contents/contents.route");
const dashboard_route_1 = require("../modules/dashboard/dashboard.route");
const category_route_1 = require("../modules/category/category.route");
const products_route_1 = require("../modules/products/products.route");
const payments_route_1 = require("../modules/payments/payments.route");
const reportContent_route_1 = require("../modules/reportContent/reportContent.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.userRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/otp',
        route: otp_routes_1.otpRoutes,
    },
    {
        path: '/notifications',
        route: notificaiton_route_1.notificationRoutes,
    },
    {
        path: '/contents',
        route: contents_route_1.contentsRoutes,
    },
    {
        path: '/dashboard',
        route: dashboard_route_1.dashboardRoutes,
    },
    {
        path: '/categories',
        route: category_route_1.categoryRoutes,
    },
    {
        path: '/products',
        route: products_route_1.productsRoutes,
    },
    {
        path: '/payments',
        route: payments_route_1.paymentsRoutes,
    },
    {
        path: '/reports',
        route: reportContent_route_1.reportContentRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
