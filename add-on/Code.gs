// SPDX-License-Identifier: MIT
// Copyright (c) 2026 anywaysoft

/**
 * Annushka Watchdog - Workspace Add-on implementation.
 * Configure via Add-on UI (stored in Script Properties).
 */

function onHomepage() {
  return buildConfigCard_({});
}

function onInstall(e) {
  onHomepage();
}

function buildConfigCard_(state) {
  const props = PropertiesService.getScriptProperties();
  const docQuery = state && state.docQuery ? state.docQuery : '';
  const docCandidates = state && state.docCandidates ? state.docCandidates : getRecentDocs_();

  const section = CardService.newCardSection()
    .setHeader('Configuration');

  section.addWidget(textInput_('OWNER_EMAIL', 'Owner email', props.getProperty('OWNER_EMAIL') || Session.getActiveUser().getEmail()));
  section.addWidget(textInput_('DOC_ID', 'Doc ID', props.getProperty('DOC_ID') || ''));
  section.addWidget(textInput_('DOC_URL', 'Doc URL', props.getProperty('DOC_URL') || ''));
  section.addWidget(textInput_('DOC_QUERY', 'Find doc (search title)', docQuery));
  section.addWidget(buildDocPicker_(docCandidates, props.getProperty('DOC_ID') || ''));
  section.addWidget(textInput_('RECIPIENTS', 'Recipients (comma-separated)', props.getProperty('RECIPIENTS') || ''));

  section.addWidget(textInput_('STATUS_SUBJECT', 'Status subject', props.getProperty('STATUS_SUBJECT') || 'Annushka Log'));
  section.addWidget(textInput_('ACTION_SUBJECT', 'Action required subject', props.getProperty('ACTION_SUBJECT') || 'Annushka ABOUT TO SPILL!'));
  section.addWidget(textInput_('SPILL_SUBJECT', 'Spill subject', props.getProperty('SPILL_SUBJECT') || 'Annushka spilled the oil'));

  section.addWidget(textInput_('ACTION_REQUIRED_DAYS', 'Action required days', props.getProperty('ACTION_REQUIRED_DAYS') || '7'));
  section.addWidget(textInput_('SPILL_DAYS', 'Spill days', props.getProperty('SPILL_DAYS') || '10'));

  const buttonSet = CardService.newButtonSet()
    .addButton(CardService.newTextButton()
      .setText('Save settings')
      .setOnClickAction(CardService.newAction().setFunctionName('saveConfig')))
    .addButton(CardService.newTextButton()
      .setText('Search docs')
      .setOnClickAction(CardService.newAction().setFunctionName('searchDocs')))
    .addButton(CardService.newTextButton()
      .setText('Install daily trigger')
      .setOnClickAction(CardService.newAction().setFunctionName('installDailyTrigger')))
    .addButton(CardService.newTextButton()
      .setText('Run now (test)')
      .setOnClickAction(CardService.newAction().setFunctionName('runAnnushka')));

  section.addWidget(buttonSet);

  const status = getStatusText_();
  section.addWidget(CardService.newTextParagraph().setText(status));

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Annushka Watchdog'))
    .addSection(section)
    .build();
}

function textInput_(name, title, value) {
  return CardService.newTextInput()
    .setFieldName(name)
    .setTitle(title)
    .setValue(value || '');
}

function saveConfig(e) {
  const form = e.formInput || {};
  const props = PropertiesService.getScriptProperties();

  const keys = [
    'OWNER_EMAIL', 'DOC_ID', 'DOC_URL', 'RECIPIENTS',
    'STATUS_SUBJECT', 'ACTION_SUBJECT', 'SPILL_SUBJECT',
    'ACTION_REQUIRED_DAYS', 'SPILL_DAYS'
  ];

  keys.forEach(key => {
    if (form[key] !== undefined) props.setProperty(key, String(form[key]).trim());
  });

  // If a doc was picked, prefer that.
  if (form.DOC_PICK) {
    const file = DriveApp.getFileById(String(form.DOC_PICK));
    props.setProperty('DOC_ID', file.getId());
    props.setProperty('DOC_URL', file.getUrl());
  } else if (form.DOC_URL && !form.DOC_ID) {
    const extracted = extractDocId_(String(form.DOC_URL));
    if (extracted) props.setProperty('DOC_ID', extracted);
  }

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText('Settings saved'))
    .setNavigation(CardService.newNavigation().updateCard(buildConfigCard_({})))
    .build();
}

