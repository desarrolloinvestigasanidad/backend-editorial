/**
 * Script para crear usuarios de prueba en la editorial
 * 
 * Ejecutar con: node scripts/createTestUsers.js
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
bcrypt.setRandomFallback((size) => crypto.randomBytes(size));

const sequelize = require("../config/database");
const User = require("../models/User");
const Role = require("../models/Role");

const testUsers = [
    {
        id: "admin001",
        email: "admin@editorial.test",
        password: "Admin123!",
        firstName: "Administrador",
        lastName: "Editorial",
        phone: "600000001",
        professionalCategory: "Administrador",
        gender: "M",
        address: "Calle Admin 1",
        country: "España",
        autonomousCommunity: "Madrid",
        province: "Madrid",
        termsAccepted: true,
        infoAccepted: true,
        state: "active",
        verified: true,
        roleId: 1, // Admin
    },
    {
        id: "cliente001",
        email: "cliente@editorial.test",
        password: "Cliente123!",
        firstName: "Usuario",
        lastName: "Cliente Pruebas",
        phone: "600000002",
        professionalCategory: "Médico",
        gender: "F",
        address: "Calle Cliente 1",
        country: "España",
        autonomousCommunity: "Barcelona",
        province: "Barcelona",
        termsAccepted: true,
        infoAccepted: true,
        state: "active",
        verified: true,
        roleId: 2, // Cliente
    },
];

const roles = [
    { id: 1, name: "admin", description: "Administrador del sistema" },
    { id: 2, name: "cliente", description: "Usuario cliente de la plataforma" },
];

async function createTestUsers() {
    try {
        console.log("🔌 Conectando a la base de datos...");
        await sequelize.authenticate();
        console.log("✅ Conexión establecida correctamente.\n");

        // Sincronizar modelos (crear tablas si no existen)
        console.log("📋 Sincronizando modelos...");
        await sequelize.sync({ alter: true });
        console.log("✅ Modelos sincronizados.\n");

        // Crear roles si no existen
        console.log("👥 Verificando roles...");
        for (const role of roles) {
            const [existingRole, created] = await Role.findOrCreate({
                where: { id: role.id },
                defaults: role,
            });
            if (created) {
                console.log(`   ✅ Rol "${role.name}" creado.`);
            } else {
                console.log(`   ℹ️  Rol "${role.name}" ya existe.`);
            }
        }
        console.log("");

        // Crear usuarios de prueba
        console.log("👤 Creando usuarios de prueba...\n");
        for (const userData of testUsers) {
            const existingUser = await User.findOne({ where: { id: userData.id } });

            if (existingUser) {
                console.log(`   ℹ️  Usuario "${userData.id}" ya existe. Actualizando...`);

                // Actualizar contraseña y datos
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                await existingUser.update({
                    ...userData,
                    password: hashedPassword,
                });
                console.log(`   ✅ Usuario "${userData.id}" actualizado.\n`);
            } else {
                // Crear nuevo usuario
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                await User.create({
                    ...userData,
                    password: hashedPassword,
                });
                console.log(`   ✅ Usuario "${userData.id}" creado.\n`);
            }
        }

        console.log("═══════════════════════════════════════════════════════════════");
        console.log("                    USUARIOS DE PRUEBA CREADOS                  ");
        console.log("═══════════════════════════════════════════════════════════════");
        console.log("");
        console.log("  🔐 ADMINISTRADOR (Backoffice):");
        console.log("     • ID/Usuario: admin001");
        console.log("     • Email: admin@editorial.test");
        console.log("     • Contraseña: Admin123!");
        console.log("     • URL: http://localhost:3001 (backoffice)");
        console.log("");
        console.log("  👤 CLIENTE (Editorial):");
        console.log("     • ID/Usuario: cliente001");
        console.log("     • Email: cliente@editorial.test");
        console.log("     • Contraseña: Cliente123!");
        console.log("     • URL: http://localhost:3000 (editorial)");
        console.log("");
        console.log("═══════════════════════════════════════════════════════════════");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error);
        process.exit(1);
    }
}

createTestUsers();
