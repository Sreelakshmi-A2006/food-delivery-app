const mongoose = require("mongoose");
const seedDatabase = require("./seed");

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected successfully.");
        // Seed database once connected
        await seedDatabase();
    } catch (error) {
        console.error("MongoDB Connection Failed! Falling back to Mock Database.");
        console.error(`Error details: ${error.message}`);
        // Do NOT call process.exit(1) so the server can run on mock data fallback
    }
};

module.exports = connectDB;