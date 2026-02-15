const express = require('express');
const dotenv = require('dotenv');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const tourRouter = require('./routes/tours');
const commentRouter = require('./routes/comments');
const reviewRouter = require('./routes/reviews');
const notSleepRouter = require('./routes/notSleep');
const bookingRouter = require('./routes/booking');
const connectDB = require('./db/db');
const cors = require('cors');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_02
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
// DB Connect
connectDB();

// Routes


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use('/api/notSleep', notSleepRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/tours', tourRouter);
app.use('/api/comments', commentRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/bookings', bookingRouter);
// Start server
app.listen(port, () => console.log(`server is running on port ${port}`));
module.exports = app;
// for vercel
//something
