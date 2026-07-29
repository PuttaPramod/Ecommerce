import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('Cart', cartSchema);
