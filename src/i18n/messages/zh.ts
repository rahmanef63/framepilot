import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_ZH } from "./areas";

export const zh: Dict = { ...COMMON.zh, ...SHELL.zh, ...AREAS_ZH };
