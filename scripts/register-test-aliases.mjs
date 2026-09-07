import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./test-alias-hooks.mjs", import.meta.url);
