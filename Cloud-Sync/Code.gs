/* KSS Pearl Poultry Farm - cloud sync + software release server (Google Apps Script web app).
   Setup: script.google.com > New project > paste this file > Deploy > New deployment > Web app
   Execute as: Me   |   Who has access: Anyone   > Deploy > Authorize > copy the Web app URL (ends with /exec).
   To UPDATE an existing deployment: paste this file, then Deploy > Manage deployments > pencil icon > Version: New version > Deploy (the URL stays the same).
   Data is kept in one JSON file in the owner's Google Drive: KSS_Pearl_Farm_Data.json
   Roles are enforced HERE by three secret keys: owner (full), admin helper (operations + view money), worker (shed entries only).
   Only the owner key can publish software updates (action "publishUpdate"). */
var FILE_NAME = 'KSS_Pearl_Farm_Data.json';
var ALL = ['b', 'log', 'mort', 'wt', 'vac', 'med', 'stock', 'exp', 'sale', 'users', 'co', 'ack'];
var PUSH = { owner: ALL, admin: ['b', 'log', 'mort', 'wt', 'vac', 'med', 'stock', 'co', 'ack'], worker: ['log', 'mort', 'wt', 'vac', 'med', 'stock', 'ack'] };
var PULL = { owner: ALL, admin: ['b', 'log', 'mort', 'wt', 'vac', 'med', 'stock', 'exp', 'sale', 'users', 'co', 'ack'], worker: ['b', 'log', 'mort', 'wt', 'vac', 'med', 'stock', 'users', 'ack'] };
var TOMB = { owner: ALL, admin: ['log', 'mort', 'wt', 'vac', 'med', 'stock', 'co'], worker: [] };
var AUDS = ['all', 'admins', 'workers'], TYPES = ['critical', 'feature', 'maintenance'];

function roleOf_(d, key) {
  if (!d.keys || !key) return '';
  if (key === d.keys.o) return 'owner';
  if (d.keys.a && key === d.keys.a) return 'admin';
  if (key === d.keys.w) return 'worker';
  return '';
}
function sees_(u, role) { return role === 'owner' || u.aud === 'all' || (u.aud === 'admins' && role === 'admin') || (u.aud === 'workers' && role === 'worker'); }
function updatesFor_(d, role) { return (d.updates || []).filter(function (u) { return sees_(u, role); }); }

