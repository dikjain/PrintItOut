import express from 'express';
import { createCustomPrint, getCustomPrintsByUserId, updateCustomPrintStatus, getAllCustomPrints, deleteCustomPrint } from '../controller/customprint.controller.js';
const router = express.Router();

router.post("/add", createCustomPrint); 
router.get("/:userId", getCustomPrintsByUserId);
router.get("/", getAllCustomPrints);
router.put("/:printId", updateCustomPrintStatus);
router.delete("/:printId", deleteCustomPrint);
export default router;
