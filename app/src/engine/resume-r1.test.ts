import { describe, expect, it } from 'vitest';
import { JOURNAL_CAP, TILE } from './constants';
import {
  CHECKPOINT_AFTER_HELP,
  JOURNAL_TEXT,
  OBJECTIVES,
  recordEvent,
} from './dialogue';
import { createAgentQuest } from './agent';
import { createApprovalQuest } from './approval';
import { BRIDGE_EXPLAIN, MCP_NOTE, createBridgeQuest } from './bridge';
import { createCrewQuest } from './crew';
import { createKioskQuest } from './kiosk';
import { createLabQuest } from './lab';
import { STREET, WORKSHOP, WORLD_POS } from './maps';
import { createPathQuest } from './path';
import { createSkillQuest } from './skill';
import { EVIDENCE_IDS } from './types';

const AFTER_HELP = 'رفيق أصبح رفيقك في الحي. البقالة عند الزاوية مفتوحة الآن، وبعدها واجهة المكتبة.';
const WORKSHOP_LETTERS = 'u z m j k t d q a e w l h x f v J Z O V 1 2 3 4'.split(' ');

describe('R1 leftover opening copy and invariants', () => {
  it('exports CHECKPOINT_AFTER_HELP without leftover development copy', () => {
    expect(CHECKPOINT_AFTER_HELP).toBe(AFTER_HELP);
    expect(CHECKPOINT_AFTER_HELP).not.toMatch(/قيد التطوير/);
    expect(CHECKPOINT_AFTER_HELP).not.toMatch(/سيُفتح|مغلق/);
    expect(CHECKPOINT_AFTER_HELP).toMatch(/بقالة/);
    expect(CHECKPOINT_AFTER_HELP).toMatch(/مكتبة/);
    expect(OBJECTIVES.cornerStore).toBe(
      'لنبدأ بالمتجر عند الزاوية: ادخل بقالة الزاوية، ثم سر إلى واجهة المكتبة.',
    );
    expect(OBJECTIVES.cornerStore).not.toMatch(/سيُفتح|مغلق/);
    expect(OBJECTIVES.passportIssued).toBe(
      'حُفظ جواز مدينة الذكاء الاصطناعي محلياً. يمكنك تنزيله من جديد من الروبوت أو من الشريط.',
    );
    expect(OBJECTIVES.passportReady).toBe(
      'الجواز جاهز. أكّد الاسم ثم نزّل الصورة أو الملف من شاشة الوداع.',
    );
    expect(OBJECTIVES.restored).toBe(
      'أُنجزت سهرة القراءة تحت إشراف، والروبوت صار جاهزاً للعمل في الحي. مدير الورشة شكرك.',
    );
  });

  it('keeps landmarks, workshop letters, cap, 34 ids, and data-slice 17', () => {
    expect(WORLD_POS.robot).toEqual({ x: 12 * TILE + 24, y: 5 * TILE + 24 });
    expect(WORLD_POS.apartmentDoor).toBeTruthy();
    expect(WORLD_POS.dumpster).toBeTruthy();
    expect(WORLD_POS.shopDoor).toBeTruthy();
    expect(WORLD_POS.parcelDoor).toBeTruthy();
    expect(WORLD_POS.libraryDoor).toBeTruthy();
    expect(WORLD_POS.libraryInner).toBeTruthy();
    expect(WORLD_POS.newsroomDoor).toBeTruthy();
    expect(WORLD_POS.festivalDoor).toBeTruthy();
    expect(WORLD_POS.workshopDoor).toBeTruthy();
    const street = STREET.legend.join('');
    expect(street).toContain('P');
    expect(street).toContain('R');
    expect(street).toContain('I');
    expect(street).toContain('E');
    expect(street).toContain('G');
    expect(street).toContain('Y');
    expect(WORKSHOP.legend[8]).toBe('#O1wJfhZ.vx3l2V#');
    expect(WORKSHOP.legend[8][11]).toBe('3');
    expect(WORKSHOP.legend[8][8]).toBe('.');
    expect(WORKSHOP.legend[6]).toBe('#k.q......t4...#');
    expect(WORKSHOP.legend[6][11]).toBe('4');
    expect(WORKSHOP.legend[6][8]).toBe('.');
    expect(WORKSHOP.legend[7][8]).toBe('d');
    const workshop = WORKSHOP.legend.join('');
    for (const letter of WORKSHOP_LETTERS) {
      expect(workshop, letter).toContain(letter);
    }
    expect(JOURNAL_CAP).toBe(112);
    expect(EVIDENCE_IDS.length).toBe(34);
  });

  it('does not put MCP, harness, or شهادة in persistable copy; connect still names MCP', () => {
    const persistable = [
      CHECKPOINT_AFTER_HELP,
      OBJECTIVES.cornerStore,
      OBJECTIVES.passportReady,
      OBJECTIVES.passportIssued,
      OBJECTIVES.restored,
      JOURNAL_TEXT.source_verified,
      JOURNAL_TEXT.path_opened,
      JOURNAL_TEXT.passport_issued,
      JSON.stringify(createPathQuest()),
      JSON.stringify({ ...createKioskQuest(), kioskReady: true }),
      JSON.stringify({ ...createLabQuest(), labReady: true }),
      JSON.stringify({ ...createAgentQuest(), agentReady: true }),
      JSON.stringify({ ...createBridgeQuest(), bridgeReady: true }),
      JSON.stringify({ ...createSkillQuest(), skillReady: true }),
      JSON.stringify({ ...createApprovalQuest(), approvalReady: true }),
      JSON.stringify({ ...createCrewQuest(), crewReady: true }),
      JSON.stringify({ ...createPathQuest(), restored: true }),
    ].join('\n');
    expect(persistable).not.toMatch(/MCP/);
    expect(persistable).not.toMatch(/harness/);
    expect(persistable).not.toMatch(/شهادة/);
    expect(`${BRIDGE_EXPLAIN.connector_roles} ${MCP_NOTE}`).toMatch(/MCP/);
    expect(CHECKPOINT_AFTER_HELP).not.toMatch(/fetch\(/);
    expect(CHECKPOINT_AFTER_HELP).not.toMatch(/Date\.now\(/);
    expect(CHECKPOINT_AFTER_HELP).not.toMatch(/setInterval/);
  });

  it('treats a second source_verified or passport_issued as a no-op', () => {
    const source = recordEvent([], 'source_verified');
    expect(recordEvent(source, 'source_verified')).toEqual(source);
    expect(source).toHaveLength(1);
    const issued = recordEvent([], 'passport_issued');
    expect(recordEvent(issued, 'passport_issued')).toEqual(issued);
    expect(issued).toHaveLength(1);
  });
});
