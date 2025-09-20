"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateCryptoString = (length) => {
    length += 1;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    //   const chars =
    //     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length - 1);
    crypto.getRandomValues(array);
    return '#' + Array.from(array, byte => chars[byte % chars.length]).join('');
};
exports.default = generateCryptoString;
