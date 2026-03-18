import "@/lib/ensure-env"; // auth より先に env を読み込む
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
