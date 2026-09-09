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
import { ContextOverlay } from './ui/ContextOverlay';
import { RedactOverlay } from './ui/RedactOverlay';
import { PackOverlay } from './ui/PackOverlay';
import { CompareOverlay } from './ui/CompareOverlay';
import { DraftOverlay } from './ui/DraftOverlay';
import { VoiceOverlay } from './ui/VoiceOverlay';
import { LetterOverlay } from './ui/LetterOverlay';
import { ReconcileOverlay } from './ui/ReconcileOverlay';
import { SubmitOverlay } from './ui/SubmitOverlay';
import { BriefOverlay } from './ui/BriefOverlay';
import { BoardOverlay } from './ui/BoardOverlay';
import { KioskOverlay } from './ui/KioskOverlay';
import { LabOverlay } from './ui/LabOverlay';
import { AgentOverlay } from './ui/AgentOverlay';
import { BridgeOverlay } from './ui/BridgeOverlay';
import { SkillOverlay } from './ui/SkillOverlay';
import { ApproveOverlay } from './ui/ApproveOverlay';
import { CrewOverlay } from './ui/CrewOverlay';
import { PathOverlay } from './ui/PathOverlay';
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
      data-slice="16"
      data-shop-quest={state.shopQuest.phase}
      data-parcel-quest={state.parcelQuest.phase}
      data-comms-repaired={state.parcelQuest.commsRepaired ? 'true' : 'false'}
      data-library-quest={state.libraryQuest.phase}
      data-newsroom-quest={state.newsroomQuest.phase}
      data-festival-quest={state.festivalQuest.phase}
      data-workshop-materials={state.festivalQuest.workshopMaterials ? 'true' : 'false'}
      data-workshop-door={state.festivalQuest.workshopDoorOpen ? 'open' : 'locked'}
      data-workshop-quest={state.workshopQuest.phase}
      data-service-posted={state.workshopQuest.servicePosted ? 'true' : 'false'}
      data-kiosk-quest={state.kioskQuest.phase}
      data-kiosk-ready={state.kioskQuest.kioskReady ? 'true' : 'false'}
      data-lab-quest={state.labQuest.phase}
      data-lab-ready={state.labQuest.labReady ? 'true' : 'false'}
      data-agent-quest={state.agentQuest.phase}
      data-agent-ready={state.agentQuest.agentReady ? 'true' : 'false'}
      data-bridge-quest={state.bridgeQuest.phase}
      data-bridge-ready={state.bridgeQuest.bridgeReady ? 'true' : 'false'}
      data-skill-quest={state.skillQuest.phase}
      data-skill-ready={state.skillQuest.skillReady ? 'true' : 'false'}
      data-approval-quest={state.approvalQuest.phase}
      data-approval-ready={state.approvalQuest.approvalReady ? 'true' : 'false'}
      data-crew-quest={state.crewQuest.phase}
      data-crew-ready={state.crewQuest.crewReady ? 'true' : 'false'}
      data-path-quest={state.pathQuest.phase}
      data-restored={state.pathQuest.restored ? 'true' : 'false'}
      data-context-window={state.libraryQuest.windowSlots.join(',')}
      data-cassette={state.libraryQuest.contextModule ? 'contextModule' : ''}
      data-workshop-lead={state.newsroomQuest.workshopLead ? 'true' : 'false'}
    >
      <Hud
        state={state}
        onHelp={() => dispatch({ type: 'OPEN_HELP' })}
        onDismissRestore={() => dispatch({ type: 'DISMISS_RESTORE_NOTICE' })}
      />
      <WorldCanvas state={state} />
      <CheckpointNote
        visible={state.checkpointReached}
        shopHelped={state.shopQuest.phase === 'helped'}
        parcelDone={state.parcelQuest.commsRepaired}
        moduleReady={state.libraryQuest.contextModule}
        workshopLead={state.newsroomQuest.workshopLead}
        newsroomStarted={state.map === 'newsroom' || state.newsroomQuest.briefed}
        festivalStarted={state.map === 'festival' || state.festivalQuest.briefed}
        workshopMaterials={state.festivalQuest.workshopMaterials}
        workshopStarted={state.map === 'workshop' || state.workshopQuest.briefed}
        servicePosted={state.workshopQuest.servicePosted}
        kioskReady={state.kioskQuest.kioskReady}
        labReady={state.labQuest.labReady}
        agentReady={state.agentQuest.agentReady}
        bridgeReady={state.bridgeQuest.bridgeReady}
        skillReady={state.skillQuest.skillReady}
        approvalReady={state.approvalQuest.approvalReady}
        crewReady={state.crewQuest.crewReady}
        restored={state.pathQuest.restored}
      />
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
        <InspectOverlay
          state={state}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          onCite={() => dispatch({ type: 'CITE_CLIPPING' })}
          onVerify={() => dispatch({ type: 'VERIFY_ORIGINAL' })}
          onBuilderHand={() => dispatch({ type: 'BUILDER_HAND' })}
          onBuilderBuild={() => dispatch({ type: 'BUILDER_BUILD' })}
          onBuilderDone={() => dispatch({ type: 'BUILDER_DONE' })}
          onResultMatch={(part) => dispatch({ type: 'RESULT_MATCH', part })}
          onVaultPut={() => dispatch({ type: 'KIOSK_VAULT_PUT' })}
          onVaultEmpty={() => dispatch({ type: 'KIOSK_VAULT_EMPTY' })}
        />
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
      {state.mode === 'context' ? (
        <ContextOverlay
          state={state}
          onLoad={(note) => dispatch({ type: 'CONTEXT_LOAD', note })}
          onEject={(note) => dispatch({ type: 'CONTEXT_EJECT', note })}
          onPin={(note) => dispatch({ type: 'CONTEXT_PIN', note })}
          onRecite={() => dispatch({ type: 'CONTEXT_RECITE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'redact' ? (
        <RedactOverlay
          state={state}
          onRedact={(field) => dispatch({ type: 'REDACT_TOGGLE', field })}
          onFact={(field) => dispatch({ type: 'FACT_TOGGLE', field })}
          onGive={() => dispatch({ type: 'REDACT_GIVE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'pack' ? (
        <PackOverlay
          state={state}
          onToggle={(file) => dispatch({ type: 'PACK_TOGGLE', file })}
          onStamp={(stamp) => dispatch({ type: 'PACK_STAMP', stamp })}
          onAssemble={() => dispatch({ type: 'PACK_ASSEMBLE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'compare' ? (
        <CompareOverlay
          state={state}
          onToggle={(field) => dispatch({ type: 'COMPARE_TOGGLE', field })}
          onSubmit={(style) => dispatch({ type: 'COMPARE_SUBMIT', style })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'draft' ? (
        <DraftOverlay
          state={state}
          onMark={(mismatch) => dispatch({ type: 'DRAFT_MARK', mismatch })}
          onCorrect={(mismatch) => dispatch({ type: 'DRAFT_CORRECT', mismatch })}
          onRelease={() => dispatch({ type: 'DRAFT_RELEASE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'voice' ? (
        <VoiceOverlay
          state={state}
          onApply={(style) => dispatch({ type: 'VOICE_APPLY', style })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'letter' ? (
        <LetterOverlay
          state={state}
          onSet={(field, value) => dispatch({ type: 'LETTER_SET', field, value })}
          onReview={() => dispatch({ type: 'LETTER_REVIEW' })}
          onSend={(signer) => dispatch({ type: 'LETTER_SEND', signer })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'reconcile' ? (
        <ReconcileOverlay
          state={state}
          onMark={(line, mark) => dispatch({ type: 'RECONCILE_MARK', line, mark })}
          onSum={() => dispatch({ type: 'RECONCILE_SUM' })}
          onRobot={() => dispatch({ type: 'RECONCILE_ROBOT' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'submit' ? (
        <SubmitOverlay
          state={state}
          onSet={(field, value) => dispatch({ type: 'SUBMIT_SET', field, value })}
          onSend={(sender) => dispatch({ type: 'SUBMIT_SEND', sender })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'brief' ? (
        <BriefOverlay
          state={state}
          onSet={(field, value) => dispatch({ type: 'BRIEF_SET', field, value })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'board' ? (
        <BoardOverlay
          state={state}
          onBook={(slot) => dispatch({ type: 'BOARD_BOOK', slot })}
          onExtra={(control) => dispatch({ type: 'BOARD_EXTRA', control })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'kiosk' ? (
        <KioskOverlay
          state={state}
          onStrip={() => dispatch({ type: 'KIOSK_STRIP' })}
          onEmbed={() => dispatch({ type: 'KIOSK_EMBED' })}
          onMoveVault={() => dispatch({ type: 'KIOSK_MOVE_VAULT' })}
          onSend={() => dispatch({ type: 'KIOSK_SEND' })}
          onSetRtl={() => dispatch({ type: 'KIOSK_SET_RTL' })}
          onIsolate={() => dispatch({ type: 'KIOSK_ISOLATE' })}
          onLookup={(slot) => dispatch({ type: 'KIOSK_LOOKUP', slot })}
          onCheck={(item) => dispatch({ type: 'KIOSK_CHECK', item })}
          onRobotDone={() => dispatch({ type: 'KIOSK_ROBOT_DONE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'lab' ? (
        <LabOverlay
          state={state}
          onLs={() => dispatch({ type: 'LAB_LS' })}
          onCat={(path) => dispatch({ type: 'LAB_CAT', path })}
          onSelectLog={(log) => dispatch({ type: 'LAB_SELECT_LOG', log })}
          onPatch={(file) => dispatch({ type: 'LAB_PATCH', file })}
          onPublish={() => dispatch({ type: 'LAB_PUBLISH' })}
          onLookup={() => dispatch({ type: 'LAB_LOOKUP' })}
          onRefuse={(command) => dispatch({ type: 'LAB_REFUSE', command })}
          onRobotDone={() => dispatch({ type: 'LAB_ROBOT_DONE' })}
          onCmd={(text) => dispatch({ type: 'LAB_CMD', text })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'approve' ? (
        <ApproveOverlay
          state={state}
          onPrepare={() => dispatch({ type: 'APPROVE_PREPARE' })}
          onRecipient={(recipient) => dispatch({ type: 'APPROVE_SET_RECIPIENT', recipient })}
          onPayload={(payload) => dispatch({ type: 'APPROVE_SET_PAYLOAD', payload })}
          onInspect={() => dispatch({ type: 'APPROVE_INSPECT' })}
          onReject={() => dispatch({ type: 'APPROVE_REJECT' })}
          onConfirm={() => dispatch({ type: 'APPROVE_CONFIRM' })}
          onDelete={() => dispatch({ type: 'APPROVE_DELETE' })}
          onPay={() => dispatch({ type: 'APPROVE_PAY' })}
          onRobotDone={() => dispatch({ type: 'APPROVE_ROBOT_DONE' })}
          onCasePrepare={() => dispatch({ type: 'APPROVE_CASE_PREPARE' })}
          onCaseAuto={() => dispatch({ type: 'APPROVE_CASE_AUTO' })}
          onCaseMajority={() => dispatch({ type: 'APPROVE_CASE_MAJORITY' })}
          onCaseShare={() => dispatch({ type: 'APPROVE_CASE_SHARE' })}
          onCaseKeep={() => dispatch({ type: 'APPROVE_CASE_KEEP' })}
          onCaseRobotDone={() => dispatch({ type: 'APPROVE_CASE_ROBOT_DONE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'crew' ? (
        <CrewOverlay
          state={state}
          onAssignResearcher={() => dispatch({ type: 'CREW_ASSIGN_RESEARCHER' })}
          onAssignBuilder={() => dispatch({ type: 'CREW_ASSIGN_BUILDER' })}
          onAssignReviewer={() => dispatch({ type: 'CREW_ASSIGN_REVIEWER' })}
          onMerge={() => dispatch({ type: 'CREW_ROLES_MERGE' })}
          onOwner={(owner) => dispatch({ type: 'CREW_SET_OWNER', owner })}
          onHandoff={() => dispatch({ type: 'CREW_HANDOFF' })}
          onInspectSource={() => dispatch({ type: 'CREW_INSPECT_SOURCE' })}
          onMajority={() => dispatch({ type: 'CREW_MAJORITY' })}
          onPickEvidence={() => dispatch({ type: 'CREW_PICK_EVIDENCE' })}
          onPickConflict={() => dispatch({ type: 'CREW_PICK_CONFLICT' })}
          onRobotDone={() => dispatch({ type: 'CREW_ROBOT_DONE' })}
          onResend={() => dispatch({ type: 'CREW_RESEND' })}
          onOpenCriteria={() => dispatch({ type: 'CREW_OPEN_CRITERIA' })}
          onRepairAccuracy={() => dispatch({ type: 'CREW_REPAIR_ACCURACY' })}
          onRepairTone={() => dispatch({ type: 'CREW_REPAIR_TONE' })}
          onAccept={() => dispatch({ type: 'CREW_ACCEPT' })}
          onQualityMajority={() => dispatch({ type: 'CREW_QUALITY_MAJORITY' })}
          onQualityRobotDone={() => dispatch({ type: 'CREW_QUALITY_ROBOT_DONE' })}
          onQualityResend={() => dispatch({ type: 'CREW_QUALITY_RESEND' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'path' ? (
        <PathOverlay
          state={state}
          onInspectSource={() => dispatch({ type: 'PATH_INSPECT_SOURCE' })}
          onTrustRumor={() => dispatch({ type: 'PATH_TRUST_RUMOR' })}
          onRefuseRumor={() => dispatch({ type: 'PATH_REFUSE_RUMOR' })}
          onGoal={(goal) => dispatch({ type: 'PATH_SET_GOAL', goal })}
          onTools={(tools) => dispatch({ type: 'PATH_SET_TOOLS', tools })}
          onStop={(stop) => dispatch({ type: 'PATH_SET_STOP', stop })}
          onLoadReading={() => dispatch({ type: 'PATH_LOAD_READING' })}
          onLoadMango={() => dispatch({ type: 'PATH_LOAD_MANGO' })}
          onLoadClinic={() => dispatch({ type: 'PATH_LOAD_CLINIC' })}
          onRunSkill={() => dispatch({ type: 'PATH_RUN_SKILL' })}
          onRunOld={() => dispatch({ type: 'PATH_RUN_OLD' })}
          onRunChat={() => dispatch({ type: 'PATH_RUN_CHAT' })}
          onExtraStep={() => dispatch({ type: 'PATH_EXTRA_STEP' })}
          onExam={() => dispatch({ type: 'PATH_EXAM' })}
          onQuiz={() => dispatch({ type: 'PATH_QUIZ' })}
          onRobotDone={() => dispatch({ type: 'PATH_ROBOT_DONE' })}
          onPrepare={() => dispatch({ type: 'PATH_PREPARE' })}
          onRecipient={(recipient) => dispatch({ type: 'PATH_SET_RECIPIENT', recipient })}
          onPayload={(payload) => dispatch({ type: 'PATH_SET_PAYLOAD', payload })}
          onInspectSend={() => dispatch({ type: 'PATH_INSPECT_SEND' })}
          onReject={() => dispatch({ type: 'PATH_REJECT' })}
          onConfirm={() => dispatch({ type: 'PATH_CONFIRM' })}
          onResendOld={() => dispatch({ type: 'PATH_RESEND_OLD' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'skill' ? (
        <SkillOverlay
          state={state}
          onOneshot={() => dispatch({ type: 'SKILL_ONESHOT' })}
          onCorrect={() => dispatch({ type: 'SKILL_CORRECT' })}
          onSave={() => dispatch({ type: 'SKILL_SAVE' })}
          onStanding={() => dispatch({ type: 'SKILL_STANDING' })}
          onLoadConnector={() => dispatch({ type: 'SKILL_LOAD_CONNECTOR' })}
          onEmbedSecret={() => dispatch({ type: 'SKILL_EMBED_SECRET' })}
          onTrialSecond={() => dispatch({ type: 'SKILL_TRIAL_SECOND' })}
          onTrialSame={() => dispatch({ type: 'SKILL_TRIAL_SAME' })}
          onRobotDone={() => dispatch({ type: 'SKILL_ROBOT_DONE' })}
          onTrigger={(trigger) => dispatch({ type: 'SKILL_SET_TRIGGER', trigger })}
          onInput={(input) => dispatch({ type: 'SKILL_SET_INPUT', input })}
          onSteps={(steps) => dispatch({ type: 'SKILL_SET_STEPS', steps })}
          onOutput={(output) => dispatch({ type: 'SKILL_SET_OUTPUT', output })}
          onStop={(stop) => dispatch({ type: 'SKILL_SET_STOP', stop })}
          onSchedule={(schedule) => dispatch({ type: 'SKILL_SET_SCHEDULE', schedule })}
          onArm={() => dispatch({ type: 'SKILL_ARM' })}
          onTickSun8={() => dispatch({ type: 'SKILL_TICK_SUN8' })}
          onTickEmpty={() => dispatch({ type: 'SKILL_TICK_EMPTY' })}
          onPause={() => dispatch({ type: 'SKILL_PAUSE' })}
          onCancel={() => dispatch({ type: 'SKILL_CANCEL' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'bridge' ? (
        <BridgeOverlay
          state={state}
          onConnect={() => dispatch({ type: 'BRIDGE_CONNECT' })}
          onListTools={() => dispatch({ type: 'BRIDGE_LIST_TOOLS' })}
          onListResources={() => dispatch({ type: 'BRIDGE_LIST_RESOURCES' })}
          onGrant={(grant) => dispatch({ type: 'BRIDGE_GRANT', grant })}
          onLookup={() => dispatch({ type: 'BRIDGE_LOOKUP' })}
          onLookupPayroll={() => dispatch({ type: 'BRIDGE_LOOKUP_PAYROLL' })}
          onSaveDraft={() => dispatch({ type: 'BRIDGE_SAVE_DRAFT' })}
          onInvokeRewrite={() => dispatch({ type: 'BRIDGE_INVOKE_REWRITE' })}
          onInvokePay={() => dispatch({ type: 'BRIDGE_INVOKE_PAY' })}
          onLoadSkill={() => dispatch({ type: 'BRIDGE_LOAD_SKILL' })}
          onRobotDone={() => dispatch({ type: 'BRIDGE_ROBOT_DONE' })}
          onBrowserSave={() => dispatch({ type: 'BRIDGE_BROWSER_SAVE' })}
          onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
        />
      ) : null}
      {state.mode === 'agent' ? (
        <AgentOverlay
          state={state}
          onChatPlan={() => dispatch({ type: 'AGENT_CHAT_PLAN' })}
          onRun={() => dispatch({ type: 'AGENT_RUN' })}
          onExtra={() => dispatch({ type: 'AGENT_EXTRA_STEP' })}
          onLoadJob={(job) => dispatch({ type: 'AGENT_LOAD_JOB', job })}
          onGoal={(goal) => dispatch({ type: 'AGENT_SET_GOAL', goal })}
          onTool={(tool) => dispatch({ type: 'AGENT_TOGGLE_TOOL', tool })}
          onSuccess={(test) => dispatch({ type: 'AGENT_SET_SUCCESS', test })}
          onStop={(rule) => dispatch({ type: 'AGENT_SET_STOP', rule })}
          onRobotDone={() => dispatch({ type: 'AGENT_ROBOT_DONE' })}
          onInvokeHours={() => dispatch({ type: 'AGENT_INVOKE', tool: 'live_hours' })}
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
