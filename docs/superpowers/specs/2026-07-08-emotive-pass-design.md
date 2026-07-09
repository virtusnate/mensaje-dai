# Última Cita — Emotive Pass Design Spec ("Light & Bloom")

**Date:** 2026-07-08
**Scope:** A cohesive emotional-presentation pass over the existing app. No new screens or data — it restyles/animates the scene, the avatar, and the four narrative beats. Builds on `2026-07-08-ultima-cita-storytelling-design.md`.

---

## 1. Goal

Make the whole experience feel beautiful and emotive without adding busy motion. Two throughlines carry the emotion:

- **Light** — the world moves from cool twilight to a warm bloom.
- **The bouquet** — the man carries a bouquet he offers: dim/closed → opens → bursts into petals → wilts.

Register: **restrained for reading, lush for the Question and the Sí, somber for the No.**

---

## 2. The Avatar (man)

Replace the current woman sprite with a **man**: short dark hair, shirt (`#456B86`) + dark trousers (`#33324A`), skin `#F0C39B`. He **holds a small bouquet offered forward** (a cluster of 3–4 pixel flowers on short stems). The bouquet is the emotional object — there are **no other flowers in the landscape** (the scattered scene flowers are removed).

**Placement (layout C — grounded foreground):** the man stands **on the top edge of the reading text panel**, centered, so his **whole body is visible** above the card. He is the still anchor; the landscape drifts behind him. He does **not** float in the sky and does **not** walk with a leg cycle.

**Idle motion (reading):** a **subtle breathing** — a slow vertical drift of ~1.5px and/or a ~1% torso scale over ~3s, gentle ease-in-out, looping. Just enough to feel alive; never a bob or a jitter. Honors `prefers-reduced-motion` (motion removed).

**Bouquet states by emotion:**
| State | Bouquet | Man |
|-------|---------|-----|
| reading | muted, slightly closed | breathing idle, offering it |
| question | flowers open, brighter | still, lifts it a little |
| happy (Sí) | bursting → rising petals | arms up, slow sway |
| sad-1..4 (No) | dimming | slumping by stage |
| dead (No) | wilted | toppled 90°, faded |

---

## 3. The Landscape & Camera

**Landscape:** the existing pixel-art sunset (rising sun, fading stars, layered rolling hills) **minus the scattered flowers**. Sky keeps the smooth twilight→gold warming with progress `p`.

**World drift (layout C):** the scene layers **parallax/drift** slowly as reading progresses (progress-driven horizontal/upward drift of hills + sun), so the still man reads as travelling. Drift is calm, continuous, restrained.

**Camera:** wide at the start, **leaning in (zoom) as the text ends** (existing `scale 1 → 1.4`), settling close by the Question. Applied to the scene+avatar "world" layer.

---

## 4. The Bloom (new shared device)

A single reusable **`Bloom`** layer: a soft radial warm glow (centered behind the avatar) whose **intensity** (opacity + size) is driven by an emotional value derived from screen + `p`:

| Moment | Bloom |
|--------|-------|
| early reading (dusk) | ~0 (invisible) |
| late reading (warm) | faint |
| **Question** | **swells** — a clear warm halo behind the expectant man |
| **Sí** | **flares** to full radiant gold |
| No / dead | fades to 0 (dusk returns) |

Bloom transitions are slow (~900ms ease-out). Sits above the scene, below the avatar/petals/text.

---

## 5. Petals (refactor of the current particles)

Replace the generic ambient particles with a **`Petals`** layer with three modes:

- **reading** — sparse, slow, drifting; tint cool→warm with `p`.
- **question** — a few warm petals drift gently upward near the avatar.
- **burst** — on Sí, a one-shot rising flurry of petals + small flower motifs from the bouquet.

Respects `prefers-reduced-motion` (drift stops; petals become static or hidden).

---

## 6. The Four Beats

**1 · Reading — restrained.** Full-body man on the panel edge, subtle breathing idle, offering the dim bouquet. Landscape drifts behind; stars fade; sun rises; petals sparse. Bloom ~0 → faint. Text panel owns the screen (warm parchment, gold border, ✿ ornament, Cormorant Infant, big text).

**2 · Question — lush centerpiece.** The world settles (drift stops), camera close. The **Bloom swells** behind the man; he stands still and **lifts the bouquet**, its flowers open; a few petals drift up. A **held beat** (~600ms of stillness), then the question panel + Sí/No **rise/fade in**. The question uses the **same font as the story** (Cormorant Infant), inside a matching parchment card with the ✿ ornament.

**3 · Sí — lush burst.** The **bouquet bursts** into a rising petal flurry; the **Bloom flares** to full gold; sky flushes brightest; the man throws the bouquet up with a slow happy sway. Settles (glow retained) into ¿Cuándo puedes? / ¿A qué hora? Finale becomes a **floral bloom** ("🌸" / flower motif) instead of the heart, matching the motif; closing line unchanged.

**4 · No — somber, restrained (deliberate contrast).** The **Bloom fades**, light sinks back to dusk, **stars return**, petals stop, the **bouquet wilts** (droops, a petal or two fall). The man **slumps** by warning stage; on the definitive No he **topples** (rotate 90°, fade). The lingering "…¿Sí?" is a single **glowing flower ember** — the one warm point left. (Telegram + logic unchanged.)

---

## 7. Component Impact (existing app)

| File | Change |
|------|--------|
| `components/Character.jsx` | Man sprite; offered bouquet with per-emotion states; subtle breathing idle (not walk/bob); grounded placement on panel edge |
| `components/Scene.jsx` | Remove scattered flowers; add progress-driven parallax **drift** of layers |
| `components/Bloom.jsx` | **New** — radial warm glow, `intensity` prop |
| `components/Petals.jsx` | Refactor current particles → `mode` (reading / question / burst) |
| `components/QuestionScreen.jsx` | **Add the avatar** (expectant, lifting bouquet) + bloom; held-beat reveal of card/buttons; already unified font |
| `components/StoryText.jsx` | Man stands on its top edge (coordinate the panel height so the full body clears it) |
| `components/HeartFinale.jsx` | → floral bloom finale (rename/retheme; flower motif instead of heart) |
| `components/NoEscalation.jsx` | Wilt bouquet + slump/topple + glowing-flower ember on the lingering Sí |
| `components/YesFlow.jsx` | Trigger Sí petal burst + bloom flare on entry |
| `App.jsx` | Drive `Bloom` intensity + `Petals` mode + world drift/zoom from screen + `p`; pass a shared "warmth/emotion" value down |

**Emotion/warmth signal:** App computes a small state object (e.g. `{ screen, p, bloom, petalMode }`) and passes the relevant pieces to `Bloom`, `Petals`, `Scene`, `Character` so all layers stay in sync from one source of truth.

---

## 8. Accessibility

- `prefers-reduced-motion`: disable breathing idle, world drift, petal motion, camera zoom, and the Sí burst → show calm static end-states. (Global CSS already calms transitions; `Petals`/burst must also check the hook.)
- Text contrast unchanged (sepia on warm parchment ≥ 4.5:1).
- Avatar/scene/bloom/petals remain `aria-hidden`; text stays in the `aria-live` region.

---

## 9. Out of Scope

- No changes to story text, branching logic, Telegram/Worker, hosting, or data.
- No sound.
- No new libraries required (Bloom/Petals can be CSS/SVG or the existing tsParticles; sprite/bouquet stay SVG pixel art).
