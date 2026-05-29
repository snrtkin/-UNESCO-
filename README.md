# UNISCO

Simple static project containing an index page, site pages, styles, and a small JS file.

Overview
- Lightweight static site for "UNISCO" with the following structure:
	- [index.html](index.html) — project home with links to workspace files
	- page/ — HTML pages (about variants)
	- style/ — CSS files (style-index.css)
	- java/ — JavaScript entry (`main.js`)
	- image/ — image assets (currently empty)

How to view
- Open [index.html](index.html) in your browser (no server required):

	1. Double-click [index.html](index.html) in the project folder, or
	2. Serve the folder with a simple HTTP server, e.g. Python 3:

	 ```bash
	 python -m http.server 8000
	 # then open http://localhost:8000 in your browser
	 ```

Notes about remotes and URLs
- This workspace has been pushed to two remotes during development:
	- Your fork: https://github.com/25281021-abhash/UNISCO (origin)
	- Target repo: https://github.com/snrtkin/-UNESCO- (snrtkin)

- For the `snrtkin` repo: direct pushes to `main` are blocked by repository rules. I created a branch `from-unisco` and pushed the changes there so a pull request can be opened:

	https://github.com/snrtkin/-UNESCO-/pull/new/from-unisco

Contributing
- To contribute: open an issue or create a pull request from your fork/branch.

License
- No license specified. Add a `LICENSE` file if you want to set one.

Contact
- If you want me to open the PR, add more docs, or push the README to a specific remote/branch, tell me which remote and branch.

Git quick reference — commit / pull / push

- Commit changes (stage all and commit):

```bash
git add .
git commit -m "Describe your changes here"
```

- Pull latest changes from the remote `main` branch (merge):

```bash
git pull origin main
```

- Push your commits to the remote `main` branch:

```bash
git push origin main
```

- Push a new branch and set upstream (first time pushing a branch):

```bash
git checkout -b my-branch
git push -u origin my-branch
```

- Quick helpful commands:

```bash
git status      # see current changes and branch
git log --oneline --decorate --graph --all  # compact history view
```

Replace `main` with your branch name when appropriate (some repos use `master` or other branch names).

If you want these examples adjusted for a specific workflow or remote, tell me which remote/branch.