function handle_(d, req, now) {
  d.recs = d.recs || {}; d.last = d.last || 0; d.updates = d.updates || []; now = Math.max(now, d.last + 1); d.last = now;
  var op = req.op || req.action;
  if (op === 'init') {
    if (d.keys) return { ok: false, error: 'already-initialised' };
    var ks = [String(req.ownerKey || ''), String(req.workerKey || '')];
    if (ks[0].length < 16 || ks[1].length < 16 || ks[0] === ks[1]) return { ok: false, error: 'bad-init' };
    d.keys = { o: ks[0], w: ks[1] };
    if (req.adminKey) { if (String(req.adminKey).length < 16 || req.adminKey === ks[0] || req.adminKey === ks[1]) return { ok: false, error: 'bad-init' }; d.keys.a = String(req.adminKey); }
    return { ok: true, now: now, role: 'owner' };
  }
  if (!d.keys) return { ok: false, error: 'not-initialised' };
  var role = roleOf_(d, req.key);
  if (!role) return { ok: false, error: 'bad-key' };

  if (op === 'rekey' || op === 'setKey') {
    var nk = String(req.newKey || req.workerKey || ''), tier = req.tier || 'worker';
    if (role !== 'owner' || nk.length < 16 || nk === d.keys.o || nk === d.keys.a || nk === d.keys.w) return { ok: false, error: 'denied' };
    if (tier === 'admin') d.keys.a = nk; else if (tier === 'worker') d.keys.w = nk; else return { ok: false, error: 'denied' };
    return { ok: true, now: now, role: role };
  }
  if (op === 'publishUpdate') {
    if (role !== 'owner') return { ok: false, error: 'denied' };
    var u = req.update || {};
    var ver = String(u.ver || '').trim(), title = String(u.title || '').trim(), notes = String(u.notes || '').trim();
    if (!ver || !title || !notes || ver.length > 40 || title.length > 160 || notes.length > 4000 || AUDS.indexOf(u.aud) < 0 || TYPES.indexOf(u.type) < 0) return { ok: false, error: 'bad-update' };
    var url = String(u.url || '').trim();
    if (url && (url.length > 300 || !/^https:\/\//.test(url))) return { ok: false, error: 'bad-update' };
    var up = { id: 'upd' + now, ver: ver, title: title, notes: notes, aud: u.aud, type: u.type, t: now, by: String(u.by || '').slice(0, 60), url: url, force: u.force ? 1 : 0 };
    d.updates.unshift(up); d.updates = d.updates.slice(0, 50);
    if (u.app) d.appMeta = { latestVersion: ver, releaseNotes: notes, updateUrl: url, publishedAt: now, forceUpdate: !!u.force, id: up.id };
    return { ok: true, now: now, role: role, update: up, updates: updatesFor_(d, role), appMeta: d.appMeta || null };
  }
  if (op === 'deleteUpdate') {
    if (role !== 'owner') return { ok: false, error: 'denied' };
    d.updates = d.updates.filter(function (x) { return x.id !== req.id; });
    if (d.appMeta && d.appMeta.id === req.id) delete d.appMeta;
    return { ok: true, now: now, role: role, updates: updatesFor_(d, role), appMeta: d.appMeta || null };
  }
  if (op === 'fetchLatestUpdates') return { ok: true, now: now, role: role, updates: updatesFor_(d, role), appMeta: d.appMeta || null };

  var push = req.push || {};
  PUSH[role].forEach(function (c) {
    (push[c] || []).forEach(function (r) {
      if (!r || !r.id) return;
      var k = c + ':' + r.id, cur = d.recs[k];
      if (!cur || (r.u || 0) > (cur.r.u || 0)) d.recs[k] = { c: c, r: r, s: now };
    });
  });
  (req.tomb || []).forEach(function (t) {
    if (!t || !t.id || TOMB[role].indexOf(t.c) < 0) return;
    var k = t.c + ':' + t.id, cur = d.recs[k];
    if (!cur || (t.u || 0) >= (cur.r.u || 0)) d.recs[k] = { c: t.c, r: { id: t.id, del: 1, u: t.u || now }, s: now };
  });
  if (role === 'owner' && req.meta && req.meta.farm) d.meta = { farm: String(req.meta.farm).slice(0, 80) };

  var since = +req.since || 0, out = {};
  Object.keys(d.recs).forEach(function (k) {
    var x = d.recs[k]; if (x.s <= since || PULL[role].indexOf(x.c) < 0) return;
    var r = x.r;
    if (!r.del) {
      if (role === 'worker' && x.c === 'b') { r = JSON.parse(JSON.stringify(r)); delete r.cost; }
      if (x.c === 'users') { if (role === 'worker' && r.role !== 'worker') return; if (role === 'admin' && r.role === 'owner') return; }
    }
    (out[x.c] = out[x.c] || []).push(r);
  });
  return { ok: true, now: now, role: role, recs: out, meta: d.meta || null, updates: updatesFor_(d, role), appMeta: d.appMeta || null };
}

function file_() { var it = DriveApp.getFilesByName(FILE_NAME); return it.hasNext() ? it.next() : DriveApp.createFile(FILE_NAME, '{}', 'application/json'); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return out_({ ok: true, app: 'KSS Pearl Poultry Farm sync', time: Date.now() }); }
function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(25000);
  try {
    var f = file_(), d = JSON.parse(f.getBlob().getDataAsString() || '{}');
    var res = handle_(d, JSON.parse(e.postData.contents), Date.now());
    f.setContent(JSON.stringify(d)); return out_(res);
  } catch (err) { return out_({ ok: false, error: String(err) }); } finally { lock.releaseLock(); }
}
