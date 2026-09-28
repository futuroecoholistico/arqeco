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
