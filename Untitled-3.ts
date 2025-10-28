import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String
});

export default mongoose.model("MenuItem", menuItemSchema);
