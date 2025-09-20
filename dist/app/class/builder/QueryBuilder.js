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
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(modelQuery, query) {
        this.exclusions = [];
        this.populatedFields = null;
        this.modelQuery = modelQuery;
        this.query = query;
        for (const key in this.query) {
            if (Object.prototype.hasOwnProperty.call(this.query, key) &&
                key !== 'searchTerm' && // eslint-disable-next-line no-undefined
                (this.query[key] === undefined ||
                    this.query[key] === null ||
                    this.query[key] === '')) {
                delete this.query[key];
            }
        }
    }
    search(searchableFields) {
        var _a;
        const searchTerm = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(field => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                })),
            });
        }
        return this;
    }
    //rated base filter
    ratedFilter(field, range) {
        if (range) {
            const filter = {
                field: { $gte: range },
            };
            this.modelQuery = this.modelQuery.find(filter);
        }
        return this;
    }
    // Range filter
    // rangeFilter<K extends keyof T>(field: K, range: string) {
    //   if (range) {
    //     const [min, max] = range.split('-').map(Number);
    //     // Check if both min and max are valid numbers
    //     if (!isNaN(min) && !isNaN(max)) {
    //       const filter: any = {
    //         [field]: { $gte: min, $lte: max } as any,
    //       };
    //       this.modelQuery = this.modelQuery.find(filter);
    //     } else {
    //       // Handle invalid range values if needed
    //       //@ts-ignore
    //       console.warn(`Invalid range value for field ${field}: ${range}`);
    //     }
    //   }
    //   return this;
    // }
    // Filter
    filter() {
        const queryObj = Object.assign({}, this.query); // Copy
        // Filtering
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        this.modelQuery = this.modelQuery.find(queryObj);
        return this;
    }
    conditionalFilter() {
        const queryObj = Object.assign({}, this.query); // Copy the query object
        // Exclude non-filter fields
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        // Iterate over the query object for filtering
        for (const key in queryObj) {
            if (queryObj[key]) {
                let value = queryObj[key];
                if (typeof value === 'string') {
                    // Handle numeric operators
                    if (value.includes('>=')) {
                        const [, amount] = value.split('>=');
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $gte: Number(amount) },
                        });
                    }
                    else if (value.includes('>')) {
                        const [, amount] = value.split('>');
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $gt: Number(amount) },
                        });
                    }
                    else if (value.includes('<=')) {
                        const [, amount] = value.split('<=');
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $lte: Number(amount) },
                        });
                    }
                    else if (value.includes('<')) {
                        const [, amount] = value.split('<');
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $lt: Number(amount) },
                        });
                    }
                    else if (value.includes('!=')) {
                        const [, amount] = value.split('!=');
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $ne: Number(amount) },
                        });
                    }
                    else if (value.includes('!')) {
                        const [, v] = value.split('!');
                        console.log(v);
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $ne: v },
                        });
                    }
                    else if (value.includes('-')) {
                        // Handle range filtering (min-max)
                        const [min, max] = value.split('-').map(Number);
                        if (!isNaN(min) && !isNaN(max)) {
                            this.modelQuery = this.modelQuery.find({
                                [key]: { $gte: min, $lte: max },
                            });
                        }
                    }
                    else if (value.includes('||')) {
                        const queryValues = value.split('||');
                        const query = queryValues === null || queryValues === void 0 ? void 0 : queryValues.map(queryValue => ({
                            [key]: queryValue,
                        }));
                        this.modelQuery = this.modelQuery.find({
                            $or: query,
                        });
                    }
                    else if (/^\[.*?\]$/.test(value)) {
                        const match = value.match(/\[(.*?)\]/);
                        const queryValue = match ? match[1] : value;
                        this.modelQuery = this.modelQuery.find({
                            [key]: { $in: [queryValue] },
                        });
                    }
                    else {
                        // Fallback: Handle normal equality
                        this.modelQuery = this.modelQuery.find({ [key]: value });
                    }
                }
            }
        }
        return this; // Return 'this' for method chaining
    }
    sort() {
        var _a, _b, _c;
        const sort = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.sort) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    paginate() {
        var _a, _b;
        const page = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
        const limit = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    fields() {
        var _a, _b, _c;
        const fields = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-__v';
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    exclude(fieldString) {
        this.exclusions.push(...fieldString
            .split(',')
            .map(f => f.trim())
            .filter(f => f));
        return this;
    }
    applyExclusions() {
        if (this.exclusions.length > 0) {
            const exclusionString = this.exclusions
                .map(field => `-${field}`)
                .join(' ');
            this.modelQuery = this.modelQuery.select(exclusionString);
        }
        return this;
    }
    populateFields(fields) {
        this.populatedFields = fields;
        return this;
    }
    executePopulate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.populatedFields) {
                this.modelQuery.populate(this.populatedFields);
            }
            return this;
        });
    }
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const totalQueries = this.modelQuery.getFilter();
            const total = yield this.modelQuery.model.countDocuments(totalQueries);
            const page = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
            const limit = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
            const totalPage = Math.ceil(total / limit);
            return {
                page,
                limit,
                total,
                totalPage,
            };
        });
    }
}
exports.default = QueryBuilder;
