import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import app from '../src/app.js';
import { generatePdfBackup } from '../src/utils/pdfBackup.js';

test('email API is mounted at the authenticated /api/emails path', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const emailsResponse = await fetch(`${baseUrl}/api/emails`);
  assert.equal(emailsResponse.status, 401);
  assert.deepEqual(await emailsResponse.json(), { message: 'Please sign in to continue.' });

  const backupResponse = await fetch(`${baseUrl}/api/emails/backup/pdf`);
  assert.equal(backupResponse.status, 401);
  assert.deepEqual(await backupResponse.json(), { message: 'Please sign in to continue.' });

  const oldRouteResponse = await fetch(`${baseUrl}/api/accounts`);
  assert.equal(oldRouteResponse.status, 404);
});

test('generatePdfBackup generates a valid PDF buffer', async () => {
  const chunks = [];
  const mockRes = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    }
  });

  const sampleAccounts = [
    {
      label: 'Work Email',
      emailAddress: 'work@example.com',
      provider: 'Outlook',
      category: 'Work',
      purpose: 'Team sync and projects',
      storageDetails: 'OneDrive folder',
      importantLinks: [{ title: 'Docs', url: 'https://example.com/docs' }],
      notes: 'Work notes',
      isFavorite: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const user = { name: 'Test User', email: 'test@example.com' };

  await new Promise((resolve, reject) => {
    mockRes.on('finish', resolve);
    mockRes.on('error', reject);
    generatePdfBackup(mockRes, sampleAccounts, user);
  });

  const buffer = Buffer.concat(chunks);
  assert.ok(buffer.length > 500);
  // Verify PDF header magic bytes "%PDF-"
  assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
});

test('generatePdfBackup handles empty accounts list', async () => {
  const chunks = [];
  const mockRes = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    }
  });

  const user = { name: 'Empty User', email: 'empty@example.com' };

  await new Promise((resolve, reject) => {
    mockRes.on('finish', resolve);
    mockRes.on('error', reject);
    generatePdfBackup(mockRes, [], user);
  });

  const buffer = Buffer.concat(chunks);
  assert.ok(buffer.length > 300);
  assert.equal(buffer.subarray(0, 5).toString('ascii'), '%PDF-');
});
