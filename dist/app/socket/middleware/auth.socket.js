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
exports.socketAuthMiddleware = void 0;
const getUserDetailsFromToken_1 = __importDefault(require("../../helpers/getUserDetailsFromToken"));
const socketAuthMiddleware = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const token = ((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_b = socket.handshake.headers) === null || _b === void 0 ? void 0 : _b.token);
        const user = yield (0, getUserDetailsFromToken_1.default)(token);
        if (!user)
            return next(new Error('Authentication failed'));
        // Attach user to socket (use type assertion if needed)
        socket.data = {
            userId: (_c = user === null || user === void 0 ? void 0 : user._id) === null || _c === void 0 ? void 0 : _c.toString(),
            role: user === null || user === void 0 ? void 0 : user.role,
            email: user === null || user === void 0 ? void 0 : user.email,
            name: user === null || user === void 0 ? void 0 : user.name,
            profile: (user === null || user === void 0 ? void 0 : user.profile) || null,
        };
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.socketAuthMiddleware = socketAuthMiddleware;
