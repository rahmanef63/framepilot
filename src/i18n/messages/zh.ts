import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_ZH } from "./areas";
import { FIXUPS } from "./fixups";

export const zh: Dict = { ...COMMON.zh, ...SHELL.zh, ...AREAS_ZH, ...FIXUPS.zh };
