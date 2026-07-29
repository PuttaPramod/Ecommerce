import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    clientId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', index: true },
    items: { type: [orderItemSchema], required: true },
    shipping: {
      firstName: { type: String, required: true }, lastName: { type: String, required: true },
      email: { type: String, required: true }, phone: { type: String, required: true },
      address: { type: String, required: true }, city: { type: String, required: true },
      state: { type: String, required: true }, zip: { type: String, required: true },
    },
    payment: { method: { type: String, enum: ['card', 'debit'], required: true }, last4: { type: String, required: true } },
    subtotal: { type: Number, required: true, min: 0 }, shippingAmount: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 }, total: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'confirmed' },
  },
  { timestamps: true },
);

export default mongoose.model('Order', orderSchema);
