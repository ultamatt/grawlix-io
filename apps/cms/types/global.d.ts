/**
 * Declares the `strapi` runtime global that Strapi injects before executing
 * any plugin/extension code. TypeScript has no other way to know about it
 * because Strapi doesn't ship a global declaration in its own type definitions.
 *
 * Using `LoadedStrapi` (i.e. all optional service properties made required)
 * matches what is available after Strapi has fully booted and is running a
 * controller action.
 */
declare const strapi: import("@strapi/strapi/dist/Strapi").LoadedStrapi;
