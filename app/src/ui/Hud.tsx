import { getActionable } from '../engine/interact';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onHelp: () => void;
}

export function Hud({ state, onHelp }: Props) {
  if (state.mode === 'name_entry' || state.mode === 'confirm_name') {
    return null;
  }
  const nearby = getActionable(state);
  return (
    <header className="hud" data-testid="hud">
      <div className="hud-main">
        <p className="hud-kicker">رفيق</p>
        <p className="hud-objective" data-testid="hud-objective">
          {state.storyObjective}
        </p>
      </div>
      <div
        className="inventory"
        data-testid="inventory"
        data-carried={state.trash === 'carried' ? 'true' : 'false'}
      >
        {state.trash === 'carried' ? 'كيس القمامة' : 'لا يوجد شيء محمول'}
      </div>
      <button type="button" className="ghost hud-help" data-testid="help-button" onClick={onHelp}>
        دفتر / مساعدة
      </button>
      {nearby ? (
        <p className="interact-hint" data-testid="interact-hint">
          <span dir="ltr">E</span>
          {' / مسافة'}
          <span className="interact-rest">{nearby.label.replace(/^E \/ مسافة — /, ' — ')}</span>
        </p>
      ) : (
        <p className="interact-hint is-hidden" data-testid="interact-hint-empty" />
      )}
    </header>
  );
}
