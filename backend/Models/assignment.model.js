import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    upiId: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    pages: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    query: {
        type: String,
        default: "",
    }
}, {timestamps: true});

const Assignments = mongoose.model("Assignments", assignmentSchema);

export default Assignments;
