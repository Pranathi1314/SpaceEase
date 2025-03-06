import { Schema, model, models } from "mongoose";

const ManagerRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const ManagerRequest = models.ManagerRequest || model('ManagerRequest', ManagerRequestSchema);
export default ManagerRequest;