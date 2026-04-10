# Skill Registry — myPortfolio

Generated: 2026-04-09

## Project Skills (.agent/skills/)

| Skill | Description | Trigger |
|-------|-------------|---------|
| find-skills | Discover and install agent skills | "how do I do X", "find a skill for X" |
| frontend-design | Create distinctive frontend interfaces with high design quality | Landing pages, marketing sites, branded pages |
| github-pr | Create high-quality PRs with conventional commits | Creating PRs, writing PR descriptions |
| interface-design | Interface design for dashboards, apps, tools | Dashboards, admin panels, interactive products |
| playwright | Playwright E2E testing patterns | Writing E2E tests, Page Objects, selectors |
| react-19 | React 19 patterns with React Compiler | Writing React components |
| react-doctor | Catch React issues early | Reviewing code, finishing features, fixing bugs |
| setup-agent | Agent configuration | Setting up .agent, Cursor, Continue, Cline |
| skill-lifecycle | Create, register, sync and validate skills | Creating/renaming skills, syncing AGENTS.md |
| typescript | TypeScript strict patterns | Writing TypeScript code |
| vercel-react-best-practices | React/Next.js performance optimization | React components, data fetching, bundle optimization |
| zod-4 | Zod 4 schema validation patterns | Using Zod for validation |
| zustand-5 | Zustand 5 state management patterns | Managing React state with Zustand |

## Global Skills (~/.gemini/antigravity/skills/)

| Skill | Description | Trigger |
|-------|-------------|---------|
| branch-pr | PR creation workflow for Agent Teams Lite | Creating a pull request |
| go-testing | Go testing patterns including Bubbletea TUI | Go tests, teatest |
| issue-creation | Issue creation workflow | Creating GitHub issues |
| judgment-day | Parallel adversarial review protocol | "judgment day", "dual review" |
| sdd-* | SDD phase skills (explore, propose, spec, design, tasks, apply, verify, archive) | SDD workflow commands |
| skill-creator | Creates new AI agent skills | Creating new skills |
| skill-registry | Create/update the skill registry | "update skills", "skill registry" |

## Compact Rules

### Frontend (*.jsx, *.js, *.css)
- Use vanilla CSS (no Tailwind unless user requests)
- React 18 with JSX (no TypeScript currently)
- Vite 7 with SWC plugin
- Path aliases: `@utilities`, `@views`, `@assets`
- ESLint flat config with react/react-hooks plugins

### API (api/*.js)
- Express 5 backend
- Notion API integration via @notionhq/client
- Environment variables via dotenv

### Conventions
- Package manager: Bun (migrated from npm)
- No testing framework installed
- No TypeScript
- No i18n
- Spanish language UI
