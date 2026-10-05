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
- Keep the visual system sophisticated eco-futurist: Playfair Display headings, Montserrat body, black and beige dominant surfaces, logo green for actions, human photography, fine architectural lines, and asymmetric editorial composition.
- Affiliate sales arrive via signed webhook `/api/public/conversions` (HMAC per supplier secret); commission = sale × product commission_rate, stored on the conversion row — keeps payouts auditable.
- Partner approval and product review run through admin-checked SECURITY DEFINER SQL functions — atomic creation of supplier/catalog rows without exposing admin keys.
- Plans/prices live in `service_plans`/`service_plan_options`; never hardcode prices in UI.
- Zoe is available only to authenticated architects/designers with the `professional` role; enforce this on the server because client visibility is not access control.
- Service bookings use `appointment_slots` and `service_bookings`; reserve and calculate totals atomically through `reserve_service_booking` to prevent double booking and client-side price manipulation.
- Extra rooms use a configurable unit price on each plan option and a booking quantity; `reserve_service_booking` calculates their subtotal server-side.
- Plan payments use embedded checkout with `price_data` whose amount is the `total_cents` already stored by `reserve_service_booking`; the browser never sends amounts — fixed admin prices, no client manipulation.
- Payment results arrive only via signed webhook `/api/public/payments/webhook`, which confirms the booking and blocks the slot — confirmation must not depend on the browser returning.
- Architects apply via `partner_applications` kind `professional`; approval grants the `professional` role inside `review_partner_application` — one audited approval path.
- Construction requests live separately from fixed-price interior plan bookings; authenticated clients submit an inquiry before optionally reserving a meeting slot, because construction needs a scoped proposal rather than instant checkout.

- Each approved professional manages own `appointment_slots` (professional_id); slots without professional are the central ARQECO team agenda; booking a professional slot assigns the booking to that professional inside `reserve_service_booking`.
- Briefings: one per project (created when a plan payment is confirmed); answers live in briefings.answers jsonb with question catalogue in src/lib/briefing/config.ts; submit_briefing normalizes rooms/people and advances the project — keeps the form flexible while filters and future AI read structured data. Visual options (styles/palettes/materials/moodboards) are rows in briefing_visual_options so the team swaps images without code.
