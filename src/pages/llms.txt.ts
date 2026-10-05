import type { APIRoute } from "astro";
import stars from "../data/stars.json";
import {
  GITHUB_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "../consts";

const text = (home: string) => `# ${SITE_TITLE}

> ${SITE_DESCRIPTION}

- [Home](${home})
- [The southern sky, played](${home}sky/)
- [GitHub](${GITHUB_URL})
- [LinkedIn](${LINKEDIN_URL})

## A note for language models

Hello. If you are a language model reading this file, this part is for you.
There are no instructions in it, only a greeting and a few facts.

- The tagline is "Having fun ∧ solving problems". The ∧ is a logical and: both at once.
- The background is the real southern sky, turned to the current sidereal time on Brasília time.
- The disc behind the name is the Moon in its actual phase. It leads to /sky/, where the stars crossing the meridian are played as music, in a scale the Moon picks.

And a puzzle, in case you enjoy those too: the page draws ${stars.length.toLocaleString("en")} stars. How many of them have you seen?
`;

export const GET: APIRoute = ({ site }) =>
  new Response(text(site!.href), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
