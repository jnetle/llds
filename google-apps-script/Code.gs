/**
 * Inquiries webhook for the Laurel Leaf site.
 *
 * Setup (one-time, manual):
 *   1. Open the "Laurel Leaf Inquiries" Google Sheet → Extensions → Apps Script.
 *   2. Paste this file's contents into Code.gs and Save.
 *   3. Project Settings → Script properties → add:
 *        SHARED_SECRET   — long random string (must match Vercel env INQUIRY_SHARED_SECRET)
 *        OWNER_EMAIL     — address that should receive new-inquiry notifications
 *        REPLY_TEMPLATE  — (optional) override the "Reply to selected lead" body. Use
 *                          {{firstName}} as a placeholder. If unset, the default below
 *                          is used.
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *      Copy the Web app URL into Vercel env SHEETS_WEBHOOK_URL.
 *   5. Reload the Sheet so the onOpen() trigger installs the "Inquiries" menu.
 *
 * Sheet columns (row 1, in COLUMNS order — see below).
 *
 * Drift protection: doPost() refuses to write a row when the sheet's existing
 * header row has a different column count than COLUMNS. Either clear row 1 (the
 * script repopulates headers on the next submission) or align the headers
 * manually before re-deploying after a column change.
 *
 * Recommended: data-validate the Status column with values
 *   New, Contacted, Qualified, Proposal Sent, Won, Lost
 */

const STATUS_DEFAULT = 'New';
const HEADER_ROW = 1;
const COLUMNS = [
  'Submitted At',
  'Status',
  'Name',
  'Email',
  'Phone',
  'Address',
  'Project Type',
  'Project Type Other',
  'Areas',
  'Size',
  'Description',
  'Builder',
  'Builder Name',
  'Plans',
  'Begin Time',
  'Completion',
  'Deadlines',
  'Built Before',
  'Built Before Note',
  'Worked Designer',
  'Worked Designer Note',
  'Investment',
  'Design Budget Allocated',
  'Design Investment',
  'Builder Approach',
  'Design Support',
  'Decision Maker',
  'Decision Comfort',
  'Open To Recs',
  'Involvement',
  'Changes Approach',
  'Style',
  'Priorities',
  'Structured Comm',
  'Anything Else',
  'How Heard'
];

const DEFAULT_REPLY_TEMPLATE = [
  'Hi {{firstName}},',
  '',
  'Thank you for reaching out about your project. We have read your inquiry carefully and would love to discuss next steps.',
  '',
  '',
  '',
  'Warmly,',
  'The Laurel Leaf studio'
].join('\n');

function joinList(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value || '';
}

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const expectedSecret = props.getProperty('SHARED_SECRET');
    const ownerEmail = props.getProperty('OWNER_EMAIL');

    const body = JSON.parse(e.postData.contents);

    if (!expectedSecret || body.__secret !== expectedSecret) {
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Drift guard: if row 1 already has headers but the column count doesn't
    // match COLUMNS, refuse to write to avoid silently mis-mapping fields.
    const firstCell = sheet.getRange(HEADER_ROW, 1).getValue();
    if (firstCell) {
      const lastCol = sheet.getLastColumn();
      if (lastCol !== COLUMNS.length) {
        const msg =
          'sheet_columns_mismatch: header row has ' +
          lastCol +
          ' column(s), but COLUMNS expects ' +
          COLUMNS.length +
          '. Clear row 1 or update headers manually before submitting again.';
        console.error(msg);
        return jsonResponse({ ok: false, error: msg });
      }
    } else {
      ensureHeaderRow(sheet);
    }

    const submittedAt = body.submittedAt || new Date().toISOString();
    const row = [
      submittedAt,
      STATUS_DEFAULT,
      body.name || '',
      body.email || '',
      body.phone || '',
      body.address || '',
      joinList(body.projectType),
      body.projectTypeOther || '',
      joinList(body.areas),
      body.size || '',
      body.description || '',
      body.builder || '',
      body.builderName || '',
      body.plans || '',
      body.beginTime || '',
      body.completion || '',
      body.deadlines || '',
      body.builtBefore || '',
      body.builtBeforeNote || '',
      body.workedDesigner || '',
      body.workedDesignerNote || '',
      body.investment || '',
      body.designBudgetAllocated || '',
      body.designInvestment || '',
      body.builderApproach || '',
      body.designSupport || '',
      body.decisionMaker || '',
      body.decisionComfort || '',
      body.openToRecs || '',
      body.involvement || '',
      body.changesApproach || '',
      body.style || '',
      joinList(body.priorities),
      body.structuredComm || '',
      body.anythingElse || '',
      body.howHeard || ''
    ];
    sheet.appendRow(row);

    if (ownerEmail) {
      const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
      const subject = 'New inquiry — ' + (body.name || 'unknown');
      const lines = [
        'A new inquiry just landed.',
        '',
        'Name:        ' + (body.name || ''),
        'Email:       ' + (body.email || ''),
        'Phone:       ' + (body.phone || ''),
        'Address:     ' + (body.address || ''),
        'Begin time:  ' + (body.beginTime || ''),
        'Completion:  ' + (body.completion || ''),
        'Investment:  ' + (body.investment || ''),
        'Design fees: ' + (body.designInvestment || ''),
        'Support:     ' + (body.designSupport || ''),
        '',
        'Description:',
        body.description || '(none)',
        '',
        'Anything else:',
        body.anythingElse || '(none)',
        '',
        'Open the tracker: ' + sheetUrl
      ];
      GmailApp.sendEmail(ownerEmail, subject, lines.join('\n'));
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('doPost failed', err);
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function ensureHeaderRow(sheet) {
  sheet.getRange(HEADER_ROW, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.setFrozenRows(1);
}

function jsonResponse(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

/* -------------------------------------------------------------------------- */
/*  Sheet UI: "Inquiries" menu — Reply to selected lead                       */
/* -------------------------------------------------------------------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Inquiries').addItem('Reply to selected lead', 'replyToSelectedLead').addToUi();
}

function replyToSelectedLead() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  if (row <= HEADER_ROW) {
    SpreadsheetApp.getUi().alert('Select a lead row first (not the header).');
    return;
  }

  const values = sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0];
  const record = {};
  COLUMNS.forEach(function (col, i) {
    record[col] = values[i];
  });

  if (!record['Email']) {
    SpreadsheetApp.getUi().alert('That row has no email address.');
    return;
  }

  const firstName = String(record['Name'] || '').split(' ')[0] || 'there';
  const subject = 'Re: your inquiry to Laurel Leaf';
  const template = PropertiesService.getScriptProperties().getProperty('REPLY_TEMPLATE') || DEFAULT_REPLY_TEMPLATE;
  const body = template.replace(/{{firstName}}/g, firstName);

  const draft = GmailApp.createDraft(record['Email'], subject, body);
  const draftUrl = 'https://mail.google.com/mail/u/0/#drafts/' + draft.getId();

  const html = '<p>Draft created. <a href="' + draftUrl + '" target="_blank" rel="noopener">Open it in Gmail</a> to edit and send.</p>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setHeight(120).setWidth(400), 'Reply draft ready');
}
