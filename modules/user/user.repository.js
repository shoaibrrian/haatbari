import connectDB from "../../lib/db/connect.js";
import User from "./user.model.js";

export async function createUser(data) {
  await connectDB();

  const user = await User.create(data);

  return user;
}

export async function findUserByEmail(email) {
  await connectDB();

  return User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+passwordHash");
}

export async function findUserById(id) {
  await connectDB();

  return User.findById(id);
}

export async function updateUserById(id, data) {
  await connectDB();

  return User.findByIdAndUpdate(
    id,
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );
}
