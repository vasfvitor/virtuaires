// The sky page's facts as of the moment they are asked for, for language
// models and other programs that read the page without running its script.
// Cloudflare Pages runs this file and serves it at /sky.json

import stars from "../src/data/stars.json";
import { skyFacts, type Star } from "../src/lib/sky";

export const onRequest = () => {
  const now = new Date();
  return Response.json(
    {
      page: "https://eu.virtuaires.com.br/sky/",
      at: now.toISOString(),
      place: "Brasília, Brazil, 15.8° S 47.9° W",
      ...skyFacts(now, stars as Star[]),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
