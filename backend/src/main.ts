import express from 'express';
import { UserRepository } from './repository/UserRepository.js';
import { UserService } from './service/UserService.js';
import { UserController } from './controller/UserController.js';
import { MockUserRepository } from './repository/MockUserRepository.js';
import { AuthService } from './service/AuthService.js';
import { AuthController } from './controller/AuthController.js';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';
import { SaleRepository } from './repository/SaleRepository.js';
import { SaleService } from './service/SaleService.js';
import { SaleController } from './controller/SaleController.js';
import { MockSaleRepository } from './repository/MockSaleRepository.js';
import { CommandRepository } from './repository/CommandRepository.js';
import { CommandService } from './service/CommandService.js';
import { CommandController } from './controller/CommandController.js';
import { MockCommandRepository } from './repository/MockCommandRepository.js';

const app = express();
app.use(express.json());

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const saleRepository = new SaleRepository();
const saleService = new SaleService(saleRepository);
const saleController = new SaleController(saleService);
const commandRepository = new CommandRepository();
const commandService = new CommandService(commandRepository);
const commandController = new CommandController(commandService);

//Mock
// const userRepository = new MockUserRepository();
// const saleRepository = new MockSaleRepository();
// const commandRepository = new MockCommandRepository();
// const authService = new AuthService(userRepository);
// const saleService = new SaleService(saleRepository);
// const commandService = new CommandService(commandRepository);
// const authController = new AuthController(authService);
// const saleController = new SaleController(saleService);
// const commandController = new CommandController(commandService);

app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.get('/api/users/me', AuthMiddleware, (req, res) => userController.getProfile(req, res));
app.patch('/api/users/me', AuthMiddleware, (req, res) => userController.updateProfile(req, res));
app.delete('/api/users/me', AuthMiddleware, (req, res) => userController.deleteAccount(req, res));
app.get('/api/sales', AuthMiddleware, (req, res) => saleController.getAll(req, res));
app.post('/api/sales', AuthMiddleware, (req, res) => saleController.create(req, res));
app.get('/api/commands', AuthMiddleware, (req, res) => commandController.getAll(req, res));
app.post('/api/commands', AuthMiddleware, (req, res) => commandController.create(req, res));

app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));