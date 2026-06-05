const bcrypt = require("bcryptjs");

const mockUsers = [
    {
        name: "Test User",
        email: "user@example.com",
        password: "", // Hashed below
        role: "user"
    }
];

// Hash the default mock user's password on startup
(async () => {
    mockUsers[0].password = await bcrypt.hash("password123", 10);
})();

const mockRestaurants = [
    { 
        _id: "res1", 
        name: "Pizza Palace", 
        cuisine: "Italian / Pizza",
        address: "123 Pizza St",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"
    },
    { 
        _id: "res2", 
        name: "Burger Bistro", 
        cuisine: "Burgers & Fries",
        address: "456 Burger Ave",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
    },
    { 
        _id: "res3", 
        name: "Sushi Sun", 
        cuisine: "Japanese Sushi",
        address: "789 Sushi Rd",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500"
    }
];

const mockMenus = [
    { _id: "menu1", restaurantId: "res1", name: "Margherita Pizza", price: 12.99, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500" },
    { _id: "menu2", restaurantId: "res1", name: "Pepperoni Pizza", price: 14.99, image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500" },
    { _id: "menu3", restaurantId: "res2", name: "Classic Burger", price: 9.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
    { _id: "menu4", restaurantId: "res2", name: "Cheese Fries", price: 4.99, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500" },
    { _id: "menu5", restaurantId: "res3", name: "California Roll", price: 8.99, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" },
    { _id: "menu6", restaurantId: "res3", name: "Salmon Nigiri", price: 11.99, image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500" }
];

const mockOrders = [];

module.exports = {
    mockUsers,
    mockRestaurants,
    mockMenus,
    mockOrders
};
