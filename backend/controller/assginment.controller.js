import Assignments from "../Models/assignment.model.js";
import Users from "../Models/user.model.js";

const addAssignment = async (req, res) => {
    try {
        const { title, userId, isAdmin, pages, upiId } = req.body;

        if (!title || !userId || !pages) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const userExists = await Users.findById(userId);

        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const assignment = await Assignments.create({ title, user: userId, pages, isAdmin, upiId });

        if (assignment) {
            res.status(201).json(assignment);
        } else {
            return res.status(400).json({ message: "Invalid assignment data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
};

const changeAssignmentStatus = async (req, res) => {
    try {
        const { assignmentId, status } = req.body;

        if (!assignmentId || !status) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const assignment = await Assignments.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.status = status;
        await assignment.save();

        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Error updating assignment status", error: error.message });
    }
};

const showAssignmentStatus = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!assignmentId) {
            return res.status(400).json({ message: "Please provide assignment ID" });
        }

        const assignment = await Assignments.findById(assignmentId).populate('user', 'username email rollnumber');

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Error fetching assignment status", error: error.message });
    }
};

const getPendingAssignments = async (req, res) => {
    try {
        const assignments = await Assignments.find({ status: 'Pending', isAdmin: false })
            .sort({ createdAt: -1 })
            .populate('user', 'username email rollnumber phone');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending assignments", error: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!assignmentId) {
            return res.status(400).json({ message: "Please provide assignment ID" });
        }

        const assignment = await Assignments.findByIdAndDelete(assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting assignment", error: error.message });
    }
};

const getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignments.find({ isAdmin: false })
            .sort({ createdAt: -1 })
            .populate('user', 'username email rollnumber phone');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching assignments", error: error.message });
    }
};

const getAdminAssignments = async (req, res) => {
    try {
        const assignments = await Assignments.find({ isAdmin: true })
            .sort({ createdAt: -1 })
            .populate('user', 'username email');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin assignments", error: error.message });
    }
};

const getUserAssignments = async (req, res) => {
    try {
        const { userId } = req.params;
        const assignments = await Assignments.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user assignments", error: error.message });
    }
};

const addQuestion = async (req, res) => {
    try {
        const { assignmentId, question } = req.body;
        
        if (!assignmentId || !question) {
            return res.status(400).json({ message: "Please provide assignment ID and question" });
        }

        const assignment = await Assignments.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        assignment.query = question;
        await assignment.save();
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Error adding question", error: error.message });
    }
};

export { 
    addAssignment, 
    changeAssignmentStatus, 
    showAssignmentStatus, 
    getAllAssignments, 
    getPendingAssignments, 
    deleteAssignment, 
    getAdminAssignments, 
    getUserAssignments, 
    addQuestion 
};
