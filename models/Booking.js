import { Schema, model, models } from "mongoose";

const BookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  garageId: { type: Schema.Types.ObjectId, ref: "Garage", required: true },
  vehicleType: { type: String, enum: ["fourWheeler", "twoWheeler", "ev"], required: true },
  duration: { type: Number, required: true }, // In hours
  startTime: { type: Date, default: Date.now }, // Booking start time
  endTime: { type: Date, required: true }, // Booking end time
  status: { type: String, enum: ["active", "completed"], default: "active" },
});

const Booking = models.Booking || model("Booking", BookingSchema);
export default Booking;
