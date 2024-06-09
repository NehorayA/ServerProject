"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = __importDefault(require("./ROUTES/connection"));
const users_1 = __importDefault(require("./ROUTES/users"));
const watchedMovies_1 = __importDefault(require("./ROUTES/watchedMovies"));
const watchListMovies_1 = __importDefault(require("./ROUTES/watchListMovies"));
const favoriteMovies_1 = __importDefault(require("./ROUTES/favoriteMovies"));
const lists_1 = __importDefault(require("./ROUTES/lists"));
const routes_1 = __importDefault(require("./ROUTES/routes"));
const encryptionMiddleware_1 = require("./ENCRYPTION/encryptionMiddleware"); // Import your encryption/decryption functions
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(encryptionMiddleware_1.decryptMiddleware);
const routers = [
    connection_1.default,
    users_1.default,
    watchedMovies_1.default,
    watchListMovies_1.default,
    favoriteMovies_1.default,
    lists_1.default,
    routes_1.default
];
routers.forEach(route => app.use(route));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
