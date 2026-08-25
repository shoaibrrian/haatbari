import connectDB from "./connect.js";

export default async function withTransaction(fn) {
  const connection = await connectDB();
  return connection.transaction(fn);
}
