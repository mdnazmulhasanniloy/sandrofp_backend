"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRoutes = void 0;
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), reviews_controller_1.reviewsController.createReviews);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user), reviews_controller_1.reviewsController.updateReviews);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), reviews_controller_1.reviewsController.deleteReviews);
router.get('/:id', reviews_controller_1.reviewsController.getReviewsById);
router.get('/', reviews_controller_1.reviewsController.getAllReviews);
exports.reviewsRoutes = router;
