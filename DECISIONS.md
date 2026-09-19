# Decisions

Assumptions and trade-offs made during development.

## Decision 1: JSON Engine as default (not Cedar)
- **Reason:** `cedarpy` native wheels for Windows are not guaranteed. Per spec Section 8.1, we default to `ELIGIBILITY_ENGINE=json` and keep Cedar as an optional, tested layer.
- **Spec ref:** Section 8.1 — "If cedarpy packaging on Lambda causes problems for more than about an hour, switch the default to json."

## Decision 2: Mock LLM for local development
- **Reason:** Bedrock credentials may not be available locally. The spec explicitly supports `MOCK_LLM=1` mode (Section 12) so the engine and UI can be developed offline.

## Decision 3: Informational schemes have empty criteria
- **Reason:** Schemes like `pmjay-general` and `pmay-g` with `decision_mode: "informational"` cannot be decided from self-reported data. Their criteria array is empty; they always show as CHECK_OFFICIALLY.
- **Spec ref:** Section 7.1 — "informational: cannot be decided from self-reported data; shown in Check officially with instructions."

## Decision 4: Household informational schemes shown once (not per member)
- **Reason:** Spec says household-scoped schemes deduplicate to one result per family. For informational household schemes, we show one CHECK_OFFICIALLY entry.

## Decision 5: Age-based near-miss uses integer gap
- **Reason:** Ages are stored as integers per spec Section 8.4. The `eligible_in_years` gap is always a whole number.

## Decision 6: Tailwind v4 compatibility
- **Reason:** The scaffolded project installed Tailwind v4 which uses a different config format. Using v3-compatible `@tailwind` directives may require PostCSS adjustments. We configured both `tailwind.config.js` and `postcss.config.js` for backwards compatibility.
