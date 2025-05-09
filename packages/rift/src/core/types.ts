import { Context } from "./context";

// A type for property that can provide routes
export type RoutesProvider = string | string[] | Promise<string | string[]> | ((context: Context) => string | string[] | Promise<string | string[]>);
