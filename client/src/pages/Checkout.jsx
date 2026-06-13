import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../Services/api";

function Checkout({ clearCart }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");
    const amount = amountParam ? parseFloat(amountParam) : 0;

    const [activeTab, setActiveTab] = useState("card"); // card, upi, netbanking
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [txnDetails, setTxnDetails] = useState(null);

    // Form inputs
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");

    const [upiId, setUpiId] = useState("");
    const [selectedBank, setSelectedBank] = useState("");

    // Simulated payment processing steps
    const [processingStep, setProcessingStep] = useState(0);
    const steps = [
        "Initiating secure handshake with payment gateway...",
        "Validating account credentials and funds availability...",
        "Encrypting transaction payload with 256-bit AES...",
        "Waiting for card-issuing bank authorization...",
        "Finalizing transaction and updating order database..."
    ];

    useEffect(() => {
        if (!orderId || amount <= 0) {
            setError("Invalid checkout session. Please re-try from the cart page.");
        }
    }, [orderId, amount]);

    // Format card number as 1111 2222 3333 4444
    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 16);
        const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
        setCardNumber(formatted);
    };

    // Format card expiry as MM/YY
    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + "/" + val.slice(2);
        }
        setCardExpiry(val);
    };

    // Submit payment
    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Basic Front-end validations
        if (activeTab === "card") {
            const cleanNum = cardNumber.replace(/\s/g, "");
            if (cleanNum.length !== 16) {
                setError("Please enter a valid 16-digit card number.");
                return;
            }
            if (!cardName.trim()) {
                setError("Please enter the cardholder's name.");
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                setError("Please enter expiration date in MM/YY format.");
                return;
            }
            if (cardCvv.length !== 3) {
                setError("Please enter a valid 3-digit CVV.");
                return;
            }
        } else if (activeTab === "upi") {
            if (!upiId.includes("@") || upiId.length < 5) {
                setError("Please enter a valid UPI ID (e.g. username@bank).");
                return;
            }
        } else if (activeTab === "netbanking") {
            if (!selectedBank) {
                setError("Please select a bank to proceed.");
                return;
            }
        }

        // Run mock processing simulation
        setSubmitting(true);
        setProcessingStep(0);

        // Advance through steps
        const stepInterval = setInterval(() => {
            setProcessingStep((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                } else {
                    clearInterval(stepInterval);
                    return prev;
                }
            });
        }, 1100);

        // After all steps, hit backend to confirm payment
        setTimeout(async () => {
            try {
                const generatedTxnId = "TXN-" + Math.floor(1000000000 + Math.random() * 9000000000);
                const paymentMethodLabel = 
                    activeTab === "card" ? "Credit/Debit Card" :
                    activeTab === "upi" ? `UPI (${upiId || "QR Code Scan"})` :
                    `Net Banking (${selectedBank})`;

                const response = await api.post("/orders/confirm-payment", {
                    orderId,
                    paymentMethod: paymentMethodLabel,
                    transactionId: generatedTxnId
                });

                setTxnDetails({
                    txnId: generatedTxnId,
                    method: paymentMethodLabel,
                    orderId: orderId,
                    amount: amount
                });
                
                setSuccess(true);
                clearCart();
            } catch (err) {
                console.error("Payment confirmation failed:", err);
                setError(err.response?.data?.message || "Payment verification failed on the server. Please try again.");
            } finally {
                setSubmitting(false);
                clearInterval(stepInterval);
            }
        }, steps.length * 1100 + 400);
    };

    if (error && !submitting && !success) {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-6 text-center">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white border border-danger">
                        <i className="bi bi-exclamation-triangle-fill text-danger mb-4" style={{ fontSize: "4rem" }}></i>
                        <h4 className="fw-bold mb-3">Checkout Error</h4>
                        <div className="alert alert-danger mb-4">{error}</div>
                        <Link to="/cart" className="btn btn-warning py-2.5 rounded-3 fw-bold shadow-sm">
                            <i className="bi bi-arrow-left me-1"></i> Return to Cart
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-7 text-center">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white">
                        <div className="mb-4">
                            <div className="spinner-border text-warning" role="status" style={{ width: "4rem", height: "4rem" }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <h3 className="fw-extrabold text-dark mb-2">Processing Your Payment</h3>
                        <p className="text-muted mb-4">Please do not refresh this page or click back.</p>

                        <div className="text-start mx-auto p-4 bg-light rounded-4 border" style={{ maxWidth: "480px" }}>
                            <h6 className="fw-bold mb-3 d-flex align-items-center text-secondary">
                                <i className="bi bi-shield-lock-fill text-success me-2"></i> Secure Transaction Progress
                            </h6>
                            <ul className="list-unstyled mb-0">
                                {steps.map((step, idx) => (
                                    <li key={idx} className={`d-flex align-items-center mb-2.5 transition-all ${
                                        idx < processingStep ? "text-success fw-medium" :
                                        idx === processingStep ? "text-dark fw-bold" :
                                        "text-muted opacity-50"
                                    }`} style={{ fontSize: "0.9rem" }}>
                                        {idx < processingStep ? (
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                        ) : idx === processingStep ? (
                                            <span className="spinner-border spinner-border-sm text-warning me-2" role="status"></span>
                                        ) : (
                                            <i className="bi bi-circle me-2"></i>
                                        )}
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success && txnDetails) {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-7 text-center">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white">
                        <div className="mb-4">
                            <i className="bi bi-patch-check-fill text-success" style={{ fontSize: "5rem" }}></i>
                        </div>
                        <h2 className="fw-extrabold text-dark mb-1">Payment Successful!</h2>
                        <p className="text-muted fs-5 mb-4">Thank you! Your order is now confirmed.</p>

                        <div className="bg-light p-4 rounded-4 text-start mb-4 border mx-auto" style={{ maxWidth: "480px" }}>
                            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                <h6 className="fw-bold mb-0 text-dark">Payment Details</h6>
                                <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle px-2 py-1">PAID</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 text-secondary" style={{ fontSize: "0.9rem" }}>
                                <span>Transaction ID:</span>
                                <strong className="text-dark font-monospace">{txnDetails.txnId}</strong>
                            </div>
                            <div className="d-flex justify-content-between py-1 text-secondary" style={{ fontSize: "0.9rem" }}>
                                <span>Payment Method:</span>
                                <strong className="text-dark">{txnDetails.method}</strong>
                            </div>
                            <div className="d-flex justify-content-between py-1 text-secondary" style={{ fontSize: "0.9rem" }}>
                                <span>Order ID:</span>
                                <strong className="text-dark font-monospace">{txnDetails.orderId}</strong>
                            </div>
                            <div className="d-flex justify-content-between pt-2 border-top mt-2 text-dark font-semibold">
                                <span className="fw-bold">Amount Paid:</span>
                                <strong className="fs-5 text-warning fw-extrabold">${txnDetails.amount.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="d-grid gap-2 col-md-8 mx-auto">
                            <Link to="/orders" className="btn btn-warning py-2.5 rounded-3 fw-bold shadow-sm">
                                <i className="bi bi-clock-history me-1.5"></i> Track My Orders
                            </Link>
                            <Link to="/" className="btn btn-outline-secondary py-2.5 rounded-3 fw-medium">
                                <i className="bi bi-house-door me-1.5"></i> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row g-4 justify-content-center py-3">
            <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <h3 className="fw-extrabold mb-1 text-dark">Secure Payment Gateway</h3>
                    <p className="text-muted mb-4">Select your payment method below to complete the order.</p>

                    {/* Navigation Tabs */}
                    <ul className="nav nav-pills nav-fill bg-light p-1.5 rounded-3 mb-4 border">
                        <li className="nav-item">
                            <button
                                className={`nav-link py-2.5 fw-bold rounded-2 border-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === "card" ? "bg-warning text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                                onClick={() => setActiveTab("card")}
                            >
                                <i className="bi bi-credit-card-2-back-fill"></i> Credit/Debit Card
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link py-2.5 fw-bold rounded-2 border-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === "upi" ? "bg-warning text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                                onClick={() => setActiveTab("upi")}
                            >
                                <i className="bi bi-phone-vibrate-fill"></i> UPI Pay
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link py-2.5 fw-bold rounded-2 border-0 d-flex align-items-center justify-content-center gap-2 ${activeTab === "netbanking" ? "bg-warning text-dark shadow-sm" : "text-secondary bg-transparent"}`}
                                onClick={() => setActiveTab("netbanking")}
                            >
                                <i className="bi bi-bank2"></i> Net Banking
                            </button>
                        </li>
                    </ul>

                    {error && (
                        <div className="alert alert-danger rounded-3 d-flex align-items-center mb-4" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Active Form */}
                    <form onSubmit={handlePaymentSubmit}>
                        {activeTab === "card" && (
                            <div>
                                {/* Virtual Card Preview */}
                                <div className="card-preview mb-4 position-relative text-white rounded-4 shadow p-4 overflow-hidden" style={{
                                    background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                                    height: "210px",
                                    maxWidth: "360px",
                                    margin: "0 auto",
                                    border: "1px solid rgba(255,255,255,0.08)"
                                }}>
                                    <div className="mb-4 d-flex justify-content-between align-items-center">
                                        <div style={{
                                            width: "45px",
                                            height: "32px",
                                            background: "linear-gradient(135deg, #fce38a 0%, #f38181 100%)",
                                            borderRadius: "6px"
                                        }}></div>
                                        <div className="fs-6 fw-bold tracking-widest text-warning font-monospace">METRO BANK</div>
                                    </div>
                                    <div className="fs-4 tracking-widest fw-bold mb-4 font-monospace py-1 text-center">
                                        {cardNumber || "•••• •••• •••• ••••"}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-end">
                                        <div className="text-start">
                                            <small className="text-white-50 d-block uppercase" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>CARD HOLDER</small>
                                            <span className="fw-semibold text-truncate d-inline-block text-uppercase" style={{ maxWidth: "180px", fontSize: "0.9rem" }}>{cardName || "YOUR NAME"}</span>
                                        </div>
                                        <div className="text-end">
                                            <small className="text-white-50 d-block uppercase" style={{ fontSize: "0.65rem", letterSpacing: "1px" }}>EXPIRES</small>
                                            <span className="fw-semibold text-uppercase" style={{ fontSize: "0.9rem" }}>{cardExpiry || "MM/YY"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-bold text-dark text-start d-block" style={{ fontSize: "0.85rem" }}>Cardholder Name</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 py-2.5 border-secondary-subtle"
                                            placeholder="Enter cardholder full name"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold text-dark text-start d-block" style={{ fontSize: "0.85rem" }}>Card Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-secondary-subtle"><i className="bi bi-credit-card"></i></span>
                                            <input
                                                type="text"
                                                className="form-control rounded-end-3 py-2.5 border-secondary-subtle font-monospace"
                                                placeholder="4000 1234 5678 9010"
                                                value={cardNumber}
                                                onChange={handleCardNumberChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold text-dark text-start d-block" style={{ fontSize: "0.85rem" }}>Expiration Date</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 py-2.5 border-secondary-subtle font-monospace text-center"
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold text-dark text-start d-block" style={{ fontSize: "0.85rem" }}>CVV</label>
                                        <input
                                            type="password"
                                            className="form-control rounded-3 py-2.5 border-secondary-subtle font-monospace text-center"
                                            placeholder="•••"
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "upi" && (
                            <div className="text-center py-2">
                                <div className="row g-4 align-items-center">
                                    <div className="col-md-5 d-flex flex-column align-items-center border-end-md pb-3 pb-md-0">
                                        {/* Dynamic SVG QR Code */}
                                        <div className="bg-white p-3 rounded-4 shadow-sm border border-light-subtle mb-3 d-inline-block">
                                            <svg width="150" height="150" viewBox="0 0 100 100" style={{ shapeRendering: "crispEdges" }}>
                                                {/* Outer Corners */}
                                                <rect x="0" y="0" width="30" height="30" fill="#111827" />
                                                <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                                                <rect x="10" y="10" width="10" height="10" fill="#111827" />

                                                <rect x="70" y="0" width="30" height="30" fill="#111827" />
                                                <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                                                <rect x="80" y="10" width="10" height="10" fill="#111827" />

                                                <rect x="0" y="70" width="30" height="30" fill="#111827" />
                                                <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                                                <rect x="10" y="80" width="10" height="10" fill="#111827" />

                                                {/* Simulated QR Modules */}
                                                <rect x="40" y="0" width="5" height="10" fill="#111827" />
                                                <rect x="50" y="5" width="10" height="5" fill="#111827" />
                                                <rect x="45" y="15" width="15" height="5" fill="#111827" />
                                                <rect x="35" y="25" width="5" height="5" fill="#111827" />
                                                
                                                <rect x="0" y="40" width="10" height="5" fill="#111827" />
                                                <rect x="15" y="45" width="5" height="15" fill="#111827" />
                                                <rect x="5" y="55" width="5" height="5" fill="#111827" />
                                                
                                                <rect x="40" y="40" width="20" height="20" fill="#111827" />
                                                <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                                                
                                                <rect x="75" y="40" width="5" height="10" fill="#111827" />
                                                <rect x="90" y="45" width="10" height="5" fill="#111827" />
                                                <rect x="80" y="55" width="5" height="15" fill="#111827" />

                                                <rect x="45" y="70" width="10" height="5" fill="#111827" />
                                                <rect x="35" y="80" width="5" height="10" fill="#111827" />
                                                <rect x="55" y="85" width="15" height="5" fill="#111827" />
                                                <rect x="80" y="80" width="10" height="10" fill="#111827" />
                                            </svg>
                                        </div>
                                        <h6 className="fw-bold mb-1">Scan QR Code</h6>
                                        <p className="text-muted mb-0 small px-2">Scan with GPay, PhonePe, Paytm, or any banking app to pay instantly.</p>
                                    </div>
                                    
                                    <div className="col-md-7 text-start">
                                        <div className="ps-md-3">
                                            <h6 className="fw-bold mb-2">Or Pay via UPI ID</h6>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small mb-1">UPI VPA (Virtual Payment Address)</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-secondary-subtle">
                                                        <i className="bi bi-upc-scan"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control py-2.5 border-secondary-subtle"
                                                        placeholder="example@okaxis"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-text text-muted small mt-1.5">Enter your UPI ID and click make payment. A request will be simulated on your UPI App.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "netbanking" && (
                            <div className="text-start py-2">
                                <h6 className="fw-bold mb-3">Select Your Bank</h6>
                                <div className="row g-3 mb-4">
                                    {[
                                        { id: "sbi", name: "State Bank of India", logo: "bi-bank" },
                                        { id: "hdfc", name: "HDFC Bank", logo: "bi-building-fill" },
                                        { id: "icici", name: "ICICI Bank", logo: "bi-credit-card-fill" },
                                        { id: "axis", name: "Axis Bank", logo: "bi-wallet2" }
                                    ].map((bank) => (
                                        <div className="col-sm-6" key={bank.id}>
                                            <div 
                                                className={`card p-3 rounded-3 cursor-pointer border hover-shadow transition-all ${selectedBank === bank.name ? "border-warning bg-warning-subtle text-dark fw-bold" : "border-light-subtle bg-white text-secondary"}`}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setSelectedBank(bank.name)}
                                            >
                                                <div className="d-flex align-items-center gap-3">
                                                    <i className={`bi ${bank.logo} fs-3 text-warning`}></i>
                                                    <div>{bank.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label text-muted small mb-1">Or search other banks</label>
                                    <select 
                                        className="form-select py-2.5 border-secondary-subtle"
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                    >
                                        <option value="">-- Choose Bank --</option>
                                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                        <option value="Punjab National Bank">Punjab National Bank</option>
                                        <option value="Bank of Baroda">Bank of Baroda</option>
                                        <option value="Union Bank of India">Union Bank of India</option>
                                        <option value="Canara Bank">Canara Bank</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <hr className="my-4" />

                        {/* Pay button */}
                        <button
                            type="submit"
                            className="btn btn-warning w-100 py-3 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                        >
                            <i className="bi bi-shield-fill-check me-2"></i> Pay ${amount.toFixed(2)} Securely
                        </button>
                    </form>
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-start">
                    <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom">Checkout Summary</h5>
                    <div className="d-flex justify-content-between mb-2 text-secondary" style={{ fontSize: "0.9rem" }}>
                        <span>Order ID</span>
                        <span className="font-monospace text-dark text-truncate ps-3" style={{ maxWidth: "180px" }}>{orderId}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-secondary" style={{ fontSize: "0.9rem" }}>
                        <span>Total Items</span>
                        <span className="fw-medium text-dark">Cart items</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2.5 border-top mb-0">
                        <span className="fw-bold text-dark">Amount Payable</span>
                        <span className="fw-extrabold text-warning fs-5">${amount.toFixed(2)}</span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-light rounded-3 border">
                        <small className="text-secondary d-flex gap-2">
                            <i className="bi bi-shield-fill-lock fs-5 text-success"></i>
                            <span>This is a secure checkout simulator. Your simulated card/account credentials are not saved or verified externally.</span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
