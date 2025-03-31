import { Router } from "express"; // expressjs router import
const router = Router();
// import handleAuth function from AuthController
import {
    getBenefits
}from '../../controllers/openai.js'

router.post('/', getBenefits);

export {router as benefitsRouter};