import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./model/User.js";
import Product from "./model/Product.js";
import Cart from "./model/Cart.js";
import Order from "./model/Order.js";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS configuration for the Angular development servers.
const allowedOrigins = new Set(["http://localhost:4200", "http://localhost:3000"]);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/loginApp";

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: "error", message: "Database is not connected. Start MongoDB and try again." });
  }
  next();
};

// Register API
app.post("/api/register", requireDatabase, async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    // Validation
    if (!name || !email || !mobile || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required" });
    }

    // Check if user already exists
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !/^\d{10}$/.test(String(mobile)) || password.length < 8) {
      return res.status(400).json({ status: "error", message: "Please enter valid account details" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "User already exists" });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      mobile: String(mobile),
      password: hashedPassword,
    });

    // Success response
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
});

// Login API: passwords are compared against the bcrypt hash stored in MongoDB.
app.post("/api/login", requireDatabase, async (req, res) => {
  try {
    const email = req.body?.email?.toLowerCase().trim();
    const password = req.body?.password;
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    const isPasswordValid = user && await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Incorrect email or password" });
    }

    return res.json({
      status: "success",
      message: `Welcome back, ${user.name.split(" ")[0]}!`,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.get("/api/users/:userId/addresses", requireDatabase, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ status: "error", message: "Invalid user" });
    const user = await User.findById(req.params.userId).select('addresses');
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });
    return res.json({ status: "success", addresses: user.addresses || [] });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Could not load saved addresses" });
  }
});

app.post("/api/users/:userId/addresses", requireDatabase, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ status: "error", message: "Invalid user" });
    const address = req.body?.address;
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    if (!address || requiredFields.some((field) => !String(address[field] || '').trim())) {
      return res.status(400).json({ status: "error", message: "Complete address details are required" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });
    const makeDefault = Boolean(address.isDefault) || !user.addresses.length;
    if (makeDefault) user.addresses.forEach((item) => { item.isDefault = false; });
    const existing = user.addresses.find((item) => item.address === address.address && item.zip === address.zip);
    if (existing) Object.assign(existing, { ...address, isDefault: makeDefault || existing.isDefault });
    else user.addresses.push({ ...address, isDefault: makeDefault });
    await user.save();
    return res.status(201).json({ status: "success", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Could not save address" });
  }
});

// Product catalogue: seed it once from the Angular app and read it from MongoDB.
app.get("/api/products", async (_req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    return res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ status: "error", message: "Could not load products" });
  }
});

app.post("/api/products/seed", async (req, res) => {
  try {
    const products = req.body?.products;
    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ status: "error", message: "Products are required" });
    }

    const existingCount = await Product.countDocuments();
    if (!existingCount) {
      await Product.insertMany(products, { ordered: false });
    }

    const savedProducts = await Product.find().sort({ id: 1 });
    return res.status(201).json(savedProducts);
  } catch (error) {
    console.error("Seed Products Error:", error);
    return res.status(500).json({ status: "error", message: "Could not save products" });
  }
});

// Anonymous carts are stored by a browser-generated client ID.
app.get("/api/carts/:clientId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ clientId: req.params.clientId });
    return res.json(cart ?? { clientId: req.params.clientId, items: [] });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({ status: "error", message: "Could not load cart" });
  }
});

app.put("/api/carts/:clientId", async (req, res) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      return res.status(400).json({ status: "error", message: "Cart items must be an array" });
    }

    const cart = await Cart.findOneAndUpdate(
      { clientId: req.params.clientId },
      { clientId: req.params.clientId, items },
      { new: true, upsert: true, runValidators: true },
    );
    return res.json(cart);
  } catch (error) {
    console.error("Save Cart Error:", error);
    return res.status(500).json({ status: "error", message: "Could not save cart" });
  }
});

app.post("/api/orders", requireDatabase, async (req, res) => {
  try {
    const { clientId, userId, items, shipping, payment } = req.body;
    if (!clientId || !Array.isArray(items) || !items.length || !shipping || !payment) {
      return res.status(400).json({ status: "error", message: "Order, shipping, and payment details are required" });
    }

    const productIds = items.map((item) => item.product?.id).filter(Number.isFinite);
    const products = await Product.find({ id: { $in: productIds } });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const orderItems = items.map((item) => {
      const product = productsById.get(item.product?.id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1) throw new Error("Invalid cart item");
      return { productId: product.id, name: product.name, image: product.image, quantity, unitPrice: product.price };
    });

    const subtotal = Number(orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2));
    const shippingAmount = subtotal > 0 ? 10 : 0;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + shippingAmount + tax).toFixed(2));
    const user = userId && mongoose.isValidObjectId(userId) ? await User.findById(userId).select('_id') : null;
    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId, userId: user?._id, items: orderItems, shipping,
      payment: { method: payment.method, last4: payment.last4 },
      subtotal, shippingAmount, tax, total,
    });
    return res.status(201).json({ status: "success", order });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(400).json({ status: "error", message: "Could not place order" });
  }
});

// Profile order history: orders remain in MongoDB and are loaded after reopening the app.
app.get("/api/users/:userId/orders", requireDatabase, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ status: "error", message: "Invalid user" });
    }
    const user = await User.findById(req.params.userId).select('email');
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });

    // The email fallback also shows orders created before userId was added to the order schema.
    const orders = await Order.find({
      $or: [{ userId: user._id }, { 'shipping.email': user.email }],
    }).sort({ createdAt: -1 });
    return res.json({ status: "success", orders });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({ status: "error", message: "Could not load orders" });
  }
});

app.get("/api/orders/:orderNumber", requireDatabase, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ status: "error", message: "Order not found" });
    return res.json({ status: "success", order });
  } catch (error) {
    console.error("Get Order Error:", error);
    return res.status(500).json({ status: "error", message: "Could not load order" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:4200`);
});
