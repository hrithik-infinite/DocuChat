const { PrismaClient } = require("@prisma/client");

if (!globalThis.prisma) {
  globalThis.prisma = new PrismaClient();
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = globalThis.prisma || new PrismaClient();
}

module.exports = globalThis.prisma;
