import Assignments from "../Models/assignment.model.js";
import Users from "../Models/user.model.js";

// Add a new assignment
const addAssignment = async (req, res) => {
    const { title, userId, isAdmin, pages , upiId} = req.body;

    if (!title || !userId ||  !pages) {
        return res.status(400).send("Please provide all fields");
    }

    const userExists = await Users.findById(userId);

    if (!userExists) {
        return res.status(404).send("User not found");
    }

    const assignment = await Assignments.create({ title, user: userId, pages,  isAdmin, upiId });

    if (assignment) {
        res.status(201).json(assignment);
    } else {
        return res.status(400).send("Invalid assignment data");
    }
};

// Change assignment status (admin only)
const changeAssignmentStatus = async (req, res) => {
    const { assignmentId, status } = req.body;

    if (!assignmentId || !status) {
        return res.status(400).send("Please provide all fields");
    }

    const assignment = await Assignments.findById(assignmentId);

    if (!assignment) {
        return res.status(404).send("Assignment not found");
    }

    assignment.status = status;
    await assignment.save();

    res.status(200).json(assignment);
};

// Show assignment status (user & admin)
const showAssignmentStatus = async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(400).send("Please provide assignment ID");
    }

    const assignment = await Assignments.findById(assignmentId).populate('user', 'username email rollnumber');

    if (!assignment) {
        return res.status(404).send("Assignment not found");
    }

    res.status(200).json(assignment);
};

const getPendingAssignments = async (req, res) => { 
    const assignments = await Assignments.find({ status: 'Pending', isAdmin: false }).sort({ createdAt: -1 }).populate('user', 'username email rollnumber phone');
    res.status(200).json(assignments);
};

// Delete assignment (admin only)
const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(400).send("Please provide assignment ID");
    }

    const assignment = await Assignments.findByIdAndDelete(assignmentId);

    if (!assignment) {
        return res.status(404).send("Assignment not found");
    }

    res.status(200).send("Assignment deleted successfully");
};

const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignments.find({ isAdmin: false }).sort({ createdAt: -1 }).populate('user', 'username email rollnumber phone');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).send("Error fetching assignments");
    }
};

const getAdminAssignments = async (req, res) => {
    const assignments = await Assignments.find({ isAdmin: true }).sort({ createdAt: -1 }).populate('user', 'username email');
    res.status(200).json(assignments);
};

const getUserAssignments = async (req, res) => {
    const { userId } = req.params;
    const assignments = await Assignments.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(assignments);
};

const addQuestion = async (req, res) => {
    const { assignmentId, question } = req.body;
    const assignment = await Assignments.findById(assignmentId);
    assignment.query = question;
    await assignment.save();
    res.status(200).json(assignment);
};

export { addAssignment, changeAssignmentStatus, showAssignmentStatus, getAllAssignments, getPendingAssignments, deleteAssignment, getAdminAssignments, getUserAssignments, addQuestion };

