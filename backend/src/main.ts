import express from 'express';
import { UserRepository } from './repository/UserRepository.js';
import { UserService } from './service/UserService.js';
import { UserController } from './controller/UserController.js';
import { AuthService } from './service/AuthService.js';
import { AuthController } from './controller/AuthController.js';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';
import { SaleRepository } from './repository/SaleRepository.js';
import { SaleService } from './service/SaleService.js';
import { SaleController } from './controller/SaleController.js';
import { CommandRepository } from './repository/CommandRepository.js';
import { CommandService } from './service/CommandService.js';
import { CommandController } from './controller/CommandController.js';
import { PreferenceRepository } from './repository/PreferenceRepository.js';
import { PreferenceService } from './service/PreferenceService.js';
import { PreferenceController } from './controller/PreferenceController.js';
import { BarycenterScoringStrategy, WeightedScoringStrategy } from './service/ScoringStrategies.js';

const app = express();
app.use(express.json());

const userRepository = new UserRepository();
const saleRepository = new SaleRepository();
const commandRepository = new CommandRepository();
const preferenceRepository = new PreferenceRepository();

//const activeScoringStrategy = new BarycenterScoringStrategy(); 
const activeScoringStrategy = new WeightedScoringStrategy();

const userService = new UserService(userRepository);
const authService = new AuthService(userRepository);
const preferenceService = new PreferenceService(preferenceRepository);
const saleService = new SaleService(saleRepository, activeScoringStrategy);
const commandService = new CommandService(commandRepository);

const userController = new UserController(userService);
const authController = new AuthController(authService);
const preferenceController = new PreferenceController(preferenceService);
const saleController = new SaleController(saleService, preferenceService);
const commandController = new CommandController(commandService);

// Routes Auth
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));

// Routes Users
app.get('/api/users/me', AuthMiddleware, (req, res) => userController.getProfile(req, res));
app.patch('/api/users/me', AuthMiddleware, (req, res) => userController.updateProfile(req, res));
app.delete('/api/users/me', AuthMiddleware, (req, res) => userController.deleteAccount(req, res));

// Routes Sales
app.get('/api/sales', AuthMiddleware, (req, res) => saleController.getAll(req, res as any));
app.post('/api/sales', AuthMiddleware, (req, res) => saleController.create(req, res));

// Routes Preferences (Favoris)
app.get('/api/preferences', AuthMiddleware, (req, res) => preferenceController.getMyPreferences(req, res));
app.post('/api/preferences', AuthMiddleware, (req, res) => preferenceController.addInteraction(req, res));

// Routes Commands
app.get('/api/commands', AuthMiddleware, (req, res) => commandController.getAll(req, res));
app.post('/api/commands', AuthMiddleware, (req, res) => commandController.create(req, res));

app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));