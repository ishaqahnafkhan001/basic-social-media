const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const tourRouter = require('./routes/tours');
const commentRouter = require('./routes/comments');
const reviewRouter = require('./routes/reviews');
const connectDB = require('./db/db');
const cors = require('cors');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173", // your frontend port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
// DB Connect
connectDB();

// Routes
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/tours', tourRouter);
app.use('/api/comments', commentRouter);
app.use('/api/reviews', reviewRouter);

// Start server
app.listen(port, () => console.log(`server is running on port ${port}`));
