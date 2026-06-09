import { MagicFormat } from '../types';

export function findFormatById(
  formats: MagicFormat[],
  id?: string
): MagicFormat | undefined {
  if (id) {
    const found = formats.find((f) => f.id === id);
    if (found) return found;
  }
  const defaultFormat = formats.find((f) => f.isDefault);
  if (defaultFormat) return defaultFormat;
  return formats[0];
}

export function getFormatPrompt(
  formats: MagicFormat[],
  id?: string
): string | undefined {
  return findFormatById(formats, id)?.prompt;
}
