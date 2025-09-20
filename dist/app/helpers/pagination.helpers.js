"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationHelper = void 0;
const calculatePagination = (options) => {
    const page = Number(options === null || options === void 0 ? void 0 : options.page) || 1;
    const limit = Number(options === null || options === void 0 ? void 0 : options.limit) || 10;
    const skip = Number((page - 1) * limit);
    const sort = (options === null || options === void 0 ? void 0 : options.sort) || 'createdAt';
    return {
        page,
        limit,
        skip,
        sort,
    };
};
exports.paginationHelper = { calculatePagination };
