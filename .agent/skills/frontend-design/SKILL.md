---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill for landing pages, marketing sites, web posters, branded pages, standout components, or when styling/beautifying web UI with a strong visual direction. Generates creative, polished code and avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Scope

**Use for:** landing pages, marketing sites, web posters, campaign pages, hero sections, promotional microsites, visually distinctive React components, page redesigns, and requests to beautify or give more personality to an existing UI.

**Not for:** dashboards, admin panels, CRUD-heavy SaaS screens, settings pages, dense internal tools, or product interfaces where information architecture and operational clarity dominate the problem. Redirect those to `interface-design`.

**Boundary with `interface-design`:**
- Choose `frontend-design` when the main challenge is visual identity, storytelling, atmosphere, emotional impact, or making the UI feel memorable.
- Choose `interface-design` when the main challenge is product structure, navigation, density, workflows, data-heavy layouts, or operational usability.
- If a task mixes both, use `interface-design` for the product shell and `frontend-design` for marketing surfaces or high-expression sections.

## Trigger Signals

Use this skill when the user asks for things like:
- "hazlo mas bonito", "mas premium", "mas wow", "mas editorial", "mas marketing"
- new landing pages, branded sections, campaign pages, posters, showcases, or highly expressive components
- stronger typography, color direction, motion, atmosphere, or a more memorable frontend

## Guardrails

- Preserve the existing design system when the repo already has a strong visual language; push expression inside that system instead of fighting it.
- Keep the result responsive and accessible; visual ambition never justifies broken mobile layouts or weak contrast.
- Prefer a single bold concept executed consistently over many disconnected decorative ideas.

## Repo rule: fuente visual obligatoria

- In this repo, before proposing or implementing expressive UI, check whether `docs/esenciales/diseno/` exists and is active.
- If it exists, treat that folder as the canonical visual source.
- If it does not exist, do not import stale brand rules from previous projects; establish or request a minimal visual direction grounded in the current product docs.
- Do not invent permanent brand tokens without documenting them.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.
- **Styling Architecture**: In this repo, prioritize **CSS Modules** (`*.module.css`) and **CSS Variables** (design tokens) over inline styles or utility-first frameworks unless explicitly requested.


NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
