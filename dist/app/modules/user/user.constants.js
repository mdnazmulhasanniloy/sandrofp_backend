"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSearchableFields = exports.Role = exports.gender = exports.Login_With = exports.USER_ROLE = void 0;
exports.USER_ROLE = {
    super_admin: 'super_admin',
    sub_admin: 'sub_admin',
    admin: 'admin',
    user: 'user',
    vendor: 'vendor',
};
var Login_With;
(function (Login_With) {
    Login_With["google"] = "google";
    Login_With["apple"] = "apple";
    Login_With["facebook"] = "facebook";
    Login_With["credentials"] = "credentials";
})(Login_With || (exports.Login_With = Login_With = {}));
exports.gender = ['Male', 'Female', 'Others'];
exports.Role = ['admin', 'super_admin', 'sub_admin', 'user', 'vendor'];
exports.userSearchableFields = ['shopId', 'email'];
