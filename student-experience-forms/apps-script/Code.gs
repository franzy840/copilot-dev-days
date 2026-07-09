/**
 * Student Work Experience Forms — response router + admin notifier.
 *
 * Lives bound to the master Google Sheet ("Work Experience Student
 * Records"). Splits Day 1 form submissions into separate tabs per topic,
 * flags safeguarding concerns raised on the Final Day feedback form, and
 * emails an Excel (.xlsx) export of the whole workbook to the admin only
 * after every submission.
 *
 * Setup: see ../SETUP_GUIDE.md. After pasting this file into
 * Extensions > Apps Script, run installTrigger() once.
 */

// ---- Config -----------------------------------------------------------

var ADMIN_EMAIL = 'franzy840@gmail.com';

// Tab names Google Forms creates for each form's raw responses.
// Rename the tabs (or these constants) so they match.
var DAY1_RAW_SHEET = 'Form Responses 1';
var FEEDBACK_RAW_SHEET = 'Form Responses 2';

// Question titles as they appear in the Day 1 form. Keep these in sync
// with the form if you reword a question.
var CONTACT_INFO_QUESTIONS = [
  'First Name', 'Last Name', 'Address Line 1', 'Address Line 2 (optional)',
  'Town / City', 'Postcode', 'Mobile Number', 'Email Address',
  'Next of Kin - Full Name', 'Relationship to Next of Kin',
  'Next of Kin - Work Number (optional)', 'Next of Kin - Home Number (optional)'
];

var WIDENING_ACCESS_QUESTIONS = [
  'Age', 'Gender', 'Trans Identification', 'Sexual Orientation', 'Disabilities',
  'Ethnicity', 'Occupation of main household earner when you were 14',
  'Type of school attended (ages 11-15)', 'Eligible for free school meals?',
  'Did either parent attend university (before you were 18)?'
];

var LOCAL_INDUCTION_QUESTIONS = [
  'Local Supervisor Name', 'Department / Ward',
  'Department-specific risks explained to me (notes)',
  'I confirm I have received fire evacuation information and the general induction information listed above',
  'Student e-signature (type your full name)', 'Induction Date'
];

var QUIZ_QUESTIONS = [
  'Where do you need to sign in each day?',
  'Which of the following is an appropriate example of attire for work experience at the hospital?',
  'You have been ill during the night with an upset stomach and are feeling unwell. What do you need to do?',
  'What should you always do on entering and leaving a ward or clinical area?',
  'You see someone you know as a patient during your work experience. What should you never do?',
  'You come across a spillage of liquid on the floor. What should you do?',
  'You hear alarm bells ringing in the area you are assigned to, but they are intermittent. What does this mean and what should you do?',
  'A patient is looking uncomfortable in their bed or has asked you to help them move. What should you do?',
  'You are leaving for the day but will be back tomorrow. What should you do with your ID badge?',
  "It is 12:30pm on Friday; your work experience has come to an end. What do you do before you go home?"
];

var CONCERN_QUESTION =
  'Did you witness anything of concern that you would like to confidentially report?';

// ---- Trigger installer (run once manually) -----------------------------

function installTrigger() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
}

// ---- Main entry point ---------------------------------------------------

function onFormSubmit(e) {
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();

  if (sheetName === DAY1_RAW_SHEET) {
    handleDay1Submission(e);
  } else if (sheetName === FEEDBACK_RAW_SHEET) {
    handleFeedbackSubmission(e);
  }
}

// ---- Day 1 form: split into 4 topic tabs --------------------------------

function handleDay1Submission(e) {
  var named = e.namedValues;
  var studentName = firstValue(named, 'Full Name') || '(name not given)';
  var timestamp = firstValue(named, 'Timestamp') || new Date().toISOString();

  appendSplitRow('Contact Info', CONTACT_INFO_QUESTIONS, named, studentName, timestamp);
  appendSplitRow('Widening Access', WIDENING_ACCESS_QUESTIONS, named, studentName, timestamp);
  appendSplitRow('Local Induction', LOCAL_INDUCTION_QUESTIONS, named, studentName, timestamp);

  var quizHeaders = QUIZ_QUESTIONS.slice();
  var quizRow = appendSplitRow('Quiz', QUIZ_QUESTIONS, named, studentName, timestamp, true);

  var scoreText = firstValue(named, 'Score') || '';
  if (scoreText) {
    var quizSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quiz');
    var lastRow = quizSheet.getLastRow();
    var scoreCol = headerColumn(quizSheet, 'Score');
    quizSheet.getRange(lastRow, scoreCol).setValue(scoreText);
  }

  exportAndEmailExcel(
    'New Day 1 submission — ' + studentName,
    studentName + ' submitted their Day 1 forms (Contact Info, Widening ' +
    'Access, Local Induction, Quiz) at ' + timestamp + '.\n\n' +
    'The full workbook is attached as an Excel file.'
  );
}

/**
 * Appends a row of [Timestamp, Student Name, ...answers] to `tabName`,
 * creating the tab with headers the first time it's needed.
 */
function appendSplitRow(tabName, questions, named, studentName, timestamp, includeScoreColumn) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  var headers = ['Timestamp', 'Student Name'].concat(questions);
  if (includeScoreColumn) headers.push('Score');

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  var row = [timestamp, studentName];
  for (var i = 0; i < questions.length; i++) {
    row.push(firstValue(named, questions[i]));
  }
  if (includeScoreColumn) row.push('');

  sheet.appendRow(row);
  return row;
}

function headerColumn(sheet, headerName) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf(headerName);
  return idx === -1 ? headers.length + 1 : idx + 1;
}

// ---- Final Day feedback form ---------------------------------------------

function handleFeedbackSubmission(e) {
  var named = e.namedValues;
  var studentName = firstValue(named, 'Full Name (optional — leave blank for anonymous feedback)') ||
    firstValue(named, 'Full Name') || 'Anonymous';
  var concern = firstValue(named, CONCERN_QUESTION);

  if (concern && concern.trim().length > 0) {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: '⚠️ URGENT — Work experience concern reported',
      body: 'A student (' + studentName + ') flagged a concern on the Final ' +
        'Day feedback form:\n\n"' + concern + '"\n\n' +
        'Review the "' + FEEDBACK_RAW_SHEET + '" tab for full context.'
    });
  }

  exportAndEmailExcel(
    'New Final Day feedback — ' + studentName,
    studentName + ' submitted their Final Day feedback form.\n\n' +
    'The full workbook is attached as an Excel file.'
  );
}

// ---- Shared helpers -------------------------------------------------------

function firstValue(namedValues, questionTitle) {
  var v = namedValues[questionTitle];
  return v && v.length > 0 ? v[0] : '';
}

/**
 * Emails the whole spreadsheet as a real .xlsx attachment to the admin
 * only. Called after every submission; for a daily digest instead,
 * remove the calls in handleDay1Submission/handleFeedbackSubmission and
 * add a time-driven trigger that calls this directly once a day.
 */
function exportAndEmailExcel(subject, bodyText) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var file = DriveApp.getFileById(ss.getId());
  var xlsxBlob = file.getAs(MimeType.MICROSOFT_EXCEL).setName(ss.getName() + '.xlsx');

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    body: bodyText,
    attachments: [xlsxBlob]
  });
}
