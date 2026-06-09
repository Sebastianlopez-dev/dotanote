import { describe, it, expect } from 'vitest';
import { findFormatById, getFormatPrompt } from '../lib/magic-format';
import { createDefaultMagicFormats } from '../lib/settings';
import { MagicFormat } from '../types';

describe('createDefaultMagicFormats', () => {
  it('returns exactly 4 formats', () => {
    const formats = createDefaultMagicFormats();
    expect(formats).toHaveLength(4);
  });

  it('has Executive as the default format with isDefault and isPinned', () => {
    const formats = createDefaultMagicFormats();
    const executive = formats.find((f) => f.id === 'default');
    expect(executive).toBeDefined();
    expect(executive).toMatchObject({
      name: 'Executive',
      isDefault: true,
      isPinned: true,
    });
  });

  it('has Formal, Casual, and Puntual formats', () => {
    const formats = createDefaultMagicFormats();
    expect(formats.find((f) => f.id === 'formal')).toMatchObject({
      name: 'Formal',
      isPinned: true,
    });
    expect(formats.find((f) => f.id === 'casual')).toMatchObject({
      name: 'Casual',
      isPinned: true,
    });
    expect(formats.find((f) => f.id === 'puntual')).toMatchObject({
      name: 'Puntual',
      isPinned: true,
    });
  });

  it('every default has non-empty id, name, and prompt', () => {
    const formats = createDefaultMagicFormats();
    for (const format of formats) {
      expect(format.id).toBeTruthy();
      expect(format.name).toBeTruthy();
      expect(format.prompt).toBeTruthy();
    }
  });
});

describe('findFormatById', () => {
  it('returns the format matching the given id', () => {
    const formats = createDefaultMagicFormats();
    const result = findFormatById(formats, 'formal');
    expect(result?.id).toBe('formal');
    expect(result?.name).toBe('Formal');
  });

  it('falls back to the default format when no id is provided', () => {
    const formats = createDefaultMagicFormats();
    const result = findFormatById(formats, undefined);
    expect(result?.id).toBe('default');
    expect(result?.isDefault).toBe(true);
  });

  it('falls back to the default format when id is not found', () => {
    const formats = createDefaultMagicFormats();
    const result = findFormatById(formats, 'nonexistent');
    expect(result?.id).toBe('default');
    expect(result?.isDefault).toBe(true);
  });

  it('falls back to the first format when no default is set and id is missing', () => {
    const formats: MagicFormat[] = [
      { id: 'alpha', name: 'Alpha', prompt: 'alpha prompt', isPinned: true },
      { id: 'beta', name: 'Beta', prompt: 'beta prompt', isPinned: true },
    ];
    const result = findFormatById(formats, 'nonexistent');
    expect(result?.id).toBe('alpha');
  });

  it('falls back to the first format when no id is provided and no default is set', () => {
    const formats: MagicFormat[] = [
      { id: 'alpha', name: 'Alpha', prompt: 'alpha prompt', isPinned: true },
    ];
    const result = findFormatById(formats, undefined);
    expect(result?.id).toBe('alpha');
  });

  it('returns undefined for an empty formats array', () => {
    const result = findFormatById([], 'any');
    expect(result).toBeUndefined();
  });

  it('returns undefined when no id is provided and array is empty', () => {
    const result = findFormatById([], undefined);
    expect(result).toBeUndefined();
  });
});

describe('getFormatPrompt', () => {
  it('returns the prompt for the selected format by id', () => {
    const formats = createDefaultMagicFormats();
    const prompt = getFormatPrompt(formats, 'casual');
    expect(prompt).toBe('Reescribe este texto con un tono cercano, amigable y conversacional.');
  });

  it('returns the default prompt when no id is provided', () => {
    const formats = createDefaultMagicFormats();
    const prompt = getFormatPrompt(formats, undefined);
    expect(prompt).toBe(
      'Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada.'
    );
  });

  it('returns the default prompt when id is not found', () => {
    const formats = createDefaultMagicFormats();
    const prompt = getFormatPrompt(formats, 'nonexistent');
    expect(prompt).toBe(
      'Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada.'
    );
  });

  it('returns undefined when the format has no prompt field', () => {
    const formats: MagicFormat[] = [
      { id: 'empty', name: 'Empty', prompt: '', isPinned: true },
    ];
    const prompt = getFormatPrompt(formats, 'empty');
    expect(prompt).toBe('');
  });

  it('returns undefined for an empty formats array', () => {
    const prompt = getFormatPrompt([], 'any');
    expect(prompt).toBeUndefined();
  });

  it('forwards the exact prompt string for enhancer usage', () => {
    const formats: MagicFormat[] = [
      {
        id: 'custom',
        name: 'Custom',
        prompt: 'Reescribe este texto en estilo haiku.',
        isDefault: true,
        isPinned: true,
      },
    ];
    const prompt = getFormatPrompt(formats, 'custom');
    expect(prompt).toBe('Reescribe este texto en estilo haiku.');
  });
});
