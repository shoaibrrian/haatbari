import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [60, "First name is too long"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [60, "Last name is too long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      maxlength: [120, "Email is too long"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address is too long"],
      default: "",
    },

    clerkUserId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["buyer", "admin"],
      default: "buyer",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString();

    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;

    return ret;
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
