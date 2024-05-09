import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getBalance, transfer } from "../controller/account.controller.js";
const accountRoutes = Router();


accountRoutes.use(verifyJWT) // All protected routes

accountRoutes.route("/get-balance").get(getBalance)
accountRoutes.route("/transfer").post(transfer)

export default accountRoutes;