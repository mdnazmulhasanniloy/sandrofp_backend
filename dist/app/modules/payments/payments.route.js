"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentsRoutes = void 0;
const express_1 = require("express");
const payments_controller_1 = require("./payments.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const payments_validation_1 = __importDefault(require("./payments.validation"));
const router = (0, express_1.Router)();
router.post('/checkout', (0, auth_1.default)(user_constants_1.USER_ROLE.user), (0, validateRequest_1.default)(payments_validation_1.default.checkoutSchema), payments_controller_1.paymentsController.checkout);
router.get('/confirm-payment', payments_controller_1.paymentsController.confirmPayment);
exports.paymentsRoutes = router;
