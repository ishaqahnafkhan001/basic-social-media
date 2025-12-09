const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const connectDB = require('./db/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connect
connectDB();

// Routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

// Start server
app.listen(port, () => console.log(`server is running on port ${port}`));
