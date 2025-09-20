import { model, Schema } from 'mongoose';
import { IDashboard, IDashboardModules } from './dashboard.interface';

const dashboardSchema = new Schema<IDashboard>(
  {
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

const Dashboard = model<IDashboard, IDashboardModules>(
  'Dashboard',
  dashboardSchema,
);
export default Dashboard;
