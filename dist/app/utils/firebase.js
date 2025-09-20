"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/firebase.ts
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_service_account_json_1 = __importDefault(require("../../../firebase-service-account.json"));
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(firebase_service_account_json_1.default),
    });
}
const firebaseAdmin = firebase_admin_1.default;
exports.default = firebaseAdmin;
