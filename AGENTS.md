<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Keep ARQECO centered on the project journey; people, Zoe, curation, certification, suppliers, and affiliates connect through projects.
- Use Lovable Cloud with row-level access for persistent platform data because ARQECO requires real accounts, workflows, and relationships.
- Keep roles in `user_roles`, separate from profiles, to prevent account holders from escalating their own access.
- Registration category is onboarding data on profiles, never an authorization role; partner privileges still require audited approval.
- Integrated Eco-Holístico diagnostics use domain/application/infrastructure modules with owner-scoped server functions and the ARQECO Cloud; no separate auth or external app is used for new dossiers.
- Credit internal Start referrals through the diagnostic completion trigger, using the same normalized-email ledger key as the legacy signed callback to prevent duplicate rewards across both paths.
- Keep imported identity mappings and historical payment rows service-role-only until verified account linking is available; never assign imported ownership from client-supplied IDs or email alone.
- Keep the public home presentation scoped under arqeco-home, with semantic global tokens and shared Button variants; this allows editorial refinements without changing project workflows.
- Affiliate sales arrive via signed webhook `/api/public/conversions` (HMAC per supplier secret); commission = sale × product commission_rate, stored on the conversion row — keeps payouts auditable.
- Partner approval and product review run through admin-checked SECURITY DEFINER SQL functions — atomic creation of supplier/catalog rows without exposing admin keys.
- Plans/prices live in `service_plans`/`service_plan_options`; never hardcode prices in UI.
- Zoe is available only to authenticated architects/designers with the `professional` role; enforce this on the server because client visibility is not access control.
- Prepare booking totals without a slot through `prepare_service_booking`; reserve meetings atomically through owner-scoped `schedule_paid_booking` only after confirmed payment to prevent unpaid reservations and double booking.
- Extra rooms use a configurable unit price on each plan option and a booking quantity; `prepare_service_booking` calculates their subtotal server-side.
- Plan payments use embedded checkout with `price_data` whose amount is the `total_cents` stored by `prepare_service_booking`; the browser never sends amounts — fixed admin prices, no client manipulation.
- Payment results arrive only via signed webhook `/api/public/payments/webhook`, which confirms the booking; meeting selection follows confirmation and never depends on the browser claiming payment.
- Architects apply via `partner_applications` kind `professional`; approval grants the `professional` role inside `review_partner_application` — one audited approval path.
- Construction requests live separately from fixed-price interior plan bookings; authenticated clients submit an inquiry before optionally reserving a meeting slot, because construction needs a scoped proposal rather than instant checkout.

- Each approved professional manages own `appointment_slots` (professional_id); slots without professional are the central team agenda; `schedule_paid_booking` assigns both booking and project atomically when scheduling after payment.
- Briefings: one per project (created when a plan payment is confirmed); answers live in briefings.answers jsonb with question catalogue in src/lib/briefing/config.ts; submit_briefing normalizes rooms/people and advances the project — keeps the form flexible while filters and future AI read structured data. Visual options (styles/palettes/materials/moodboards) are rows in briefing_visual_options so the team swaps images without code.
- Plan referrals: referral_links/attributions/commissions + eco_ledger; commission is written only by the signed payment webhook using rules in src/lib/referrals.ts — affiliates can never write their own earnings.
