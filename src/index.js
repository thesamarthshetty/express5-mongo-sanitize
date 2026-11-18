import { sanitize, has } from 'express-mongo-sanitize'

const TARGETS = ['body', 'params', 'headers']

/**
 * Express 5-compatible replacement for `express-mongo-sanitize`'s middleware.
 *
 * The upstream middleware reassigns `req.query`, which is a getter-only property in
 * Express 5 and throws. `sanitize()` mutates in place, so body/params/headers are cleaned
 * directly. In Express 5 `req.query` is re-parsed from the URL on every access, so the
 * sanitized object is pinned onto the request as an own property.
 *
 * Works on Express 4 as well.
 *
 * @param {{ replaceWith?: string, allowDots?: boolean, dryRun?: boolean }} [options]
 *   Same options as `express-mongo-sanitize`.
 */
export const mongoSanitize =
  (options = {}) =>
  (req, res, next) => {
    for (const key of TARGETS) {
      if (req[key]) sanitize(req[key], options)
    }

    const query = req.query
    if (query) {
      sanitize(query, options)
      Object.defineProperty(req, 'query', {
        value: query,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    }

    next()
  }

export { sanitize, has }
export default mongoSanitize
