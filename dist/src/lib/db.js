"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.db = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.db = globalForPrisma.prisma ?? new client_1.PrismaClient();
exports.prisma = exports.db; // Alias para compatibilidad
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.db;
