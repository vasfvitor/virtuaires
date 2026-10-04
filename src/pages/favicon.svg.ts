import type { APIRoute } from "astro";
import { moonIcon, moonPhase } from "../lib/sky";

// The Moon as of the build; a script in BaseHead brings the tab icon up to date
export const GET: APIRoute = () =>
  new Response(moonIcon(moonPhase(new Date())), {
    headers: { "Content-Type": "image/svg+xml" },
  });
