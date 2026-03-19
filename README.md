# NeuroAmigo API

API RESTful para la aplicación NeuroAmigo, una plataforma de apoyo para el manejo de la ansiedad.

---

## INFORMACIÓN GENERAL

| Concepto | Detalle |
|----------|---------|
| **Framework** | Node.js + Express 4.18.2 |
| **Lenguaje** | JavaScript |
| **Base de datos** | MySQL |
| **Autenticación** | JWT |

---

##REQUISITOS

- Node.js 14+
- MySQL 8+
- npm

---

## 🔧 INSTALACIÓN

```bash
# 1. Clonar repositorio
git clone [URL]
cd neuroamigo-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env con:
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=neuroamigo_db
JWT_SECRET=neuroamigo_secret_key_2025
JWT_EXPIRE=30d

# 4. Crear base de datos
mysql -u root -p < database.sql

npm run dev
# Servidor en http://localhost:3001

neuroamigo-backend/
├── config/database.js
├── controllers/
│   ├── authController.js
│   └── emocionController.js
├── middleware/authMiddleware.js
├── models/
│   ├── Usuario.js
│   └── RegistroEmocional.js
├── routes/
│   ├── authRoutes.js
│   └── emocionRoutes.js
├── .env
├── package.json
├── server.js
└── database.sql
