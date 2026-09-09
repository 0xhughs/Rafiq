export const NAME_MIN_CHARS = 2;
export const NAME_MAX_CHARS = 80;

export const NAME_ERRORS = {
  blank: 'يرجى إدخال اسمك الكامل.',
  tooShort: 'الاسم قصير جداً. اكتبه بحرفين على الأقل.',
  tooLong: 'الاسم طويل جداً. الحد الأقصى 80 حرفاً.',
} as const;

export function countChars(value: string): number {
  return Array.from(value).length;
}

export function validateName(
  raw: string,
): { ok: true; name: string } | { ok: false; message: string } {
  const name = raw.trim();
  if (name.length === 0) {
    return { ok: false, message: NAME_ERRORS.blank };
  }
  const chars = countChars(name);
  if (chars < NAME_MIN_CHARS) {
    return { ok: false, message: NAME_ERRORS.tooShort };
  }
  if (chars > NAME_MAX_CHARS) {
    return { ok: false, message: NAME_ERRORS.tooLong };
  }
  return { ok: true, name };
}
