# AGENTS.md — Project Working Rules

## Core Principle

Improve the existing app. Do not rebuild it.

This project must be developed incrementally and safely.

Before making any code change, always read and understand the existing implementation first.

## Mandatory workflow before every task

For every task:

1. Inspect the current repository structure.
2. Read the relevant existing files before editing.
3. Identify how the current implementation already works.
4. Reuse existing files, functions, naming, routes, styles, and storage patterns.
5. Make the smallest safe change needed.
6. Do not modify unrelated files.
7. Do not redesign the UI unless explicitly requested.
8. Do not restructure folders unless explicitly requested.
9. Do not replace working code with a new parallel system.
10. Do not remove existing working buttons, links, routes, styles, or scripts.

## Current stable priority

The current priority is stabilization and careful improvement of the existing wallet, credits, premium unlock, and generation gating system.

Do not add large new modules until the foundation is stable.

Do not add yet:

* full admin AI panel
* real subscriptions
* real payment integration
* full social feed
* full character memory system
* major redesign
* major architecture replacement

## Existing behavior that must be preserved

Wallet and transaction history behavior:

* credit additions must appear green with plus sign, example "+100 CR"
* credit spending must appear red with minus sign, example "-90 CR"
* wallet balance must update correctly
* existing credit purchase/top-up flow must keep working
* existing transaction history UI must keep working

Premium cards:

* Imagine cinematică privată = 20 CR
* Story special = 300 CR
* Video teaser premium = 90 CR

Existing routes that must not be broken:

* /
* /premium
* /credits
* /wallet if present
* /transactions if present
* /feed
* /profile
* /chat
* /gen-image
* /gen-video
* /video-studio or existing video route
* /api/video/open if present

## Premium improvement rule

Premium content must eventually be truly locked, not only visually locked.

Correct behavior:

* If user has enough credits and clicks premium unlock, deduct credits.
* Save transaction.
* Show spending in red with minus.
* Mark item as unlocked.
* Persist state after refresh.
* If user lacks credits, redirect/show credits purchase area.
* Do not allow premium generation before unlock.
* Do not charge twice for an already unlocked item.

## Very important

Before editing a feature, first read all files involved in that feature.

For wallet/premium tasks, inspect at minimum:

* public/wallet.js
* public/premium.html
* public/credits.html
* public/profile.html
* public/chat.html
* public/gen-image.html
* public/gen-video.html
* public/i18n.js
* server.js, if backend/API changes are needed

Do not edit until the current flow is understood.

## Required final report after every task

After each task, report:

1. Files inspected.
2. Files changed.
3. What was changed.
4. What was intentionally not changed.
5. Why the change is safe.
6. How to manually test it.
7. Risks or remaining mock areas.
