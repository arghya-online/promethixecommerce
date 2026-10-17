import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentEvent extends Document {
  eventId: string;
  event: string;
  receivedAt: Date;
}

const paymentEventSchema = new Schema<IPaymentEvent>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    event: { type: String, required: true },
    receivedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

const PaymentEvent =
  mongoose.models.PaymentEvent ||
  mongoose.model<IPaymentEvent>("PaymentEvent", paymentEventSchema);

export default PaymentEvent;
