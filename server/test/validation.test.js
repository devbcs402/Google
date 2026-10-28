import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAccount, validateCredentials } from '../src/utils/validation.js';

test('credentials are normalized and passwords are bounded', () => {
  const valid = validateCredentials({ name: ' Ada Lovelace ', email: ' ADA@example.com ', password: 'correct horse' }, 'register');
  assert.deepEqual(valid.errors, {});
  assert.equal(valid.name, 'Ada Lovelace');
  assert.equal(valid.email, 'ada@example.com');
  assert.ok(validateCredentials({ email: 'bad', password: 'short' }, 'login').errors.email);
});

test('account validation rejects unexpected fields and coerced booleans', () => {
  assert.ok(validateAccount({ label: 'Mail', emailAddress: 'a@b.com', password: 'not stored' }).errors.body);
  assert.ok(validateAccount({ label: 'Mail', emailAddress: 'a@b.com', isFavorite: 'true' }).errors.isFavorite);
});

test('account validation normalizes supported account details', () => {
  const result = validateAccount({
    label: ' Personal inbox ',
    emailAddress: ' USER@example.com ',
    provider: 'Gmail',
    category: 'Study',
    importantLinks: [{ title: 'Settings', url: 'https://mail.example.com/settings' }]
  });
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.label, 'Personal inbox');
  assert.equal(result.value.emailAddress, 'user@example.com');
  assert.equal(result.value.category, 'Study');
  assert.deepEqual(result.value.importantLinks, [{ title: 'Settings', url: 'https://mail.example.com/settings' }]);
  assert.equal(result.value.purpose, '');
  assert.equal(result.value.isFavorite, false);
});

test('account validation rejects invalid provider, category, and unsafe links', () => {
  const result = validateAccount({
    label: 'Personal inbox',
    emailAddress: 'person@example.com',
    provider: 'Unknown',
    category: 'Unknown',
    importantLinks: [{ title: 'Bad link', url: 'javascript:alert(1)' }]
  });
  assert.ok(result.errors.provider);
  assert.ok(result.errors.category);
  assert.ok(result.errors['importantLinks.0']);
});

test('partial account updates validate only supplied fields', () => {
  const valid = validateAccount({ notes: 'Updated notes' }, { partial: true });
  assert.deepEqual(valid.errors, {});
  assert.deepEqual(valid.value, { notes: 'Updated notes' });
  assert.ok(validateAccount({ emailAddress: 'not-an-email' }, { partial: true }).errors.emailAddress);
});
