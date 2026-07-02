import express from 'express';
import { UserRepository } from './repository/UserRepository.js';
import { AuthService } from './service/AuthService.js';
import { AuthController } from './controller/AuthController.js';
import { SaleRepository } from './repository/SaleRepository.js';
import { SaleService } from './service/SaleService.js';
import { SaleController } from './controller/SaleController.js';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';

const app = express();
app.use(express.json());

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const saleRepository = new SaleRepository();
const saleService = new SaleService(saleRepository);
const saleController = new SaleController(saleService);

app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.get('/api/sales', AuthMiddleware, (req, res) => saleController.getAll(req, res));

app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));