import { Router } from 'express';
import { identify } from './controllers/contactController';

const router = Router();

router.post('/', identify);

export default router;
