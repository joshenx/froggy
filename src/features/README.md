Feature modules follow a Bulletproof React-style shape.

- `src/app` is the application layer and route composition layer.
- `src/features/<feature>/components` holds UI scoped to a single feature.
- `src/components` holds shared UI primitives used across features.
- `src/lib` holds shared infrastructure and cross-feature client/store utilities.

Current feature folders:

- `landing`
- `roles`
- `question-bank`
- `candidates`
- `integrations`
- `interviews`
- `packets`
