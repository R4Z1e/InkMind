import { F } from './mockfb.js';
import { install } from './shim.js';
export function start(cfg) { return install(cfg, F); }
