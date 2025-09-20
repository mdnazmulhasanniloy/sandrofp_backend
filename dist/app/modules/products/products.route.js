"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRoutes = void 0;
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const multer_1 = __importStar(require("multer"));
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const products_validation_1 = require("./products.validation");
const router = (0, express_1.Router)();
const storage = (0, multer_1.memoryStorage)();
const upload = (0, multer_1.default)({ storage });
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), upload.fields([{ name: 'images', maxCount: 10 }]), (0, parseData_1.default)(), (0, validateRequest_1.default)(products_validation_1.productValidation.createProductSchema), products_controller_1.productsController.createProducts);
router.patch('/approved/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), products_controller_1.productsController.approvedProducts);
router.patch('/reject/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), (0, validateRequest_1.default)(products_validation_1.productValidation.rejectProductSchema), products_controller_1.productsController.rejectProducts);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin), upload.fields([{ name: 'images', maxCount: 10 }]), (0, parseData_1.default)(), (0, validateRequest_1.default)(products_validation_1.productValidation.createProductSchema), products_controller_1.productsController.updateProducts);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user, user_constants_1.USER_ROLE.admin), products_controller_1.productsController.deleteProducts);
router.get('/my-products', (0, auth_1.default)(user_constants_1.USER_ROLE.user), products_controller_1.productsController.getMyProducts);
router.get('/:id', products_controller_1.productsController.getProductsById);
router.get('/', products_controller_1.productsController.getAllProducts);
exports.productsRoutes = router;
