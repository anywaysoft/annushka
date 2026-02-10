# Annushka Watchdog (Apps Script)

This script runs daily and checks your Gmail activity using the *message timestamps* of:
- latest read message in Inbox (`in:inbox is:read`)
- latest message in Trash (`in:trash`)

It then:
- sends a status email every run
- sends an "action required" email if inactivity >= 7 days (default)
- shares a doc + notifies recipients if inactivity >= 10 days (default), then stops permanently

## Files
- `/Users/dtkach/workspace/annushka/annushka.gs`

## Setup

1. Go to [script.new](https://script.new) and create a new Apps Script project.
2. Paste the contents of `annushka.gs` into the script editor.
3. In **Project Settings → Script Properties**, add the following keys:

Required:
- `OWNER_EMAIL` = your email address
- `DOC_ID` = Google Doc ID (from the URL)
- `DOC_URL` = full URL of the doc
- `RECIPIENTS` = comma-separated emails to share with

Optional overrides:
- `STATUS_SUBJECT` = `Annushka Log`
- `ACTION_SUBJECT` = `Annushka ABOUT TO SPILL!`
- `SPILL_SUBJECT` = `Annushka spilled the oil`
- `ACTION_REQUIRED_DAYS` = `7`
- `SPILL_DAYS` = `10`

4. Set a daily trigger:
   - Open **Triggers** (clock icon)
   - Add a trigger for function `runAnnushka`
   - Choose **Time-driven** → **Day timer**

## Notes
- The timestamps used are the **message dates**, not the time you read or trashed them.
- Once a spill happens, the script sets `SPILL_DONE=true` in Script Properties and stops forever.
- If you want SMS alerts, we can add a Twilio (or other provider) integration.

## Properties template

Copy these into **Project Settings → Script Properties**:

```
OWNER_EMAIL=you@example.com
DOC_ID=your_doc_id_here
DOC_URL=https://docs.google.com/document/d/your_doc_id_here/edit
RECIPIENTS=recipient1@example.com,recipient2@example.com
STATUS_SUBJECT=Annushka Log
ACTION_SUBJECT=Annushka ABOUT TO SPILL!
SPILL_SUBJECT=Annushka spilled the oil
ACTION_REQUIRED_DAYS=7
SPILL_DAYS=10
```
