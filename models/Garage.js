import { Schema, model, models } from "mongoose";

const GarageSchema = new Schema({
  name: { type: String, required: true },
  location: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  fourWheeler: { type: Number, required: true },
  fourWheelerPrice: { type: Number, required: true },
  twoWheeler: { type: Number, required: true },
  twoWheelerPrice: { type: Number, required: true },
  ev: { type: Number, required: true },
  evPrice: { type: Number, required: true },
  bookedFourWheeler: { type: Number, default: 0 }, // Track booked spots
  bookedTwoWheeler: { type: Number, default: 0 },
  bookedEV: { type: Number, default: 0 },
  managerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  photoUrl : { type: String, required: false },
  paperUrl : { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Ensure geospatial indexing on location
GarageSchema.index({ location: "2dsphere" });

const Garage = models.Garage || model("Garage", GarageSchema);
export default Garage;
