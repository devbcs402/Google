import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('email API is mounted at the authenticated /api/emails path', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const emailsResponse = await fetch(`${baseUrl}/api/emails`);
  assert.equal(emailsResponse.status, 401);
  assert.deepEqual(await emailsResponse.json(), { message: 'Please sign in to continue.' });

  const oldRouteResponse = await fetch(`${baseUrl}/api/accounts`);
  assert.equal(oldRouteResponse.status, 404);
});
