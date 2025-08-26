# RepoFlow Sync Service

RepoFlow Sync Service keeps workspaces and repositories in sync between a **source** RepoFlow instance and one or more **target** instances.  
It **does not** copy package files, instead it ensures `remote` repositories on each target point back to repositories on the source.

## Features

- Synchronizes workspaces and repositories from a single source to multiple targets
- Creates `remote` repositories on targets that point to the source
- No package data transfer (packages remain on the source, targets pull through)
- Idempotent operations (safe to run repeatedly)
- Structured logging

## Quick Start

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Copy `.env.example`to `.env.local` and fill in the required values.
4. Development: `npm run dev`

> Configuration keys and documentation are provided in **`.env.example`**.

## Requirements

- Node.js 18+ and npm

## Contributing

Contributions are welcome. By submitting a PR, you agree that your contribution is licensed under this repository’s license.

## License

This project is **source-available** under the **RepoFlow Sync Service License** (included in `LICENSE`).  
High-level summary (see the license for the full terms):

- You may **use and modify** the software **solely** to operate with RepoFlow instances.
- You **may not** sell, resell, sublicense, or offer it as a hosted/managed service.
- You may distribute copies (modified or unmodified) **only** under the same license and **only** for use with RepoFlow.
- No rights to RepoFlow trademarks or logos are granted.

For commercial or alternative licensing (e.g., resale, SaaS, broader redistribution), contact **hello@repoflow.io**.
