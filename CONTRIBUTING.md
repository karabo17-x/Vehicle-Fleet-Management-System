# Contributing to VFMS

Welcome! This document explains exactly how we work together on this repository, step by
step. It assumes you're new to Git and GitHub — if something here doesn't make sense, ask in
the group chat before pushing anything. Nobody loses marks for asking a question; people lose
marks for a broken `main` branch.

---

## 1. One-time setup (do this once, before your first task)

1. **Install Git** on your laptop if you haven't: https://git-scm.com/downloads
2. **Clone the repository** (this downloads it to your computer):
   ```bash
   git clone https://github.com/<owner>/vfms.git
   cd vfms
   ```
3. **Set your name and email** so your commits are correctly attributed to you (this matters —
   commit history is checked individually):
   ```bash
   git config --global user.name "Your Full Name"
   git config --global user.email "the-email-on-your-github-account@example.com"
   ```
4. Ask the repo owner to add you as a **collaborator** if you haven't already accepted the
   invite email/GitHub notification.

You only need to do this once per laptop.

---

## 2. The two branches you need to know about

- **`main`** — the stable branch. Nobody pushes to this directly. Ever. It only changes when a
  reviewed Pull Request is merged into it.
- **`develop`** — the working branch. This is where all our day-to-day progress lives. Your
  work starts here.

You will almost never touch `main` directly. Your daily work happens on a **feature branch**
that comes off `develop`.

---

## 3. Doing a task, from start to finish

This is the workflow for *every single task*, no exceptions, no shortcuts.

### Step 1 — Make sure your `develop` is up to date
Before starting anything new:
```bash
git checkout develop
git pull
```
This makes sure you're building on top of the latest work, not an old version.

### Step 2 — Create your own feature branch
Never write code directly on `develop`. Create a new branch named after your task:
```bash
git checkout -b feature/short-task-name
```
Examples:
```bash
git checkout -b feature/driver-registration-form
git checkout -b feature/rbac-middleware
git checkout -b fix/vehicle-search-bug
```

**Branch naming convention:**
| Prefix | Use for |
|---|---|
| `feature/...` | New functionality |
| `fix/...` | Bug fixes |
| `docs/...` | Documentation only |
| `test/...` | Adding or fixing tests |
| `chore/...` | Config, tooling, dependencies — no feature/logic change |

Use lowercase, hyphens between words, no spaces.

### Step 3 — Do the work, commit as you go
Don't wait until everything is perfect to commit. Commit in small, logical chunks as you
progress — this is what builds an honest, gradual commit history (which is individually
assessed).

```bash
git add .
git commit -m "Add driver registration form with validation"
```

**Commit message convention** — start with a verb, describe what changed, keep it under ~70
characters:
```
Add JWT token generation on login
Fix vehicle search returning duplicate results
Update README with docker-compose instructions
Remove unused maintenance service import
```
Avoid vague messages like `"update"`, `"fix stuff"`, `"asdf"`, `"final version"`.

### Step 4 — Push your branch to GitHub
```bash
git push -u origin feature/short-task-name
```
(You only need `-u origin feature/short-task-name` the *first* time you push that branch —
after that, just `git push`.)

### Step 5 — Open a Pull Request (PR)
1. Go to the repository on GitHub — you'll usually see a yellow banner offering to open a PR
   for the branch you just pushed. Click **Compare & pull request**.
2. Make sure the PR is set to merge **into `develop`**, not `main`.
3. Give it a clear title and a short description: what you did, and anything the reviewer
   should pay attention to.
4. Click **Create pull request**.

### Step 6 — Get it reviewed
At least **one teammate must review and approve** before it can be merged — this is enforced
by the branch protection rules, it's not optional. Tag someone in the group chat if nobody's
reviewed it after a day.

As a reviewer, you're not just checking "does it run" — skim for:
- Does it match what the PR description says it does?
- Any obvious security issue (hardcoded password, no input validation)?
- Does it break anything else?

### Step 7 — Merge and clean up
Once approved, click **Merge pull request** on GitHub, then **Delete branch** (GitHub will
offer this button right there). On your own machine:
```bash
git checkout develop
git pull
git branch -d feature/short-task-name
```

That's it — task done, cleanly recorded, ready for the next one.

---

## 4. Rules that are not optional

- **Never push directly to `main`.** You physically can't anyway — it's protected — but don't
  try to work around it.
- **Never commit secrets.** No passwords, API keys, database credentials, or `.env` files. If
  you're not sure whether something is a secret, ask before committing it. If you accidentally
  commit one, tell the Security & DevOps lead immediately — don't just delete the file and
  hope, because it stays in the Git history until it's properly removed.
- **Don't work directly on `develop`.** Always branch off it.
- **Don't let a PR sit for days.** Small, frequent PRs are easier to review than one giant PR
  at the end of the week.
- **Pull before you push.** If `git push` is rejected because there are new changes on the
  remote, run `git pull` first (see the conflicts section below).

---

## 5. If something goes wrong

### "My push was rejected"
Someone else pushed to the same branch before you. Run:
```bash
git pull
```
Git will try to merge automatically. If it can't, you'll get a **merge conflict** — see below.

### "I have a merge conflict"
Git will mark the conflicting lines in the file like this:
```
<<<<<<< HEAD
your version of the line
=======
their version of the line
>>>>>>> branch-name
```
Open the file, decide which version (or a combination) is correct, delete the `<<<<<<<`,
`=======`, and `>>>>>>>` markers, save the file, then:
```bash
git add .
git commit -m "Resolve merge conflict in vehicle.controller.ts"
git push
```
If you're stuck, don't guess — ask in the group chat and share your screen. Merge conflicts
are normal, not a sign you did something wrong.



### "I'm not sure what branch I'm on"
```bash
git status
```
This tells you your current branch and whether you have uncommitted changes.

---

## 6. Quick reference

```bash
git clone <url>                    # one-time: download the repo
git checkout develop                # switch to develop
git pull                            # get latest changes
git checkout -b feature/my-task     # create your branch
git add .                           # stage your changes
git commit -m "message"             # save your changes locally
git push -u origin feature/my-task  # first push of this branch
git push                            # subsequent pushes
git status                          # what's changed / what branch am I on
git log --oneline                   # see recent commit history
```

---

## 7. Why we're strict about this 
C
 this workflow is what makes your **individual
contribution visible and defensible** for marking, protects the team from one person's mistake
breaking everyone's work, and is genuinely how software teams outside university operate. Get
comfortable with it now; it gets easier fast, usually within the first week.

If you're ever unsure about any step in this document, ask before you push. It's always faster
to ask a 30-second question than to fix a broken branch.