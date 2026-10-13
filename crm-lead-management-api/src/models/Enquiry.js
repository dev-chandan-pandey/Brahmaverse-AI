import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    courseInterest: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Optimize the unclaimed-leads query.
enquirySchema.index({ claimedBy: 1, createdAt: -1 });

// Optimize a counselor's claimed-leads query.
enquirySchema.index({ claimedBy: 1, createdAt: -1, _id: -1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;