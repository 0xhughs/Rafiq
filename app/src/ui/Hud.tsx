import { RESTORE_NOTICE, STORAGE_WARNING } from '../engine/constants';
import { hasItem } from '../engine/inventory';
import { getActionable } from '../engine/interact';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onHelp: () => void;
  onDismissRestore: () => void;
  onOpenPassport: () => void;
}

function Banners({
  state,
  onDismissRestore,
}: {
  state: GameState;
  onDismissRestore: () => void;
}) {
  return (
    <>
      {state.saveStatus === 'unavailable' ? (
        <p className="banner warning" data-testid="storage-warning" role="status">
          {STORAGE_WARNING}
        </p>
      ) : null}
      {state.restoreNotice ? (
        <p className="banner restore" data-testid="save-recovered" role="status">
          {RESTORE_NOTICE}
          <button type="button" className="ghost banner-dismiss" onClick={onDismissRestore}>
            حسناً
          </button>
        </p>
      ) : null}
    </>
  );
}

export function Hud({ state, onHelp, onDismissRestore, onOpenPassport }: Props) {
  if (state.mode === 'name_entry' || state.mode === 'confirm_name') {
    if (state.saveStatus !== 'unavailable' && !state.restoreNotice) return null;
    return (
      <header className="hud" data-testid="hud-banners">
        <Banners state={state} onDismissRestore={onDismissRestore} />
      </header>
    );
  }
  const nearby = getActionable(state);
  const carryingBag = hasItem(state.inventory, 'trash_bag') || state.trash === 'carried';
  const carryingParcel = hasItem(state.inventory, 'repair_parcel');
  let inventoryLabel = 'لا يوجد شيء محمول';
  if (carryingBag && carryingParcel) inventoryLabel = 'كيس القمامة، طرد الإصلاح';
  else if (carryingBag) inventoryLabel = 'كيس القمامة';
  else if (carryingParcel) inventoryLabel = 'طرد الإصلاح';
  return (
    <header className="hud" data-testid="hud" data-restored={state.pathQuest.restored ? 'true' : 'false'}>
      <Banners state={state} onDismissRestore={onDismissRestore} />
      <div className="hud-main">
        <p className="hud-kicker">رفيق</p>
        <p className="hud-objective" data-testid="hud-objective">
          {state.storyObjective}
        </p>
      </div>
      <div
        className="inventory"
        data-testid="inventory"
        data-carried={carryingBag || carryingParcel ? 'true' : 'false'}
      >
        {inventoryLabel}
      </div>
      <button type="button" className="ghost hud-help" data-testid="help-button" onClick={onHelp}>
        دفتر / مساعدة
      </button>
      {state.endingState === 'invited' || state.endingState === 'issued' ? (
        <button
          type="button"
          className="ghost hud-help"
          data-testid="open-passport"
          onClick={onOpenPassport}
        >
          الجواز
        </button>
      ) : null}
      {nearby ? (
        <p className="interact-hint" data-testid="interact-hint">
          <span dir="ltr">E</span>
          {' / مسافة'}
          <span className="interact-rest">{nearby.label.replace(/^E \/ مسافة — /, ' — ')}</span>
        </p>
      ) : (
        <p className="interact-hint is-hidden" data-testid="interact-hint-empty" />
      )}
      {state.shopFeedback && state.mode === 'playing' ? (
        <p className="banner restore" data-testid="shop-feedback" role="status">
          {state.shopFeedback}
        </p>
      ) : null}
      {state.libraryQuest.contextModule ? (
        <p className="inventory cassette-chip" data-testid="context-module">
          وحدة السياق
        </p>
      ) : null}
      {state.festivalQuest.workshopMaterials ? (
        <p className="inventory cassette-chip" data-testid="workshop-materials">
          مواد المعاينة
        </p>
      ) : null}
      {state.workshopQuest.servicePosted ? (
        <p className="inventory cassette-chip" data-testid="service-posted">
          لوحة المواعيد
        </p>
      ) : null}
      {state.kioskQuest.kioskReady ? (
        <p className="inventory cassette-chip" data-testid="kiosk-ready">
          كiosk صالح
        </p>
      ) : null}
      {state.labQuest.labReady ? (
        <p className="inventory cassette-chip" data-testid="lab-ready">
          إنتاج مُصلح
        </p>
      ) : null}
      {state.agentQuest.agentReady ? (
        <p className="inventory cassette-chip" data-testid="planning-core">
          نواة التخطيط
        </p>
      ) : null}
      {state.bridgeQuest.bridgeReady ? (
        <p className="inventory cassette-chip" data-testid="civic-connector">
          موصل السجل
        </p>
      ) : null}
      {state.skillQuest.skillReady ? (
        <p className="inventory cassette-chip" data-testid="skill-shelf">
          رف المهارات
        </p>
      ) : null}
      {state.approvalQuest.approvalReady ? (
        <p className="inventory cassette-chip" data-testid="human-gate">
          موافقة بشرية
        </p>
      ) : null}
      {state.crewQuest.crewReady ? (
        <p className="inventory cassette-chip" data-testid="crew-output">
          ناتج مُراجع
        </p>
      ) : null}
      {state.pathQuest.restored ? (
        <p className="inventory cassette-chip" data-testid="restored-agent">
          وكيل مُشرف
        </p>
      ) : null}
    </header>
  );
}
