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
- Authentication email templates and signed delivery live in the managed `/lovable/email/auth/*` routes; preserve all six auth actions and bypass app redirects/CSRF for these self-authenticating routes.

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
- Contracted rooms (type + area) are captured at checkout via prepare_service_booking_rooms, which validates count against the plan and adds the per-room oversize fee server-side; the payment webhook seeds the briefing with those rooms so each gets its own module.
- Client journey deadlines start only when the team runs `confirm_briefing_meeting` (business days via `add_business_days` + `holidays`); a trigger blocks clients from editing status/deadline columns on projects, so the clock can't be started or faked from the browser.
- Project deliverables live in private bucket `project-files` (path `<project_id>/...`) indexed by `project_files`; revisions in `revision_requests` — clients read via signed URLs, only the assigned professional/admin upload.
- Public pages wrap content in `SiteLayout` (src/components/site/SiteLayout.tsx): one shared menu, footer and fixed WhatsApp/orçamento CTA keep the per-audience journey consistent.
- The previous home is kept unrouted in src/components/home/legacy-home.tsx as source for relocating its sections (plans, comparator, curadoria, Zoe, parceiros) into /casa, /negocio, /profissionais etc.; delete once relocated.
- Shared public-page sections (plans grid, comparator, portfolio, FAQ, quote CTA) live in src/components/site/sections.tsx so /casa, /negocio and others reuse one plan/price implementation.
- Public pages say "tecnologia com IA", never "Zoe"; Zoe stays named only inside the professional panel.
- Home and public portfolio galleries share portfolioItems from site/sections.tsx so uploaded project imagery remains consistent across pages.
