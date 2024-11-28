import express from 'express';

import { registeruser, authUser, addPrint, getAllUsers } from '../controller/user.controller.js';

const router = express.Router();

router.post("/register", registeruser);
router.post("/login", authUser);
router.get("/allusers", getAllUsers);
router.post("/addprint", addPrint);

export default router;
