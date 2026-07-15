import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_EN } from "./areas";

export const en: Dict = { ...COMMON.en, ...SHELL.en, ...AREAS_EN };
