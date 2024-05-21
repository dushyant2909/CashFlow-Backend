import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Earlier you have to use body parser for accepting json
app.use(express.json({
    limit: "16kb"
}))

// For handling data which comes from url
app.use(express.urlencoded({
    extended: true, // for using objects under objects
    limit: "16kb"
}))

// Set up a cookie parser
app.use(cookieParser());


import userRoutes from "./routes/user.routes.js";
import accountRoutes from "./routes/account.routes.js";

// Test route
app.get("/", (req, res) => {
    res.send("Welcome to CashFlow, Server is running fine!");
});

// Route declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/account", accountRoutes)

export { app }