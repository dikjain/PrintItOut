import generateToken from "../db/GenerateToken.js";
import Users from "../Models/user.model.js";

const registeruser = async (req, res) => {
    try {
        const { username, email, password, rollnumber, phone } = req.body;

        if (!username || !email || !password || !rollnumber) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const userExists = await Users.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const user = await Users.create({ username, email, password, rollnumber, phone });

        if (user) {
            const populatedUser = await user.populate('print');
            res.status(201).json({
                _id: populatedUser._id,
                username: populatedUser.username,
                email: populatedUser.email,
                rollnumber: populatedUser.rollnumber,
                token: generateToken(populatedUser._id),
                print: populatedUser.print,
                phone: populatedUser.phone,  
            });
        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Error in registeruser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        const userExists = await Users.findOne({ email });

        if (!userExists || !(await userExists.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const populatedUser = await userExists.populate('print');
        res.json({
            _id: populatedUser._id,
            username: populatedUser.username,
            email: populatedUser.email,
            rollnumber: populatedUser.rollnumber,
            token: generateToken(populatedUser._id),
            print: populatedUser.print,
            phone: populatedUser.phone,
        });
    } catch (error) {
        console.error("Error in authUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find().populate('print');
        res.json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const addPrint = async (req, res) => {
    try {
        const { userId, assignmentId } = req.body;
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.print.push(assignmentId);
        await user.save();
        res.status(201).json({ message: "Print added successfully" });
    } catch (error) {
        console.error("Error in addPrint:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.password = newPassword;
        await user.save();
        res.status(201).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { registeruser, authUser, getAllUsers, addPrint, resetPassword }
