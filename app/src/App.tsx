import { useEffect, useReducer, useRef } from 'react';
import { PLAYER_SPEED } from './engine/constants';
import { currentLine } from './engine/dialogue';
import { InputController } from './engine/input';
import { bootState, serializeState, stepGame } from './engine/state';
import { browserStore } from './engine/save';
import type { GameAction, GameState } from './engine/types';
import { WorldCanvas } from './render/WorldCanvas';
import { CheckpointNote } from './ui/CheckpointNote';
import { DialogueOverlay } from './ui/DialogueOverlay';
import { ExplainOverlay } from './ui/ExplainOverlay';
import { Hud } from './ui/Hud';
import { InspectOverlay } from './ui/InspectOverlay';
import { NameEntry } from './ui/NameEntry';
import { NoticeOverlay } from './ui/NoticeOverlay';
import { PauseHelp } from './ui/PauseHelp';
import { CalculatorOverlay } from './ui/CalculatorOverlay';
import { CrateOverlay } from './ui/CrateOverlay';
import { InstructionOverlay } from './ui/InstructionOverlay';
import { PayOverlay } from './ui/PayOverlay';
import { evidenceAttr } from './engine/shop';

function reducer(state: GameState, action: GameAction): GameState {
  return stepGame(browserStore, state, action);
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => bootState(browserStore));
  const stateRef = useRef(state);
  stateRef.current = state;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef(new InputController());

  useEffect(() => {
    window.__RAFIQ_TEST__ = {
      getState: () => serializeState(stateRef.current),
      dispatch: (action: GameAction) => dispatch(action),
      teleport: (map, x, y) => dispatch({ type: 'DEBUG_TELEPORT', map, x, y }),
    };
    return () => {
      delete window.__RAFIQ_TEST__;
    };
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    let last = 0;
    let frame = 0;
    const onDown = (event: KeyboardEvent) => {
      const typing = input.isTypingTarget(event.target);
      const mode = stateRef.current.mode;
      const worldEnabled = !typing && mode !== 'name_entry' && mode !== 'confirm_name';
      input.handleKeyDown(event, worldEnabled);
    };
    const onUp = (event: KeyboardEvent) => input.handleKeyUp(event);
    const onBlur = () => input.blur();
    const loop = (time: number) => {
      const dt = last === 0 ? 0 : Math.min(0.05, (time - last) / 1000);
      last = time;
      const current = stateRef.current;
      if (input.consumeEscape()) {
        dispatch({ type: 'CLOSE_OVERLAY' });
      }
      if (input.consumeHelp()) {
        dispatch({ type: 'OPEN_HELP' });
      }
      if (current.mode === 'playing') {
        const vector = input.moveVector();
        if (vector.x !== 0 || vector.y !== 0) {
          dispatch({
            type: 'MOVE',
            dx: vector.x * PLAYER_SPEED * dt,
            dy: vector.y * PLAYER_SPEED * dt,
          });
        }
      }
      if (input.consumeInteract()) {
        if (current.mode === 'dialogue') {
          const line = currentLine(current.dialogueNode);
          if (line && !line.choices) {
            dispatch({ type: 'ADVANCE_DIALOGUE' });
          }
        } else if (current.mode === 'playing') {
          dispatch({ type: 'INTERACT' });
        }
      }
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    if (state.mode === 'playing') {
      rootRef.current?.focus();
    }
  }, [state.mode]);

  const naming = state.mode === 'name_entry' || state.mode === 'confirm_name';

  return (
    <div
      ref={rootRef}
      className="shell"
      data-testid="game-root"
      tabIndex={0}
      data-mode={state.mode}
      data-map={state.map}
      data-trash={state.trash}
      data-encounter={state.encounter}
      data-dialogue={state.dialogueNode ?? ''}
      data-save={state.saveStatus}
      data-evidence={evidenceAttr(state.evidence)}
      data-shop-quest={state.shopQuest.phase}
      data-parcel-quest={state.parcelQuest.phase}
    >
      <Hud
        state={state}
        onHelp={() => dispatch({ type: 'OPEN_HELP' })}
        onDismissRestore={() => dispatch({ type: 'DISMISS_RESTORE_NOTICE' })}
      />
      <WorldCanvas state={state} />
      <CheckpointNote visible={state.checkpointReached} />
      {naming ? (
        <NameEntry
          state={state}
          onDraft={(value) => dispatch({ type: 'NAME_DRAFT', value })}
          onSubmit={() => dispatch({ type: 'SUBMIT_NAME' })}
          onConfirm={() => dispatch({ type: 'CONFIRM_NAME' })}
          onRevise={() => dispatch({ type: 'REVISE_NAME' })}
        />
      ) : null}
      {state.mode === 'dialogue' ? (
        <DialogueOverlay
          state={state}
          onAdvance={() => dispatch({ type: 'ADVANCE_DIALOGUE' })}
          onChoose={(choice) => dispatch({ type: 'CHOOSE', choice })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          onSubmitNl={(text) => dispatch({ type: 'SUBMIT_NL', text })}
        />
      ) : null}
      {state.mode === 'inspect' ? (
        <InspectOverlay state={state} onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })} />
      ) : null}
      {state.mode === 'calculator' ? (
        <CalculatorOverlay
          state={state}
          onKey={(key) => dispatch({ type: 'CALCULATOR_KEY', key })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'notice' ? (
        <NoticeOverlay
          state={state}
          onApply={(field) => dispatch({ type: 'NOTICE_APPLY', field })}
          onPost={(asDraft) => dispatch({ type: 'NOTICE_POST', asDraft })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'crate' ? (
        <CrateOverlay
          state={state}
          onDecide={(who) => dispatch({ type: 'CRATE_DECIDE', who })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'instruction' ? (
        <InstructionOverlay
          state={state}
          onSet={(field, value) => dispatch({ type: 'INSTRUCTION_SET', field, value })}
          onSend={() => dispatch({ type: 'INSTRUCTION_SEND' })}
          onAmbiguous={() => {
            dispatch({ type: 'INSTRUCTION_SET', field: 'parcel', value: 'gray' });
            dispatch({ type: 'INSTRUCTION_SET', field: 'location', value: 'any' });
            dispatch({ type: 'INSTRUCTION_SET', field: 'constraints', value: 'none' });
            dispatch({ type: 'INSTRUCTION_SET', field: 'returnFormat', value: 'none' });
            dispatch({ type: 'INSTRUCTION_SEND' });
          }}
          onSubmitNl={(text) => dispatch({ type: 'SUBMIT_NL', text })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'pay' ? (
        <PayOverlay
          state={state}
          onDecide={(who) => dispatch({ type: 'PAY_DECIDE', who })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'explain' ? (
        <ExplainOverlay state={state} onSkip={() => dispatch({ type: 'SKIP_EXPLAIN' })} />
      ) : null}
      {state.mode === 'paused' ? (
        <PauseHelp
          state={state}
          onResume={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          onNewAdventure={() => dispatch({ type: 'CONFIRM_NEW_ADVENTURE' })}
        />
      ) : null}
    </div>
  );
}
