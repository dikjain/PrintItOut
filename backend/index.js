import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./db/db.js";
import userRoutes from './route/user.route.js';
import otpRoutes from './route/otp.route.js';
import assignmentRoutes from './route/assignment.route.js';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/otp", otpRoutes);

const __dirname1 = path.resolve()
app.use(express.static(path.join(__dirname1, "../Frontend/dist")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname1, "../Frontend/dist/index.html"))
})

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
