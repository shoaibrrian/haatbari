import { created } from "@/lib/http/response";
import { withRoute } from "@/lib/http/with-route";
import readJson from "@/lib/http/read-json";
import { registerUser } from "@/modules/user/user.service";

export const POST = withRoute(
  async (request) => {
    const input = await readJson(request);

    const user = await registerUser(input);

    return created({
      user,
    });
  },
  { name: "POST /api/auth/register" },
);
