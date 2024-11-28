import express from 'express';
import { addAssignment, changeAssignmentStatus, getUserAssignments,getAdminAssignments, showAssignmentStatus, getAllAssignments, getPendingAssignments, deleteAssignment, addQuestion } from '../controller/assginment.controller.js';

const router = express.Router();

router.post("/add", addAssignment);
router.get("/pending", getPendingAssignments);
router.put("/changeStatus", changeAssignmentStatus);
router.get("/show/:id", showAssignmentStatus);
router.delete("/delete/:assignmentId", deleteAssignment);
router.get("/all", getAllAssignments);
router.get("/adminassignments", getAdminAssignments);
router.get("/userassignments/:userId", getUserAssignments);
router.post("/addQuestion", addQuestion);
export default router;
