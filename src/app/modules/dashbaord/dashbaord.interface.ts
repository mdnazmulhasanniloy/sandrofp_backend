
import { Model } from 'mongoose';

export interface IDashbaord {}

export type IDashbaordModules = Model<IDashbaord, Record<string, unknown>>;