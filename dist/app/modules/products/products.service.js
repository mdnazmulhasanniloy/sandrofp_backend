"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const products_models_1 = __importDefault(require("./products.models"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const s3_1 = require("../../utils/s3");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mailSender_1 = require("../../utils/mailSender");
const createProducts = (payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    if (files) {
        const { images } = files;
        //documents
        if (images) {
            const imgsArray = [];
            images === null || images === void 0 ? void 0 : images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                imgsArray.push({
                    file: image,
                    path: `images/service/images`,
                });
            }));
            payload.images = yield (0, s3_1.uploadManyToS3)(imgsArray);
        }
    }
    const result = yield products_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create products');
    }
    return result;
});
const getAllProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const productsModel = new QueryBuilder_1.default(products_models_1.default.find({ isDeleted: false }).populate([
        { path: 'author', select: 'name email profile' },
    ]), query)
        .search(['name'])
        .filter()
        .paginate()
        .sort()
        .fields();
    yield productsModel.executePopulate();
    const data = yield productsModel.modelQuery;
    const meta = yield productsModel.countTotal();
    return {
        data,
        meta,
    };
});
const getProductsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.findById(id).populate([
        { path: 'author', select: 'name email profile' },
    ]);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Products not found!');
    }
    return result;
});
const updateProducts = (id, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { images } = payload;
    if (files) {
        const { images } = files;
        //documents
        if (images) {
            const imgsArray = [];
            images === null || images === void 0 ? void 0 : images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                imgsArray.push({
                    file: image,
                    path: `images/service/images`,
                });
            }));
            payload.images = yield (0, s3_1.uploadManyToS3)(imgsArray);
        }
    }
    if (images && (images === null || images === void 0 ? void 0 : images.length) > 0)
        images === null || images === void 0 ? void 0 : images.map(img => { var _a; return (_a = payload.images) === null || _a === void 0 ? void 0 : _a.push(img); });
    const result = yield products_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update Products');
    }
    return result;
});
const rejectProducts = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).populate([{ path: 'author', select: 'name email profile' }]);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete products');
    }
    const rejectProductMailPath = path_1.default.join(__dirname, '../../../../public/view/reject_product.html');
    yield (0, mailSender_1.sendEmail)((result === null || result === void 0 ? void 0 : result.author).email, 'Your Product request Rejected', fs_1.default
        .readFileSync(rejectProductMailPath, 'utf8')
        .replace('{{name}}', (result === null || result === void 0 ? void 0 : result.author).name)
        .replace('{{product_name}}', result === null || result === void 0 ? void 0 : result.name)
        .replace('{{reason}}', payload.reason));
    return result;
});
const deleteProducts = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield products_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete products');
    }
    return result;
});
exports.productsService = {
    createProducts,
    getAllProducts,
    getProductsById,
    updateProducts,
    deleteProducts,
    rejectProducts,
};
