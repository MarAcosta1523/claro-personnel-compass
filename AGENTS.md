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

- Keep GESPA as an in-memory UI prototype; no persistence or server operations are introduced until explicitly requested.
- Reuse the shared GESPA button and password input across both roles so interactions and visibility controls stay consistent.
- Model transient prototype failures with a per-screen attempt tracker, separate from business validation; retries must reach the success state without demo controls in the UI.
- Own users, personnel records and attendance in the index screen's shared in-memory state so role switches can read the same attendance without introducing persistence.
- Resolve Personal attendance through the authenticated account's explicit personnel-record ID using the shared browser-safe attendance module; never accept a personnel selector from Personal.
