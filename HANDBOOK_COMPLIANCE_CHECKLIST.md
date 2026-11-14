# LOCAL HACKATHON HANDBOOK — COMPLIANCE CHECKLIST

This checklist is extracted from the handbook text supplied by the team. Treat it as binding for this event. It is not a replacement for any additional instructions issued by the on-site organizers.

## 1. GitHub repository and hourly commit rules

- [ ] Create a **new public** GitHub repository.
- [ ] Repository creation time must be **after 12:00 PM on 14 November 2026**.
- [ ] Obtain and use the official project/repository submission link supplied by the organizers on-site before the deadline.
- [ ] Push genuine, incremental code updates at least once every hour, starting 12:00 PM on 14 November 2026.
- [ ] Continue hourly pushes through the **2:00 PM code freeze on 15 November 2026**.
- [ ] Continue the hourly discipline overnight; overnight hours are explicitly included.
- [ ] Do not assume a missing push is harmless. The handbook says missed pushes can lead to point deductions or immediate disqualification; exact triggers are internal.
- [ ] Every registered team member must appear in the GitHub Contributors list.
- [ ] Every team member must push commits from their own personal GitHub account.
- [ ] Before the first commit from each computer/account, verify `git config user.email` matches an email associated with that member's GitHub account.
- [ ] Do not let bots, AI agents or automated commit scripts appear as contributors.
- [ ] Do not add AI co-author tags (for example, Copilot, Claude or ChatGPT) to commits.
- [ ] Every commit must be authored and pushed by a registered human team member.
- [ ] If the project is a web interface/deployable application, host it on GitHub Pages or a comparable cloud host.
- [ ] Put the live deployment URL at the **top of README.md**.
- [ ] At **2:00 PM on 15 November 2026**, stop all commits, merges and repository edits. No last-minute README tweak or asset replacement after the freeze.

### Human Git identity verification

Each registered member should run these commands locally and verify the values before committing:

```bash
git config user.name
git config user.email
```

If needed, set their own identity (each person must use their own details):

```bash
git config user.name "YOUR REAL NAME"
git config user.email "EMAIL VERIFIED ON YOUR GITHUB ACCOUNT"
```

Do not run these commands on behalf of another member. Do not fabricate timestamps or contributors.

## 2. AI usage and disclosure policy

- [ ] AI tools such as Gemini, ChatGPT, Claude and GitHub Copilot may be used for brainstorming, debugging and code assistance.
- [ ] Add a dedicated **AI Usage Disclosure** heading in README.md.
- [ ] List every AI tool actually used.
- [ ] Name the exact modules, scripts, code sections, text or assets each AI tool helped generate or revise.
- [ ] Explain the human engineering, integration, review and testing performed on top of AI assistance.
- [ ] Disclose AI-generated copy and design assets, not only code.
- [ ] Do not omit AI use. The handbook says undisclosed reliance may lead to score penalties.
- [ ] AI tools must never appear as Git commit authors or repository contributors.
- [ ] Keep human commits free of AI co-author tags.

## 3. Mandatory README structure

The README must be comprehensive and finalized before the 2:00 PM code freeze on 15 November 2026. Include all six required sections:

- [ ] **1. Project Title & Problem Statement:** official challenge title and concise summary of the problem addressed.
- [ ] **2. Team Details:** team name; full names; home institutions; GitHub usernames; engineering/design roles for every member.
- [ ] **3. Solution Overview & Architecture:** high-level functional explanation; system architecture diagram; complete technology stack.
- [ ] **4. Live Demo & Screenshots:** direct hosted-app link; demo video link if available; key interface screenshots.
- [ ] **5. Installation & Setup Guide:** step-by-step clone, dependency configuration/installation and local run instructions.
- [ ] **6. AI Usage Disclosure:** honest breakdown of where and how AI tools were used across codebase and documentation.

## 4. Judging and evaluation

Judging occurs **2:00 PM–5:00 PM on 15 November 2026** through live demonstrations and jury Q&A. Prepare evidence for all five pillars:

- [ ] **Problem Alignment & Impact:** demonstrate direct alignment with the challenge and practical educational usefulness.
- [ ] **Technical Execution & Functionality:** show code quality, architecture, complete working prototype and live hosting.
- [ ] **Innovation & Creativity:** explain originality and meaningful use of open datasets/engineering tools.
- [ ] **GitHub Discipline & Documentation:** show hourly commits, contributor activity from every member, README quality and honest AI disclosure.
- [ ] **Presentation & Live Q&A:** every member should understand the system and answer technical questions.

The handbook states that exact scoring weights are internal and not publicly disclosed. Do not invent weight percentages.

- [ ] Be ready for the closing ceremony, listed as **5:00 PM onwards on 15 November 2026**.

## 5. Immediate risk check as of 4:07 PM IST, 14 November 2026

The hourly sequence began at noon. The 12:00, 1:00, 2:00, 3:00 and 4:00 PM checkpoints may already have passed. If the repository/team has not made the required pushes for any of those windows:

1. Make a genuine current push immediately, if the repository exists and a real change is ready.
2. Do not manufacture old commits, backdate timestamps, create no-op commits or claim compliance that did not happen.
3. Ask the on-site organizer how the team should handle the missed windows and record the answer.
4. Continue genuine hourly pushes from now until the freeze.

**Time remaining from 4:07 PM IST on 14 November to 2:00 PM on 15 November: approximately 21 hours 53 minutes.** Confirm that the organizer's clock/time zone is the same as your team's local clock.
