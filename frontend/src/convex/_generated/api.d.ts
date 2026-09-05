/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as boosts from "../boosts.js";
import type * as config from "../config.js";
import type * as content_achievements from "../content/achievements.js";
import type * as content_boosts from "../content/boosts.js";
import type * as content_couponTemplates from "../content/couponTemplates.js";
import type * as content_items from "../content/items.js";
import type * as content_lessons from "../content/lessons.js";
import type * as content_orderTemplates from "../content/orderTemplates.js";
import type * as content_quests from "../content/quests.js";
import type * as content_quizQuestions from "../content/quizQuestions.js";
import type * as content_workers from "../content/workers.js";
import type * as coupons from "../coupons.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lessons from "../lessons.js";
import type * as model_achievements from "../model/achievements.js";
import type * as model_boosts from "../model/boosts.js";
import type * as model_constants from "../model/constants.js";
import type * as model_energy from "../model/energy.js";
import type * as model_events from "../model/events.js";
import type * as model_hex from "../model/hex.js";
import type * as model_leaderboard from "../model/leaderboard.js";
import type * as model_ledger from "../model/ledger.js";
import type * as model_lessonSteps from "../model/lessonSteps.js";
import type * as model_lessons from "../model/lessons.js";
import type * as model_office from "../model/office.js";
import type * as model_orders from "../model/orders.js";
import type * as model_players from "../model/players.js";
import type * as model_quests from "../model/quests.js";
import type * as model_quizzes from "../model/quizzes.js";
import type * as model_skills from "../model/skills.js";
import type * as office from "../office.js";
import type * as orders from "../orders.js";
import type * as players from "../players.js";
import type * as quests from "../quests.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  admin: typeof admin;
  auth: typeof auth;
  boosts: typeof boosts;
  config: typeof config;
  "content/achievements": typeof content_achievements;
  "content/boosts": typeof content_boosts;
  "content/couponTemplates": typeof content_couponTemplates;
  "content/items": typeof content_items;
  "content/lessons": typeof content_lessons;
  "content/orderTemplates": typeof content_orderTemplates;
  "content/quests": typeof content_quests;
  "content/quizQuestions": typeof content_quizQuestions;
  "content/workers": typeof content_workers;
  coupons: typeof coupons;
  crons: typeof crons;
  http: typeof http;
  leaderboard: typeof leaderboard;
  lessons: typeof lessons;
  "model/achievements": typeof model_achievements;
  "model/boosts": typeof model_boosts;
  "model/constants": typeof model_constants;
  "model/energy": typeof model_energy;
  "model/events": typeof model_events;
  "model/hex": typeof model_hex;
  "model/leaderboard": typeof model_leaderboard;
  "model/ledger": typeof model_ledger;
  "model/lessonSteps": typeof model_lessonSteps;
  "model/lessons": typeof model_lessons;
  "model/office": typeof model_office;
  "model/orders": typeof model_orders;
  "model/players": typeof model_players;
  "model/quests": typeof model_quests;
  "model/quizzes": typeof model_quizzes;
  "model/skills": typeof model_skills;
  office: typeof office;
  orders: typeof orders;
  players: typeof players;
  quests: typeof quests;
  quizzes: typeof quizzes;
  seed: typeof seed;
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

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
