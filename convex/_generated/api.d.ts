/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles from "../articles.js";
import type * as files from "../files.js";
import type * as issues from "../issues.js";
import type * as lib_roleGuard from "../lib/roleGuard.js";
import type * as manuscriptLifecycle from "../manuscriptLifecycle.js";
import type * as papers from "../papers.js";
import type * as seed from "../seed.js";
import type * as statusHistory from "../statusHistory.js";
import type * as submissions from "../submissions.js";
import type * as templates from "../templates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  articles: typeof articles;
  files: typeof files;
  issues: typeof issues;
  "lib/roleGuard": typeof lib_roleGuard;
  manuscriptLifecycle: typeof manuscriptLifecycle;
  papers: typeof papers;
  seed: typeof seed;
  statusHistory: typeof statusHistory;
  submissions: typeof submissions;
  templates: typeof templates;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
