import { Router } from "express";
import { getCurrentUser, logout, signin, signup, updatePassword, updateUserDetails } from "../controller/user.controller.js";
const userRoutes = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

userRoutes.route("/signup").post(signup)

userRoutes.route("/signin").post(signin)

userRoutes.use(verifyJWT)
userRoutes.route("/update").patch(updateUserDetails)
userRoutes.route("/update-password").patch(updatePassword)
userRoutes.route("/logout").post(logout)
userRoutes.route("/get-current-user").get(getCurrentUser)


export default userRoutes