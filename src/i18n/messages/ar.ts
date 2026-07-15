import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_AR } from "./areas";

export const ar: Dict = { ...COMMON.ar, ...SHELL.ar, ...AREAS_AR };
