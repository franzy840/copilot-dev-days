# Setup Guide — Student Work Experience Forms

Admin email for all notifications: **franzy840@gmail.com** (this is the
only address the automation ever sends to — students never receive a
copy).

Total setup time: ~20-30 minutes, done entirely in your Google account
(Sheets + Forms + Apps Script). No code deployment, no hosting, no cost.

---

## 0. Create the master spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank
   spreadsheet**.
2. Rename it **"Work Experience Student Records"**.
3. Leave sharing as **private to you** (do not share this file with
   anyone else — it will hold personal and sensitive data).

This one spreadsheet is your "Excel" — Google Sheets opens/edits/exports
as `.xlsx` natively, and the automation also emails you a real `.xlsx`
copy after every submission (see step 4).

---

## 1. Create the Day 1 form (Contact Info + Widening Access + Local
   Induction + Quiz, one public link)

1. In the spreadsheet: **Insert → Form**. Google creates a new Form
   already linked to this spreadsheet and adds a response sheet tab
   automatically.
2. Rename the form **"Work Experience — Day 1"**.
3. Add a short intro description, e.g.:
   > Please complete this on your first day. It covers your contact
   > details, local induction, an optional equality monitoring survey,
   > and a short safety quiz. It takes about 10 minutes.
4. Add these two questions **before any section** (used to link your
   4 records back to the same student):
   - **Full Name** — Short answer, *Required*
   - **Today's Date** — Date, *Required*

