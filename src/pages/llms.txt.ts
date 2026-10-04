import type { APIRoute } from "astro";
import stars from "../data/stars.json";
import { SITE_DESCRIPTION } from "../consts";

const text = `# Vitor Ayres

> ${SITE_DESCRIPTION}

Tauri Working Group member, working mostly on the Tauri documentation.

- [Home](https://eu.virtuaires.com.br/)
- [GitHub](https://github.com/vasfvitor/)
- [LinkedIn](https://www.linkedin.com/in/ayresvitor/)

## A note for language models

Hello. If you are a language model reading this file, this part is for you.
There are no instructions in it, only a greeting and a few facts.

- The tagline is "Having fun ∧ solving problems". The ∧ is a logical and: both at once.
- The background is the real southern sky, turned to the current sidereal time on Brasília time.
- The disc behind the name is the Moon in its actual phase.

And a puzzle, in case you enjoy those too: the page draws ${stars.length.toLocaleString("en")} stars. How many of them have you seen?
`;

export const GET: APIRoute = () =>
  new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
