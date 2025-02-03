import mongoose from "mongoose";

const customPrintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    pages: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    upiId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ""
    },
    rollnumber: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const CustomPrint = mongoose.model("CustomPrint", customPrintSchema);

export default CustomPrint;