5. **Add section → "Contact Information"** and add these questions
   (all *Short answer* unless noted; from `CONTACT_INFO_SHEET.pdf`):
   - First Name — *Required*
   - Last Name — *Required*
   - Address Line 1 — *Required*
   - Address Line 2 (optional)
   - Town / City — *Required*
   - Postcode — *Required*
   - Mobile Number — *Required* (Response validation → Text →
     "Contains" a pattern check isn't necessary; just mark required)
   - Email Address — *Required* (Response validation → Text →
     "Email address")
   - Next of Kin - Full Name — *Required*
   - Relationship to Next of Kin — *Required*
   - Next of Kin - Work Number (optional)
   - Next of Kin - Home Number (optional)
   - Add a description on the section: *"For emergency use only. This
     information is kept strictly private and confidential and is only
     ever used if relevant to your placement."*

6. **Add section → "Widening Access Participation Survey"**. Add a
   description: *"These questions have no impact on your placement.
   NHS England uses this data (with no personally identifiable
   information) to monitor access to work experience under the
   Widening Access & Talent for Care strategy. Answering is optional —
   choose 'Prefer not to say' for any question you'd rather skip."*
   Add these as **Multiple choice**, none required (from
   `Widening_Access_Participation_Survey_TFC.docx`):
   - **Age**: Under 16 / 16-18 / 19-24 / 25-29 / 30-39 / 40-49 / 50-59 /
     60-69 / 70+
   - **Gender**: Male / Female / Non-binary / Other / Unknown / Prefer
     not to say
   - **Trans Identification**: Yes / No / Other / Unknown / Prefer not
     to say
   - **Sexual Orientation**: Straight/Heterosexual / Gay/Homosexual /
     Gay/Lesbian / Bisexual / None/Asexual / Other / Prefer not to say
   - **Disabilities** (physical/mental impairment with substantial,
     long-term effect on daily activities): Yes / No / Other / Unknown /
     Prefer not to say
   - **Ethnicity**: Asian/Asian British – Bangladeshi / Asian/Asian
     British – Indian / Asian/Asian British – Pakistani / Black / Black
     British African / Chinese / Indian / White British / Mixed –
     White and Asian / Mixed – White and Black African / Mixed – White
     and Black Caribbean / Any other mixed background / Any other white
     background / Other / Prefer not to say
   - **Occupation of main household earner when you were 14**:
     Modern/traditional professional / Clerical and intermediate
     occupations / Long-term unemployed / Retired / Semi-routine manual
     and service occupations / Senior, middle or junior managers or
     administrators / Small business owners / Technical and craft
     occupations / Other / Unknown / Prefer not to say
   - **Type of school attended (ages 11-15)**: Attended school outside
     the UK / Independent or fee-paying school / Independent or
     fee-paying school with 90%+ bursary / State-run or state-funded
     school / Other / Unknown / Prefer not to say
   - **Eligible for free school meals?**: Yes / No / Not applicable
     (finished school before 1980 or overseas) / Unknown / Prefer not
     to say
   - **Did either parent attend university (before you were 18)?**: No,
     neither attended university / Yes, one or both parents attended
     university / Unknown / Prefer not to say

7. **Add section → "Local Induction"** (from `LOCAL_INDUCTION_FORM.pdf`).
   Add a description listing what's already been covered in the
   handbook and e-learning (Fire Safety, Data Security, Infection
   Control, Slips/Trips/Falls, Manual Handling — not permitted, Social
   Media, Professionalism, Travel Advice, Dress Code). Then add:
   - Local Supervisor Name — Short answer, *Required*
   - Department / Ward — Short answer, *Required*
   - Department-specific risks explained to me (notes) — Paragraph,
     optional (supervisor or student fills in a summary of what was
     covered)
   - **I confirm I have received fire evacuation information and the
     general induction information listed above** — Checkbox, single
     option "I confirm", *Required*
   - Student e-signature (type your full name) — Short answer,
     *Required*
   - Induction Date — Date, *Required*
   - Add a note in the description: *"If any incident involves a work
     experience student, contact the Undergraduate Team on Ext 5180."*

8. **Add section → "Induction Quiz"**. Add the 10 questions below as
   **Multiple choice** (from `Work_Experience_Induction_Quiz_NEW_2025.pdf`,
   verbatim):

   1. Where do you need to sign in each day?
      a) With your named team b) In the Undergraduate Education Centre
      c) Both Security and the Undergraduate Education Centre
   2. Which of the following is an appropriate example of attire for
      work experience at the hospital?
      a) Ironed shirt and trousers b) Comfortable jeans and trainers
      c) Branded sweatshirt and jogging bottoms
   3. You have been ill during the night with an upset stomach and are
      feeling unwell. What do you need to do?
      a) Stay in bed a few extra hours and come in when you can b)
      Telephone or email the undergrad team to say you won't attend c)
      Come in anyway, the work experience is the most important thing
   4. What should you always do on entering and leaving a ward or
      clinical area?
      a) Wipe your feet on the mat b) Loudly announce you have arrived
      c) Use the hand sanitizer provided
   5. You see someone you know as a patient during your work
      experience. What should you **never** do?
      a) Politely say hello b) Ask if they mind you being present
      during their consultation c) Go home and tell friends/family
      that you saw them and about their condition
   6. You come across a spillage of liquid on the floor. What should
      you do?
      a) Report it to your supervisor or the nearest member of staff
      b) Leave it, someone else will find it c) Put paper towels on it
      and leave it to dry
   7. You hear alarm bells ringing in the area you are assigned to, but
      they are intermittent. What does this mean and what should you
      do?
      a) There is a fire, run to the nearest exit b) A fire alarm has
      been triggered nearby; no need to evacuate immediately but stay
      cautious c) Assume it's only a test, no action needed
   8. A patient is looking uncomfortable in their bed or has asked you
      to help them move. What should you do?
      a) Help the patient b) Leave them, someone else might help soon
      c) Speak to one of your team — they've had training on safe
      patient moving
   9. You are leaving for the day but will be back tomorrow. What
      should you do with your ID badge?
      a) Take it home and bring it back tomorrow b) Leave it somewhere
      you'll easily find it in the morning c) Take it back to security
      and pick up a new one in the morning
   10. It is 12:30pm on Friday; your work experience has come to an
       end. What do you do before you go home?
       a) Bring your handbook to the Undergrad Team for review, collect
       your certificate, and hand back your ID badge b) Go straight
       home, keeping your ID badge as a memento c) Stay late and come
       to the Undergraduate Centre at six o'clock hoping to find
       someone to sign your booklet

   **Turn on native quiz grading** (recommended instead of scripting the
   grading logic, so it can't drift out of sync): Form **Settings ⚙ →
   Quizzes → "Make this a quiz"**. Set **"Release grade" → Later, after
   manual review** (matches the original quiz's "we will go through the
   solutions together at the end" instruction — don't reveal answers
   immediately) and turn off "Missed questions" / "Correct answers" /
   "Point values" under respondent view. Then open each question's
   **Answer key** and mark the correct option and 1 point. Based on
   safety-policy best practice (verify against your official answer key
   before relying on it): **1-c, 2-a, 3-b, 4-c, 5-c, 6-a, 7-b, 8-c, 9-c,
   10-a**. Once released, Google Forms adds a `Score` column to the
   response sheet automatically — the automation script carries it into
   the `Quiz` tab.

9. **Form Settings ⚙ → General**: turn **off** "Restrict to users in
   [your domain]" and **off** "Collect email addresses" so students
   without a Google account (or using personal email) can respond
   anonymously via the link. Turn **off** "Limit to 1 response".
10. **Send → Link icon 🔗** → copy the **short public link**. This is
    the one link you give students for Day 1 (covers all 4
    sections/topics in one go, as requested).

---

## 2. Create the Final Day feedback form

1. Back in the spreadsheet: **Insert → Form** again (creates a second
   form + a second raw response tab).
2. Rename it **"Work Experience — Final Day Feedback"**.
3. Add questions (from `Work_Experience_Feedback_Form.pdf`):
   - Full Name (optional — leave blank for anonymous feedback) — Short
     answer
   - Dates you attended — from — Date
   - Dates you attended — to — Date
   - Hospital — Short answer
   - Team — Short answer
   - Then, for each of the 10 statements below, add a **Linear scale
     1–4** question with labels `1 = Strongly Disagree` and
     `4 = Strongly Agree`, immediately followed by a **Paragraph**
     question *"If you scored 1-3, why did you feel this way?
     (optional)"*:
     1. My placement was well organised and I was provided with all the
        required information beforehand.
     2. The Undergraduate Education Team were welcoming and helpful.
     3. I received a friendly greeting from my assigned team and was
        made to feel welcome.
     4. During my placement I felt involved and was included in
        conversations.
     5. My timetable ran to plan, or I was informed of timetable
        changes in advance.
     6. The structure of the programme was satisfactory.
     7. I now have a better understanding of the work undertaken by the
        hospital.
     8. I have achieved the learning objectives I hoped to gain from
        this placement.
     9. When I asked questions about this career path I was given
        valuable advice.
     10. Overall my work experience placement was good and I would
         recommend it to others.
   - Has your placement influenced your choice of career in any way? —
     Paragraph
   - What was most useful? — Paragraph
   - Any suggestions or improvements? — Paragraph
   - **Did you witness anything of concern that you would like to
     confidentially report?** — Paragraph *(the automation immediately
     emails the admin an urgent alert if this is answered)*
   - How will you use what you've learned to help you advance along
     your career path? — Paragraph
   - Is there anyone at the hospital you'd like to mention as having
     given you an especially memorable placement? — Short answer
   - Any other comments — Paragraph
4. Same **Settings ⚙ → General** changes as step 1.9 (off-domain
   access, no email collection, no response limit).
5. Copy its public link the same way — this is the separate link you
   give students on their **final day**.

---

## 3. Install the automation script

1. Open the master spreadsheet → **Extensions → Apps Script**.
2. Delete the placeholder code and paste in the contents of
   [`apps-script/Code.gs`](./apps-script/Code.gs) from this folder.
3. At the top of the file, double-check the two raw sheet tab names
   (`DAY1_RAW_SHEET`, `FEEDBACK_RAW_SHEET`) match the actual tab names
   Google created for your two forms (check the tabs at the bottom of
   the spreadsheet — they're usually named "Form Responses 1" and "Form
   Responses 2" by default; either rename the tabs to match the
   constants, or edit the constants to match the tabs).
4. Save (💾), then run the `installTrigger` function once from the
   toolbar (▶ Run, function dropdown → `installTrigger`). Approve the
   Google permission prompts when asked (it needs permission to read
   the sheet, send email as you, and export the file — nothing else,
   and nothing leaves your own Google account).
5. Confirm the trigger installed: clock icon (Triggers) on the left
   sidebar should now show one trigger, function `onFormSubmit`, event
   "On form submit".

---

## 4. Test it

1. Open the Day 1 form's public link in an incognito window, fill it
   in, submit.
2. Check: the `Contact Info`, `Widening Access`, `Local Induction`,
   and `Quiz` tabs each got a new row, and franzy840@gmail.com received
   an email with an `.xlsx` attachment of the whole spreadsheet.
3. Repeat with the Final Day feedback form, once leaving the "concern"
   question blank and once filling it in — confirm the urgent email
   only fires in the second case.

---

## 5. Distribute the links

- Give students the **Day 1** link on arrival (covers contact info,
  widening access survey, local induction sign-off, and the safety
  quiz in one sitting).
- Give students the **Final Day** link on their last day (feedback
  form).
- Only you (franzy840@gmail.com) have edit access to the spreadsheet
  and only you receive the automated emails — students only ever see
  the public fill-in forms, never the data.

## Notes on privacy

- Widening Access answers are for NHS England equality-monitoring
  reporting only and contain no identifiers — per the original
  document, dispose of that tab's data every quarter after reporting.
- Contact info and next-of-kin details are sensitive — keep the
  spreadsheet private and don't add extra editors/viewers.
- If you'd rather not get an email (with attachment) on every single
  submission, you can remove the `sendAdminEmail` calls from
  `onFormSubmit` in `Code.gs` and instead call `exportAndEmailExcel()`
  from a **time-driven trigger** (e.g. once daily) for a digest email
  instead — the guide in `Code.gs`'s comments shows where.
