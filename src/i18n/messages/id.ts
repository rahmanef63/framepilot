import type { Dict } from "../types";
import { COMMON } from "./common";
import { SHELL } from "./shell";
import { AREAS_ID } from "./areas";
import { FIXUPS } from "./fixups";

export const id: Dict = { ...COMMON.id, ...SHELL.id, ...AREAS_ID, ...FIXUPS.id };
