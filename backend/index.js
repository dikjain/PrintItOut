import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./db/db.js";
import userRoutes from './route/user.route.js';
import otpRoutes from './route/otp.route.js';
import assignmentRoutes from './route/assignment.route.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "*", // Replace with your frontend URL
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"]  // Add more methods if needed
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/otp",otpRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
