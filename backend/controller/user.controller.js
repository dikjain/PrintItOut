import generateToken from "../db/GenerateToken.js";
import Users from "../Models/user.model.js";

const registeruser = async (req, res) => {
    const { username, email, password, rollnumber, phone } = req.body;

    if (!username || !email || !password || !rollnumber) {
        return res.status(404).send("Please provide all fields");
    }

    const userExists = await Users.findOne({ email });

    if (userExists) {
        return res.status(400).send("User already exists");
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
        return res.status(400).send("Invalid user data");
    }
};

const authUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(404).send("Please provide all fields");
    }

    const userExists = await Users.findOne({ email });

    if (!userExists) {
        return res.status(401).send("Invalid email or password");
    }
    if(!(await userExists.matchPassword(password))) {
        return res.status(401).send("Invalid email or password");
    }

    if (userExists && userExists.matchPassword(password)) {
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
    } else {
        return res.status(401).send("Invalid email or password");
    }
};

const getAllUsers = async (req, res) => {
    const users = await Users.find().populate('print');
    res.json(users);
};

const addPrint = async (req, res) => {
    const { userId, assignmentId } = req.body;
    const user = await Users.findById(userId);
    user.print.push(assignmentId);
    await user.save();
    res.status(201).send("Print added successfully");
};

const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    const user = await Users.findOne({ email });
    user.password = newPassword;
    await user.save();
    res.status(201).send("Password reset successfully");
};


export { registeruser, authUser, getAllUsers, addPrint, resetPassword }
