export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PROVIDERS = ['Gmail', 'Outlook', 'Yahoo', 'Other'];
export const CATEGORIES = ['Study', 'Work', 'Personal', 'Finance', 'Social', 'Shopping', 'Other'];
export const ACCOUNT_FIELDS = [
  'emailAddress',
  'label',
  'provider',
  'category',
  'purpose',
  'storageDetails',
  'importantLinks',
  'notes',
  'isFavorite'
];

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function validateCredentials(input, mode) {
  const errors = {};
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const email = normalizeEmail(input?.email);
  const password = input?.password;

  if (mode === 'register' && (name.length < 2 || name.length > 60)) {
    errors.name = 'Name must be between 2 and 60 characters.';
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    errors.password = 'Password must be between 8 and 72 characters.';
  }
  return { errors, name, email, password };
}

export function validateAccount(input, { partial = false } = {}) {
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { errors: { body: 'A JSON object is required.' }, value: {} };
  }
  const unknown = Object.keys(input).filter((key) => !ACCOUNT_FIELDS.includes(key));
  if (unknown.length) errors.body = `Unsupported field${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}.`;

  const value = {};
  if (!partial || Object.hasOwn(input, 'emailAddress')) {
    const emailAddress = normalizeEmail(input.emailAddress);
    if (emailAddress.length > 254 || !EMAIL_PATTERN.test(emailAddress)) errors.emailAddress = 'Enter a valid email address.';
    else value.emailAddress = emailAddress;
  }
  if (!partial || Object.hasOwn(input, 'label')) {
    const label = typeof input.label === 'string' ? input.label.trim() : '';
    if (!label || label.length > 100) errors.label = 'Label must be between 1 and 100 characters.';
    else value.label = label;
  }
  if (Object.hasOwn(input, 'provider')) {
    if (!PROVIDERS.includes(input.provider)) errors.provider = 'Choose a valid email provider.';
    else value.provider = input.provider;
  } else if (!partial) value.provider = 'Other';

  if (Object.hasOwn(input, 'category')) {
    if (!CATEGORIES.includes(input.category)) errors.category = 'Choose a valid category.';
    else value.category = input.category;
  } else if (!partial) value.category = 'Personal';

  for (const field of ['purpose', 'storageDetails', 'notes']) {
    const maxLength = field === 'storageDetails' ? 1000 : 2000;
    if (Object.hasOwn(input, field)) {
      if (typeof input[field] !== 'string' || input[field].length > maxLength) {
        errors[field] = `${field} must be ${maxLength} characters or fewer.`;
      } else value[field] = input[field].trim();
    } else if (!partial) value[field] = '';
  }

  if (Object.hasOwn(input, 'importantLinks')) {
    if (!Array.isArray(input.importantLinks) || input.importantLinks.length > 20) {
      errors.importantLinks = 'Provide up to 20 important links.';
    } else {
      const links = [];
      input.importantLinks.forEach((link, index) => {
        if (!link || typeof link !== 'object' || Array.isArray(link)) {
          errors[`importantLinks.${index}`] = 'Each link needs a title and URL.';
          return;
        }
        const title = typeof link.title === 'string' ? link.title.trim() : '';
        const url = typeof link.url === 'string' ? link.url.trim() : '';
        let validUrl = false;
        try {
          const parsed = new URL(url);
          validUrl = ['http:', 'https:'].includes(parsed.protocol);
        } catch { /* invalid URL */ }
        if (!title || title.length > 100 || !validUrl || url.length > 2048) {
          errors[`importantLinks.${index}`] = 'Enter a link title and a valid HTTP(S) URL.';
        } else links.push({ title, url });
        if (Object.keys(link).some((key) => !['title', 'url'].includes(key))) {
          errors[`importantLinks.${index}`] = 'Links may only include title and URL.';
        }
      });
      value.importantLinks = links;
    }
  } else if (!partial) value.importantLinks = [];

  if (Object.hasOwn(input, 'isFavorite')) {
    if (typeof input.isFavorite !== 'boolean') errors.isFavorite = 'Favorite must be true or false.';
    else value.isFavorite = input.isFavorite;
  } else if (!partial) value.isFavorite = false;

  return { errors, value };
}
