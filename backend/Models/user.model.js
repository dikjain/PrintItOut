import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rollnumber: {
        type: Number,
        required: true,
        unique: true,
        min: 1000000000, 
        max: 99999999999, 
    },
    assignments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignments',
        default: [],
    }],
    amount: {
        type: Number,
        default: 0,
    },
    print: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignments',
        default: [],
    }],
    phone: {
        type: Number,
        required: true,
        unique: true,
    },

}, {timestamps: true});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next(); 
    }

    const salt = await bcrypt.genSalt(6);
    this.password = await bcrypt.hash(this.password, salt); 
    next();
});

const Users = mongoose.model("Users", userSchema);

export default Users;