function searchDocs(e) {
  const form = e.formInput || {};
  const query = (form.DOC_QUERY || '').toString().trim();
  const candidates = query ? searchDocsByTitle_(query) : getRecentDocs_();

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(buildConfigCard_({
      docQuery: query,
      docCandidates: candidates
    })))
    .build();
}

function installDailyTrigger() {
  removeTriggers_('runAnnushka');
  ScriptApp.newTrigger('runAnnushka')
    .timeBased()
    .everyDays(1)
    .create();

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText('Daily trigger installed'))
    .setNavigation(CardService.newNavigation().updateCard(buildConfigCard_({})))
    .build();
}

function removeTriggers_(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === functionName) ScriptApp.deleteTrigger(t);
  });
}

function getStatusText_() {
  const props = PropertiesService.getScriptProperties();
  const spillDone = props.getProperty('SPILL_DONE') === 'true';
  return spillDone
    ? 'Status: SPILL_DONE=true (script stopped)'
    : 'Status: active';
}

function buildDocPicker_(candidates, selectedId) {
  const input = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Pick a doc (recent/search results)')
    .setFieldName('DOC_PICK');

  if (!candidates.length) {
    input.addItem('No documents found', '', false);
    return input;
  }

  candidates.forEach(doc => {
    input.addItem(doc.title, doc.id, doc.id === selectedId);
  });

  return input;
}

function getRecentDocs_() {
  // Best-effort recent docs list (limited scan).
  const docs = [];
  const files = DriveApp.getFilesByType(MimeType.GOOGLE_DOCS);
  let count = 0;
  while (files.hasNext() && count < 200) {
    const f = files.next();
    if (f.isTrashed()) continue;
    docs.push({ id: f.getId(), title: f.getName(), updated: f.getLastUpdated() });
    count += 1;
  }
  docs.sort((a, b) => b.updated - a.updated);
  return docs.slice(0, 15);
}

function searchDocsByTitle_(query) {
  const docs = [];
  const q = 'mimeType = \"application/vnd.google-apps.document\" and trashed = false and title contains \"' +
    escapeQueryValue_(query) + '\"';
  const files = DriveApp.searchFiles(q);
  let count = 0;
  while (files.hasNext() && count < 200) {
    const f = files.next();
    docs.push({ id: f.getId(), title: f.getName(), updated: f.getLastUpdated() });
    count += 1;
  }
  docs.sort((a, b) => b.updated - a.updated);
  return docs.slice(0, 20);
}

