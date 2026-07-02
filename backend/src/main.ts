import express from 'express';
import { UserRepository } from './repository/UserRepository.js';
import { AuthService } from './service/AuthService.js';
import { AuthController } from './controller/AuthController.js';

const app = express();
app.use(express.json());

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));

app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));