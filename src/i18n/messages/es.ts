import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_ES } from "./areas";

export const es: Dict = { ...COMMON.es, ...SHELL.es, ...AREAS_ES };
