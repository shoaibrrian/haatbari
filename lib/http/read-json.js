import { ValidationError } from "../errors/app-error.js";

export default async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
}
