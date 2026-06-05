import React, { useEffect, useState } from "react";
import api from "../Services/api";

function Home({ addToCart, cart }) {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [addedItemFeedback, setAddedItemFeedback] = useState(null);

    useEffect(() => {
        setLoading(true);
        api.get("/restaurants")
            .then((res) => {
                setRestaurants(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching restaurants:", err);
                setLoading(false);
            });
    }, []);

    const handleViewMenu = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        setMenuLoading(true);
        try {
            const res = await api.get(`/restaurants/${restaurant._id}/menu`);
            setMenuItems(res.data);
        } catch (err) {
            console.error("Error fetching menu items:", err);
        } finally {
            setMenuLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        addToCart(item);
        setAddedItemFeedback(item._id);
        setTimeout(() => {
            setAddedItemFeedback(null);
        }, 1500);
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="text-center my-5 py-5">
                <div className="spinner-border text-warning" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mt-3 text-muted">Discovering Best Kitchens Near You...</h4>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            {!selectedRestaurant && (
                <div className="p-5 mb-4 bg-dark rounded-4 text-white shadow-lg position-relative overflow-hidden" style={{
                    backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "300px",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <div className="container-fluid py-3 position-relative z-1">
                        <span className="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill mb-3">5 STAR CUISINE</span>
                        <h1 className="display-4 fw-extrabold text-white mb-2">Delicious Food, Delivered Fast</h1>
                        <p className="fs-5 text-light-50 mb-4 col-md-8">Browse local restaurants, select your favorite dishes, and experience the best food delivery service in town.</p>
                        
                        {/* Search Bar */}
                        <div className="col-md-6">
                            <div className="input-group shadow-sm">
                                <span className="input-group-text bg-white border-0 py-2.5">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 py-2.5 ps-1"
                                    placeholder="Search by restaurant name or cuisine..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Listing View */}
            {selectedRestaurant ? (
                <div>
                    {/* Header bar back to list */}
                    <div className="d-flex align-items-center mb-4">
                        <button className="btn btn-outline-secondary rounded-pill px-4 me-3" onClick={() => setSelectedRestaurant(null)}>
                            <i className="bi bi-arrow-left me-1"></i> Back to Restaurants
                        </button>
                    </div>

                    {/* Restaurant Banner */}
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5">
                        <div style={{
                            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url('${selectedRestaurant.image || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: "250px",
                            display: "flex",
                            alignItems: "flex-end",
                            color: "white",
                            padding: "2rem"
                        }}>
                            <div>
                                <span className="badge bg-warning text-dark fw-bold px-2.5 py-1.5 rounded-pill mb-2">{selectedRestaurant.cuisine}</span>
                                <h1 className="fw-bold m-0">{selectedRestaurant.name}</h1>
                                <p className="m-0 text-light opacity-75 mt-1"><i className="bi bi-geo-alt-fill me-1"></i>{selectedRestaurant.address || "Main Street Cafe Area"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items Title */}
                    <h3 className="fw-bold mb-4 text-dark d-flex align-items-center">
                        <i className="bi bi-journal-richtext text-warning me-2"></i> Our Menu
                    </h3>

                    {/* Menu Items List */}
                    {menuLoading ? (
                        <div className="text-center my-5 py-5">
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">Loading Menu...</span>
                            </div>
                            <p className="mt-2 text-muted">Fetching yummy dishes...</p>
                        </div>
                    ) : menuItems.length > 0 ? (
                        <div className="row g-4">
                            {menuItems.map((item) => {
                                const cartItem = cart.find(ci => ci._id === item._id);
                                return (
                                    <div className="col-md-6 col-lg-4" key={item._id}>
                                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                                            <img
                                                src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"}
                                                className="card-img-top"
                                                alt={item.name}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <div className="card-body p-4 d-flex flex-column">
                                                <h5 className="card-title fw-bold text-dark">{item.name}</h5>
                                                <h4 className="fw-extrabold text-warning mb-3">${item.price.toFixed(2)}</h4>
                                                
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className={`btn mt-auto w-100 py-2 rounded-3 fw-semibold transition-all ${
                                                        addedItemFeedback === item._id
                                                            ? "btn-success"
                                                            : "btn-warning text-dark"
                                                    }`}
                                                >
                                                    {addedItemFeedback === item._id ? (
                                                        <>
                                                            <i className="bi bi-check-lg me-1"></i> Added to Cart!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-plus-lg me-1"></i> Add to Cart
                                                            {cartItem && ` (${cartItem.quantity})`}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="alert alert-info rounded-3 text-center py-4" role="alert">
                            <i className="bi bi-info-circle-fill fs-2 mb-2 d-block text-warning"></i>
                            No menu items found for this restaurant.
                        </div>
                    )}
                </div>
            ) : (
                /* Restaurants Grid View */
                <div>
                    <h3 className="fw-bold mb-4 text-dark d-flex align-items-center">
                        <i className="bi bi-shop text-warning me-2"></i> Popular Restaurants
                    </h3>

                    {filteredRestaurants.length > 0 ? (
                        <div className="row g-4">
                            {filteredRestaurants.map((r) => (
                                <div className="col-md-6 col-lg-4" key={r._id}>
                                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover" style={{ cursor: "pointer" }} onClick={() => handleViewMenu(r)}>
                                        <img
                                            src={r.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500"}
                                            className="card-img-top"
                                            alt={r.name}
                                            style={{ height: "180px", objectFit: "cover" }}
                                        />
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title fw-bold text-dark m-0">{r.name}</h5>
                                                <span className="badge bg-light text-warning border fw-bold d-flex align-items-center">
                                                    <i className="bi bi-star-fill me-1"></i> 4.5
                                                </span>
                                            </div>
                                            <p className="text-secondary mb-3">{r.cuisine}</p>
                                            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                    <i className="bi bi-truck me-1"></i> Free Delivery
                                                </span>
                                                <span className="text-warning fw-bold" style={{ fontSize: "0.9rem" }}>
                                                    View Menu <i className="bi bi-chevron-right ms-0.5"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                            <h5 className="text-dark fw-bold">No restaurants found matching your query</h5>
                            <p className="text-muted">Try looking for general terms like "Pizza" or "Burger".</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Home;