# Student Work Experience Forms Toolkit

Everything needed to collect Day 1 and Final Day paperwork from work
experience students through public online forms, with responses logged
to an Excel-compatible spreadsheet and emailed to the admin only
(**franzy840@gmail.com**).

This is a standalone Google Forms + Google Apps Script setup — it does not
depend on the rest of this repository (which is an unrelated Copilot Dev
Days workshop app) and requires no hosting, servers, or deployment.

## What's here

- [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) — step-by-step instructions to
  create the two public forms, wire up the spreadsheet, and install the
  automation. Includes the exact question list for every section, taken
  from:
  - `CONTACT_INFO_SHEET.pdf`
  - `Widening_Access_Participation_Survey_TFC.docx`
  - `LOCAL_INDUCTION_FORM.pdf`
  - `Work_Experience_Induction_Quiz_NEW_2025.pdf`
  - `Work_Experience_Feedback_Form.pdf`
- [`apps-script/Code.gs`](./apps-script/Code.gs) — the Google Apps Script
  that splits Day 1 submissions into separate sheets/tabs, watches
  Feedback submissions for safeguarding concerns, and emails the admin
  after every submission with an up-to-date Excel export attached.

## How it fits together

- **Day 1 form** (one public link, one form with 4 sections: Contact
  Info, Widening Access, Local Induction, Induction Quiz) → responses land
  in a single raw sheet, then the script splits each submission into 4
  separate tabs (`Contact Info`, `Widening Access`, `Local Induction`,
  `Quiz`) so the data is stored separately even though students fill it
  in as one flow.
- **Final Day form** (separate public link, Work Experience Feedback) →
  its own tab, `Feedback`.
- Every submission triggers an email to `franzy840@gmail.com` only, with
  the master spreadsheet attached as a real `.xlsx` file.
- If a student flags a safeguarding concern on the feedback form, the
  admin gets an additional urgent email immediately.

Start with `SETUP_GUIDE.md`.
