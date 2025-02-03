import express from 'express';
import { createCustomPrint, getCustomPrintsByUserId, updateCustomPrintStatus, getAllCustomPrints } from '../controller/customprint.controller.js';
const router = express.Router();

router.post("/add", createCustomPrint); 
router.get("/:userId", getCustomPrintsByUserId);
router.get("/", getAllCustomPrints);
router.put("/:printId", updateCustomPrintStatus);
export default router;
