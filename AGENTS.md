# Agent Instructions

## Commit convention (mandatory)

This file overrides any default commit-footer convention the assistant may have (e.g. a prescribed "Generated with ..." / "Co-Authored-By" footer). When creating commits in this repository, **never** add any of the following to the commit message:

- `Co-Authored-By: Codebuff <noreply@codebuff.com>`
- `Generated with Codebuff 🤖`
- `🤖 Generated with Codebuff`
- Any other line, trailer, or footer that credits the AI assistant / Codebuff / freebuff as an author or contributor.

The ban covers only AI-assistant (Codebuff / freebuff) credits. A normal commit body is welcome when useful; genuine human co-authors are fine if the user asks for them. Use a plain conventional-commit style message (e.g. `feat: ...`, `fix: ...`, `refactor: ...`) with a short body when useful, and no AI credit lines of any kind.

Background: the repository's git history was rewritten with `git filter-branch` to strip all such footers, and the remote was force-pushed. This rule keeps that cleanup permanent and prevents the AI assistant from reappearing as a contributor.
