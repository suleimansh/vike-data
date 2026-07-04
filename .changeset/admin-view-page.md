---
'vike-admin': minor
---

vike-admin: add the read-only view / detail page (part of #582, closes #590).

vike-admin rendered List / New / Edit / Dashboard but had no record page. `defineCrud` introduced the `view` screen, so admin gains it:

- **New `viewData` hook + `ViewPage` (React + Vue)**: `/admin/:table/:id` is now the read-only detail of one row, rendered through vike-crud's `RecordView`. It loads the owned row (query scope + pk), gates it with `canView(record, ctx)`, drops `.when`-hidden fields before they leave the server, labels foreign-key values from the target row, and carries `canEdit` / `canDelete` so the page offers Edit / Delete only when the user may act. Exposed at `vike-admin/react/ViewPage` and `vike-admin/vue/ViewPage`.
- **Routing**: the edit page moves to `/admin/:table/:id/edit`; the bare `/admin/:table/:id` is now the view. The list links each row to its detail view (per-row `_canView`), with Edit / Delete as per-row actions targeting the edit route. The agent API's row writes (`PATCH` / `DELETE /admin/<table>/<id>.json`) render the `/edit` route accordingly.

The `index/view/create/edit` config-key vocabulary alignment noted in #582 is deferred to the dedupe work (#591), where define/resolve is reworked.
