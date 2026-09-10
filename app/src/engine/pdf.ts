const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function utf16BeInfo(text: string): string {
  const units: number[] = [0xfeff];
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code > 0xffff) {
      const cp = code - 0x10000;
      units.push(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    } else {
      units.push(code);
    }
  }
  let hex = '<';
  for (const unit of units) {
    hex += ((unit >> 8) & 0xff).toString(16).padStart(2, '0');
    hex += (unit & 0xff).toString(16).padStart(2, '0');
  }
  hex += '>';
  return hex;
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    (((bytes[offset] ?? 0) << 24) |
      ((bytes[offset + 1] ?? 0) << 16) |
      ((bytes[offset + 2] ?? 0) << 8) |
      (bytes[offset + 3] ?? 0)) >>>
    0
  );
}

export function pngHasSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIG.length) return false;
  return PNG_SIG.every((value, index) => bytes[index] === value);
}

export function pngSize(bytes: Uint8Array): { width: number; height: number } {
  if (!pngHasSignature(bytes) || bytes.length < 24) {
    return { width: 612, height: 792 };
  }
  const width = readU32(bytes, 16);
  const height = readU32(bytes, 20);
  if (width === 0 || height === 0 || width > 4096 || height > 4096) {
    return { width: 612, height: 792 };
  }
  return { width, height };
}

export function wrapPngInPdf(
  png: Uint8Array,
  playerName: string,
  payloadLines: readonly string[],
): Uint8Array {
  const { width, height } = pngSize(png);
  const subject = payloadLines.join('\n');
  const titleHex = utf16BeInfo(playerName);
  const subjectHex = utf16BeInfo(`${playerName}\n${subject}`);
  const comments = ['%RAFIQ-PASSPORT', ...payloadLines.map((line) => `%${line}`)].join('\n');
  const content = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q\n`;
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  let pos = 0;
  const offsets: number[] = [0];

  function add(data: string | Uint8Array): void {
    const bytes = typeof data === 'string' ? encoder.encode(data) : data;
    parts.push(bytes);
    pos += bytes.length;
  }

  add(`%PDF-1.4\n${comments}\n`);
  offsets.push(pos);
  add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets.push(pos);
  add('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  offsets.push(pos);
  add(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
  );
  offsets.push(pos);
  add(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);
  offsets.push(pos);
  add(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${png.length} >>\nstream\n`,
  );
  add(png);
  add('\nendstream\nendobj\n');
  offsets.push(pos);
  add(`6 0 obj\n<< /Title ${titleHex} /Subject ${subjectHex} /Author ${titleHex} >>\nendobj\n`);

  const xrefStart = pos;
  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  add(xref);
  add(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);
  return concatBytes(parts);
}
