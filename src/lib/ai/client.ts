import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Server-only: never import this module from a Client Component or expose the key via
// NEXT_PUBLIC_*. The `server-only` import throws a build error if that ever happens.
export const anthropic = new Anthropic();

export const EXPLORE_MODEL = "claude-opus-5";
