import { ok } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import readJson from "@/lib/http/read-json";
import { loginUser } from "@/modules/user/user.service";

export const POST = withRoute(
  async (request) => {
    const input = await readJson(request);

    const user = await loginUser(input);

    return ok({
      user,
    });
  },
  { name: "POST /api/auth/login" },
);
