"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = 'hr@example.com';
    const password = 'password123';
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name: 'Admin HR',
            role: 'HR',
            company: 'Acme Corp',
            settings: JSON.stringify({
                notifications: { email: true },
                system: { language: 'en', dateFormat: 'mdy' }
            })
        },
    });
    console.log(`Seeded user: ${user.email}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map