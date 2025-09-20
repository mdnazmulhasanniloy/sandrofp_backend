"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callbackFn = (callback, result) => {
    if (typeof callback === 'function') {
        callback(result);
    }
};
exports.default = callbackFn;
