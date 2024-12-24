import express from 'express';

import { registeruser, authUser, addPrint, getAllUsers, resetPassword } from '../controller/user.controller.js';

const router = express.Router();

router.post("/register", registeruser);
router.post("/login", authUser);
router.get("/allusers", getAllUsers);
router.post("/addprint", addPrint);
router.post("/reset-password", resetPassword);

export default router;
