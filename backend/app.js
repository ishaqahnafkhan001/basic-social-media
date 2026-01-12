const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const tourRouter = require('./routes/tours');
const commentRouter = require('./routes/comments');
const reviewRouter = require('./routes/reviews');
// const requestRoutes = require('./routes/requests');
const bookingRouter = require('./routes/booking');
const connectDB = require('./db/db');
const cors = require('cors');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL, // your frontend port
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
// app.use('/api/requests', requestRoutes);
app.use('/api/bookings', bookingRouter);
// Start server
app.listen(port, () => console.log(`server is running on port ${port}`));
module.exports = app;
// for vercel