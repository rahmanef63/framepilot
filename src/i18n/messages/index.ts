import type { Locale, Dict } from "../types";
import { id } from "./id";
import { en } from "./en";
import { es } from "./es";
import { zh } from "./zh";
import { ar } from "./ar";

export const MESSAGES: Record<Locale, Dict> = { id, en, es, zh, ar };
