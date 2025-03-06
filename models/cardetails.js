import { Schema, model, models } from "mongoose";

const carDetailsSchema = new Schema({
    numberplate: {
        type: Number,
        required: true,
        unique: true,
    },
    size: {
        type: String,
        required: true,
        enum: ["Small", "Medium", "Large"], 
    },
    inParking: {
        type: Boolean,
        required: true,
        default: false,
    },
    parkingTime: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const CarDetails = models.CarDetails || model("CarDetails", carDetailsSchema);

export default CarDetails;
