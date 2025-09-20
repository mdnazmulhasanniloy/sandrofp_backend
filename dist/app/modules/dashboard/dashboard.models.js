"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dashboardSchema = new mongoose_1.Schema({
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
const Dashboard = (0, mongoose_1.model)('Dashboard', dashboardSchema);
exports.default = Dashboard;
