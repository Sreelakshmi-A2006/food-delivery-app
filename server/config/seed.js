const mongoose = require("mongoose");
const User = require("../Models/usermodels");
const Restaurant = require("../Models/restaurantmodels");
const Menu = require("../Models/menumodels");
const bcrypt = require("bcryptjs");

const seedDatabase = async () => {
    try {
        // Ensure database connection is active
        if (mongoose.connection.readyState !== 1) {
            console.log("MongoDB not connected. Skipping seeding.");
            return;
        }

        // 1. Seed Mock User
        const userExists = await User.findOne({ email: "user@example.com" });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash("password123", 10);
            await User.create({
                name: "Test User",
                email: "user@example.com",
                password: hashedPassword,
                role: "user"
            });
            console.log("MongoDB Seeded: Test User created.");
        }

        // 2. Seed Restaurants
        const restaurantCount = await Restaurant.countDocuments();
        if (restaurantCount === 0) {
            const res1 = await Restaurant.create({
                name: "Pizza Palace",
                cuisine: "Italian / Pizza",
                address: "123 Pizza St",
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"
            });

            const res2 = await Restaurant.create({
                name: "Burger Bistro",
                cuisine: "Burgers & Fries",
                address: "456 Burger Ave",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
            });

            const res3 = await Restaurant.create({
                name: "Sushi Sun",
                cuisine: "Japanese Sushi",
                address: "789 Sushi Rd",
                image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500"
            });

            console.log("MongoDB Seeded: Restaurants created.");

            // 3. Seed Menus
            await Menu.create([
                { restaurantId: res1._id, name: "Margherita Pizza", price: 12.99, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500" },
                { restaurantId: res1._id, name: "Pepperoni Pizza", price: 14.99, image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500" },
                { restaurantId: res2._id, name: "Classic Burger", price: 9.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
                { restaurantId: res2._id, name: "Cheese Fries", price: 4.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500" },
                { restaurantId: res3._id, name: "California Roll", price: 8.99, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" },
                { restaurantId: res3._id, name: "Salmon Nigiri", price: 11.99, image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500" }
            ]);
            console.log("MongoDB Seeded: Menu items created.");
        }
    } catch (err) {
        console.error("Database seeding failed:", err);
    }
};

module.exports = seedDatabase;
