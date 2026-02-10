/**
 * Annushka watchdog
 * Configure via Script Properties.
 */

function runAnnushka() {
  const props = PropertiesService.getScriptProperties();

  if (props.getProperty('SPILL_DONE') === 'true') {
    // Stop forever after spill.
    return;
  }

  const config = loadConfig(props);

  const now = new Date();
  const latestRead = getLatestMessageDate('in:inbox is:read');
  const latestTrash = getLatestMessageDate('in:trash');

  const latest = maxDate(latestRead, latestTrash);
  const daysOld = latest ? Math.floor((now - latest) / (1000 * 60 * 60 * 24)) : Infinity;

  let didActionRequired = false;
  let didSpill = false;

  if (daysOld >= config.actionRequiredDays) {
    sendEmail(config.ownerEmail, config.actionSubject, buildActionRequiredBody(latest, daysOld, latestRead, latestTrash));
    didActionRequired = true;
    starAndMarkImportant(config.actionSubject);
  }

  if (daysOld >= config.spillDays) {
    // Share doc + notify recipients + owner, then stop permanently.
    shareDoc(config.docId, config.recipients);
    notifyRecipients(config.recipients, config.docUrl, config.spillSubject);
    sendEmail(config.ownerEmail, config.spillSubject, buildSpillBody(config.docUrl, latest, daysOld));
    didSpill = true;

    props.setProperty('SPILL_DONE', 'true');
  }

  // Always send status email.
  sendEmail(
    config.ownerEmail,
    config.statusSubject,
    buildStatusBody(now, latestRead, latestTrash, daysOld, didActionRequired, didSpill)
  );
}

function loadConfig(props) {
  return {
    ownerEmail: requireProp(props, 'OWNER_EMAIL'),
    docId: requireProp(props, 'DOC_ID'),
    docUrl: requireProp(props, 'DOC_URL'),
    recipients: requireProp(props, 'RECIPIENTS').split(',').map(s => s.trim()).filter(Boolean),

    statusSubject: props.getProperty('STATUS_SUBJECT') || 'Annushka Log',
    actionSubject: props.getProperty('ACTION_SUBJECT') || 'Annushka ABOUT TO SPILL!',
    spillSubject: props.getProperty('SPILL_SUBJECT') || 'Annushka spilled the oil',

    actionRequiredDays: parseInt(props.getProperty('ACTION_REQUIRED_DAYS') || '7', 10),
    spillDays: parseInt(props.getProperty('SPILL_DAYS') || '10', 10),
  };
}

function requireProp(props, key) {
  const value = props.getProperty(key);
  if (!value) throw new Error('Missing Script Property: ' + key);
  return value;
}

function getLatestMessageDate(query) {
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

function maxDate(a, b) {
  if (a && b) return a > b ? a : b;
  return a || b || null;
}

function shareDoc(docId, recipients) {
  const file = DriveApp.getFileById(docId);
  for (const email of recipients) {
    file.addEditor(email);
  }
}

function notifyRecipients(recipients, docUrl, subject) {
  const body = 'A document has been shared with you:\n\n' + docUrl + '\n';
  for (const email of recipients) {
    sendEmail(email, subject, body);
  }
}

function sendEmail(to, subject, body) {
  GmailApp.sendEmail(to, subject, body);
}

function starAndMarkImportant(subject) {
  const threads = GmailApp.search('in:inbox subject:"' + subject + '"');
  for (const t of threads) {
    t.star();
    t.markImportant();
  }
}

function buildActionRequiredBody(latest, daysOld, latestRead, latestTrash) {
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

function buildSpillBody(docUrl, latest, daysOld) {
  return [
    'SPILL TRIGGERED',
    '',
    'Latest activity date: ' + (latest ? latest.toISOString() : 'NONE'),
    'Days old: ' + daysOld,
    '',
    'Doc: ' + docUrl,
  ].join('\n');
}

function buildStatusBody(now, latestRead, latestTrash, daysOld, didActionRequired, didSpill) {
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
