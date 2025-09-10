
import { Model } from 'mongoose';

export interface IDashboard {}

export type IDashboardModules = Model<IDashboard, Record<string, unknown>>;