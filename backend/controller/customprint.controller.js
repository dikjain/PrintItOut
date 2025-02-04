import CustomPrint from "../Models/customPrint.model.js";

export const createCustomPrint = async (req, res) => {
    try {
        const { fileUrl, title, pages, userId, upiId, message, rollnumber, Phone, username, copies } = req.body;



        if (!fileUrl || !title || !pages || !userId || !upiId || !rollnumber || !Phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCustomPrint = new CustomPrint({
            fileUrl,
            title,
            pages,
            userId,
            upiId,
            message,
            rollnumber,
            copies,
            Phone,
            username,
            status: "Pending"

        });

        const savedCustomPrint = await newCustomPrint.save();
        res.status(201).json(savedCustomPrint);

    } catch (error) {
        console.error("Error creating custom print:", error);
        res.status(500).json({ message: "Error creating custom print request" });
    }
};

export const getCustomPrintsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const customPrints = await CustomPrint.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json(customPrints);

    } catch (error) {
        console.error("Error fetching custom prints:", error);
        res.status(500).json({ message: "Error fetching custom prints" });
    }
};

export const updateCustomPrintStatus = async (req, res) => {
    try {
        const { printId } = req.params;
        const { status } = req.body;

        if (!printId || !status) {
            return res.status(400).json({ message: "Print ID and status are required" });
        }

        const updatedPrint = await CustomPrint.findByIdAndUpdate(
            printId,
            { status },
            { new: true }
        );

        if (!updatedPrint) {
            return res.status(404).json({ message: "Custom print not found" });
        }

        res.status(200).json(updatedPrint);

    } catch (error) {
        console.error("Error updating custom print status:", error);
        res.status(500).json({ message: "Error updating custom print status" });
    }
};

export const getAllCustomPrints = async (req, res) => {
    try {
        const customPrints = await CustomPrint.find();
        res.status(200).json(customPrints);
    } catch (error) {
        console.error("Error fetching all custom prints:", error);
        res.status(500).json({ message: "Error fetching all custom prints" });
    }
};

export const deleteCustomPrint = async (req, res) => {
    try {
        const { printId } = req.params;

        if (!printId) {
            return res.status(400).json({ message: "Print ID is required" });
        }

        const deletedPrint = await CustomPrint.findByIdAndDelete(printId);

        if (!deletedPrint) {
            return res.status(404).json({ message: "Custom print not found" });
        }

        res.status(200).json({ message: "Custom print deleted successfully" });

    } catch (error) {
        console.error("Error deleting custom print:", error);
        res.status(500).json({ message: "Error deleting custom print" });
    }
};
