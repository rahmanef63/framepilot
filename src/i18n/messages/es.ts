import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_ES } from "./areas";
import { FIXUPS } from "./fixups";

export const es: Dict = { ...COMMON.es, ...SHELL.es, ...AREAS_ES, ...FIXUPS.es };
