# express5-mongo-sanitize

Express 5-compatible middleware that removes MongoDB operator keys (`$…`) and dotted keys from
`req.body`, `req.params`, `req.headers` and `req.query`, preventing NoSQL operator injection.

It wraps [`express-mongo-sanitize`](https://www.npmjs.com/package/express-mongo-sanitize). That
package's own middleware throws on Express 5 because it reassigns `req.query`, which is a
getter in Express 5.

## Install

Install from npm:

```bash
npm install express5-mongo-sanitize
```

## Usage

```js
import express from 'express'
import mongoSanitize from 'express5-mongo-sanitize'

const app = express()
app.use(express.json())
app.use(mongoSanitize()) // or mongoSanitize({ replaceWith: '_', allowDots: true })
```

Register it **after** the body parser so `req.body` exists.

Options are the same as `express-mongo-sanitize`: `replaceWith`, `allowDots`, `dryRun`.
`sanitize` and `has` are re-exported for direct use.

## Releasing

Before the first release, create an npm account and authenticate once from the project directory
with `npm login`. npm requires an authenticated account to publish packages.

For the first publish:

```bash
npm test
npm pack --dry-run  # review the files that will be included
npm publish
```

For a subsequent release, update the version (for example, `npm version patch`), then publish the
new version with `npm publish`. Push the resulting version commit and tag to GitHub as well.