function escapeQueryValue_(value) {
  return value.replace(/\\\\/g, '\\\\\\\\').replace(/\"/g, '\\\\\"');
}

function extractDocId_(url) {
  const match = url.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

// Core logic

function runAnnushka() {
  const props = PropertiesService.getScriptProperties();

  if (props.getProperty('SPILL_DONE') === 'true') {
    return;
  }

  const config = loadConfig_(props);

  const now = new Date();
  const latestRead = getLatestMessageDate_('in:inbox is:read');
  const latestTrash = getLatestMessageDate_('in:trash');

  const latest = maxDate_(latestRead, latestTrash);
  const daysOld = latest ? Math.floor((now - latest) / (1000 * 60 * 60 * 24)) : Infinity;

  let didActionRequired = false;
  let didSpill = false;

  if (daysOld >= config.actionRequiredDays) {
    sendEmail_(config.ownerEmail, config.actionSubject, buildActionRequiredBody_(latest, daysOld, latestRead, latestTrash));
    didActionRequired = true;
    starAndMarkImportant_(config.actionSubject);
  }

  if (daysOld >= config.spillDays) {
    shareDoc_(config.docId, config.recipients);
    notifyRecipients_(config.recipients, config.docUrl, config.spillSubject);
    sendEmail_(config.ownerEmail, config.spillSubject, buildSpillBody_(config.docUrl, latest, daysOld));
    didSpill = true;

    props.setProperty('SPILL_DONE', 'true');
  }

  sendEmail_(
    config.ownerEmail,
    config.statusSubject,
    buildStatusBody_(now, latestRead, latestTrash, daysOld, didActionRequired, didSpill)
  );
}

function loadConfig_(props) {
  return {
    ownerEmail: requireProp_(props, 'OWNER_EMAIL'),
    docId: requireProp_(props, 'DOC_ID'),
    docUrl: requireProp_(props, 'DOC_URL'),
    recipients: requireProp_(props, 'RECIPIENTS').split(',').map(s => s.trim()).filter(Boolean),

    statusSubject: props.getProperty('STATUS_SUBJECT') || 'Annushka Log',
    actionSubject: props.getProperty('ACTION_SUBJECT') || 'Annushka ABOUT TO SPILL!',
    spillSubject: props.getProperty('SPILL_SUBJECT') || 'Annushka spilled the oil',

    actionRequiredDays: parseInt(props.getProperty('ACTION_REQUIRED_DAYS') || '7', 10),
    spillDays: parseInt(props.getProperty('SPILL_DAYS') || '10', 10),
  };
}

function requireProp_(props, key) {
  const value = props.getProperty(key);
  if (!value) throw new Error('Missing Script Property: ' + key);
  return value;
}

function getLatestMessageDate_(query) {
  const threads = GmailApp.search(query, 0, 1);
  if (!threads.length) return null;

  const messages = threads[0].getMessages();
  let latest = null;
  for (const msg of messages) {
    const d = msg.getDate();
    if (!latest || d > latest) latest = d;
  }
  return latest;
}

function maxDate_(a, b) {
  if (a && b) return a > b ? a : b;
  return a || b || null;
}

function shareDoc_(docId, recipients) {
  const file = DriveApp.getFileById(docId);
  for (const email of recipients) {
    file.addEditor(email);
  }
}

function notifyRecipients_(recipients, docUrl, subject) {
  const body = 'A document has been shared with you:\n\n' + docUrl + '\n';
  for (const email of recipients) {
    sendEmail_(email, subject, body);
  }
}

function sendEmail_(to, subject, body) {
  GmailApp.sendEmail(to, subject, body);
}

function starAndMarkImportant_(subject) {
  const threads = GmailApp.search('in:inbox subject:"' + subject + '"');
  for (const t of threads) {
    t.star();
    t.markImportant();
  }
}

function buildActionRequiredBody_(latest, daysOld, latestRead, latestTrash) {
  return [
    'ACTION REQUIRED',
    '',
    'Latest activity date: ' + (latest ? latest.toISOString() : 'NONE'),
    'Days old: ' + daysOld,
    '',
    'Latest read msg date: ' + (latestRead ? latestRead.toISOString() : 'NONE'),
    'Latest trash msg date: ' + (latestTrash ? latestTrash.toISOString() : 'NONE'),
  ].join('\n');
}

function buildSpillBody_(docUrl, latest, daysOld) {
  return [
    'SPILL TRIGGERED',
    '',
    'Latest activity date: ' + (latest ? latest.toISOString() : 'NONE'),
    'Days old: ' + daysOld,
    '',
    'Doc: ' + docUrl,
  ].join('\n');
}

function buildStatusBody_(now, latestRead, latestTrash, daysOld, didActionRequired, didSpill) {
  return [
    'Run time: ' + now.toISOString(),
    '',
    'Latest read msg date: ' + (latestRead ? latestRead.toISOString() : 'NONE'),
    'Latest trash msg date: ' + (latestTrash ? latestTrash.toISOString() : 'NONE'),
    'Days old: ' + daysOld,
    '',
    'Action required email sent: ' + didActionRequired,
    'Spill triggered: ' + didSpill,
  ].join('\n');
}
