# Annushka Watchdog Add-on

This is a Google Workspace Add-on version of the Annushka watchdog.
It includes a configuration UI, a daily trigger installer, and the same logic as the standalone script.

## Files
- `/Users/dtkach/workspace/annushka/add-on/Code.gs`
- `/Users/dtkach/workspace/annushka/add-on/appsscript.json`

## How it works
- Shows a homepage card with configuration fields.
- Saves settings to **Script Properties**.
- Installs a **daily time-driven trigger** for `runAnnushka`.
- Runs the same behavior as the standalone script.
- Stops permanently after spill by setting `SPILL_DONE=true`.

## Setup

1. Go to [script.new](https://script.new) and create a new Apps Script project.
2. Replace the contents with the files from this folder:
   - Paste `Code.gs`
   - Replace `appsscript.json`
3. Enable the **Gmail** and **Drive** services (Apps Script built-in services).
4. Deploy as an add-on:
   - **Deploy** → **Test deployments** for local testing
   - **Deploy** → **New deployment** → **Add-on** for production

## OAuth scopes
The manifest includes:
- Gmail: read/modify/send
- Drive: full access
- Script properties + triggers
- User email

If you change behavior, update scopes accordingly.

## Usage
1. Open Gmail.
2. Open the Annushka add-on from the right sidebar.
3. Fill in settings and click **Save settings**.
4. Optionally use **Find doc** + **Search docs** and pick from the dropdown.
5. Click **Install daily trigger**.
6. (Optional) Click **Run now (test)**.

## Notes
- The timestamps used are the **message dates**, not the time you read or trashed them.
- If the add-on is updated with new scopes, users must re-authorize.
- Public distribution requires publishing to the **Workspace Marketplace**.
 - The doc picker is a best-effort list of recent or search-matched docs (not a real Drive picker).

## clasp setup (optional)

If you use `clasp` for deployment, add a `.clasp.json` file with your Script ID.
Template:

```json
{
  "scriptId": "PUT_YOUR_SCRIPT_ID_HERE",
  "rootDir": "."
}
```

You can create it from the template:

```bash
cp .clasp.json.example .clasp.json
```

## Marketplace publishing checklist (high level)

1. Create a Google Cloud project and enable the **Google Workspace Marketplace SDK**.
2. Configure **OAuth consent screen**.
3. Complete Marketplace listing details (name, descriptions, icons, screenshots).
4. Ensure scopes are accurate and minimal.
5. Run through the publishing review (security + privacy requirements).
6. Publish as public (required for consumer `@gmail.com` accounts).

## Billing hook (if you want to charge)

Add-on installation itself can’t be paid. Monetization typically uses:
- An external billing system (Stripe, Paddle, etc.).
- A license check at runtime (call your billing backend via `UrlFetch`).
- Feature gating if license is missing or expired.

Example flow:
1. User installs add-on.
2. Add-on UI shows "Activate" link.
3. User completes payment on your site.
4. Your backend records license keyed by user email.
5. Add-on checks license on each run and either proceeds or shows warning.
