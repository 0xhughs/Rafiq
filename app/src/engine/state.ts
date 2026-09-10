import { facingFrom, tryMove } from './collision';
import {
  DIALOGUE,
  isLockedNode,
  OBJECTIVES,
  recordEvent,
  visitMap,
} from './dialogue';
import { grantItem, removeItem } from './inventory';
import { getActionable, listInteractables } from './interact';
import { APARTMENT, destinationOf, PORTALS } from './maps';
import { validateName } from './names';
import { openNpc } from './npc';
import {
  closeLibraryDialogue,
  closeLibraryOverlay,
  createLibraryQuest,
  isLibraryExplain,
  isLibraryOverlay,
  libraryObjective,
  reduceContextEject,
  reduceContextLoad,
  reduceContextPin,
  reduceContextRecite,
  reduceFactToggle,
  reducePackAssemble,
  reducePackStamp,
  reducePackToggle,
  reduceRedactGive,
  reduceRedactToggle,
  skipLibraryExplain,
} from './library';
import {
  closeFestivalDialogue,
  closeFestivalOverlay,
  createFestivalQuest,
  inspectFestival,
  isFestivalExplain,
  isFestivalOverlay,
  festivalObjective,
  openReconcile,
  openSubmit,
  reduceReconcileMark,
  reduceReconcileRobot,
  reduceReconcileSum,
  reduceSubmitSend,
  reduceSubmitSet,
  skipFestivalExplain,
} from './festival';
import {
  closeWorkshopDialogue,
  closeWorkshopOverlay,
  createWorkshopQuest,
  inspectWorkshop,
  isWorkshopExplain,
  isWorkshopInspect,
  isWorkshopOverlay,
  openBoard,
  openBrief,
  reduceBoardBook,
  reduceBoardExtra,
  reduceBriefSet,
  reduceBuilderBuild,
  reduceBuilderDone,
  reduceBuilderHand,
  reduceResultMatch,
  skipWorkshopExplain,
  workshopObjective,
} from './workshop';
import {
  closeKioskOverlay,
  createKioskQuest,
  inspectKioskDocs,
  inspectKioskVault,
  isKioskExplain,
  isKioskInspect,
  isKioskOverlay,
  openKiosk,
  reduceKioskCheck,
  reduceKioskEmbed,
  reduceKioskIsolate,
  reduceKioskLookup,
  reduceKioskMoveVault,
  reduceKioskRobotDone,
  reduceKioskSend,
  reduceKioskSetRtl,
  reduceKioskStrip,
  reduceKioskVaultEmpty,
  reduceKioskVaultPut,
  skipKioskExplain,
} from './kiosk';
import {
  closeLabOverlay,
  createLabQuest,
  isLabExplain,
  isLabOverlay,
  openLabProd,
  openLabTerminal,
  reduceLabCat,
  reduceLabCmd,
  reduceLabLookup,
  reduceLabLs,
  reduceLabPatch,
  reduceLabPublish,
  reduceLabRefuse,
  reduceLabRobotDone,
  reduceLabSelectLog,
  skipLabExplain,
} from './lab';
import {
  closeAgentOverlay,
  createAgentQuest,
  isAgentExplain,
  isAgentOverlay,
  openAgentBoard,
  openAgentConsole,
  reduceAgentChatPlan,
  reduceAgentExtraStep,
  reduceAgentInvoke,
  reduceAgentLoadJob,
  reduceAgentRobotDone,
  reduceAgentRun,
  reduceAgentSetGoal,
  reduceAgentSetStop,
  reduceAgentSetSuccess,
  reduceAgentToggleTool,
  skipAgentExplain,
} from './agent';
import {
  closeBridgeOverlay,
  createBridgeQuest,
  isBridgeExplain,
  isBridgeOverlay,
  openBridgeBrowser,
  openBridgeHost,
  reduceBridgeBrowserSave,
  reduceBridgeConnect,
  reduceBridgeGrant,
  reduceBridgeInvokePay,
  reduceBridgeInvokeRewrite,
  reduceBridgeListResources,
  reduceBridgeListTools,
  reduceBridgeLoadSkill,
  reduceBridgeLookup,
  reduceBridgeLookupPayroll,
  reduceBridgeRobotDone,
  reduceBridgeSaveDraft,
  skipBridgeExplain,
} from './bridge';
import {
  closeSkillOverlay,
  createSkillQuest,
  isSkillExplain,
  isSkillOverlay,
  openSkillBench,
  openSkillClock,
  reduceSkillArm,
  reduceSkillCancel,
  reduceSkillCorrect,
  reduceSkillEmbedSecret,
  reduceSkillLoadConnector,
  reduceSkillOneshot,
  reduceSkillPause,
  reduceSkillRobotDone,
  reduceSkillSave,
  reduceSkillSetInput,
  reduceSkillSetOutput,
  reduceSkillSetSchedule,
  reduceSkillSetSteps,
  reduceSkillSetStop,
  reduceSkillSetTrigger,
  reduceSkillStanding,
  reduceSkillTickEmpty,
  reduceSkillTickSun8,
  reduceSkillTrialSame,
  reduceSkillTrialSecond,
  skipSkillExplain,
} from './skill';
import {
  closeApproveOverlay,
  createApprovalQuest,
  isApproveExplain,
  isApproveOverlay,
  openApproveDesk,
  openDecisionDesk,
  reduceApproveCaseAuto,
  reduceApproveCaseKeep,
  reduceApproveCaseMajority,
  reduceApproveCasePrepare,
  reduceApproveCaseRobotDone,
  reduceApproveCaseShare,
  reduceApproveConfirm,
  reduceApproveDelete,
  reduceApproveInspect,
  reduceApprovePay,
  reduceApprovePrepare,
  reduceApproveReject,
  reduceApproveRobotDone,
  reduceApproveSetPayload,
  reduceApproveSetRecipient,
  skipApproveExplain,
} from './approval';
import {
  closeCrewOverlay,
  createCrewQuest,
  isCrewExplain,
  isCrewOverlay,
  openCrewDesk,
  openQualityDesk,
  reduceCrewAccept,
  reduceCrewAssignBuilder,
  reduceCrewAssignResearcher,
  reduceCrewAssignReviewer,
  reduceCrewHandoff,
  reduceCrewInspectSource,
  reduceCrewMajority,
  reduceCrewOpenCriteria,
  reduceCrewPickConflict,
  reduceCrewPickEvidence,
  reduceCrewQualityMajority,
  reduceCrewQualityResend,
  reduceCrewQualityRobotDone,
  reduceCrewRepairAccuracy,
  reduceCrewRepairTone,
  reduceCrewResend,
  reduceCrewRobotDone,
  reduceCrewRolesMerge,
  reduceCrewSetOwner,
  skipCrewExplain,
} from './crew';
import {
  closePathOverlay,
  createPathQuest,
  isPathExplain,
  isPathOverlay,
  openPathDesk,
  openSealDesk,
  reducePathConfirm,
  reducePathExam,
  reducePathExtraStep,
  reducePathInspectSend,
  reducePathInspectSource,
  reducePathLoadClinic,
  reducePathLoadMango,
  reducePathLoadReading,
  reducePathPrepare,
  reducePathQuiz,
  reducePathRefuseRumor,
  reducePathReject,
  reducePathResendOld,
  reducePathRobotDone,
  reducePathRunChat,
  reducePathRunOld,
  reducePathRunSkill,
  reducePathSetGoal,
  reducePathSetPayload,
  reducePathSetRecipient,
  reducePathSetStop,
  reducePathSetTools,
  reducePathTrustRumor,
  skipPathExplain,
} from './path';
import {
  closePassportOverlay,
  createPassportQuest,
  isPassportExplain,
  reducePassportConfirmName,
  reducePassportDownload,
  reducePassportDownloadFail,
  reducePassportExam,
  reducePassportLegacy,
  reducePassportNetwork,
  reducePassportOpen,
  reducePassportPercent,
  reducePassportRegistry,
  reducePassportRobotDone,
  reducePassportVerifyPublic,
  skipPassportExplain,
} from './passport';
import {
  closeNewsroomDialogue,
  closeNewsroomOverlay,
  createNewsroomQuest,
  inspectNewsroom,
  isNewsroomExplain,
  isNewsroomOverlay,
  newsroomObjective,
  openDraft,
  openVoice,
  reduceCiteClipping,
  reduceCompareSubmit,
  reduceCompareToggle,
  reduceDraftCorrect,
  reduceDraftMark,
  reduceDraftRelease,
  reduceLetterReview,
  reduceLetterSend,
  reduceLetterSet,
  reduceVerifyOriginal,
  reduceVoiceApply,
  skipNewsroomExplain,
} from './newsroom';
import {
  closeParcelDialogue,
  createParcelQuest,
  inspectParcel,
  isParcelOverlay,
  parcelObjective,
  reduceInstructionSend,
  reduceInstructionSet,
  reduceParcelChoice,
  reduceParcelNl,
  reducePayDecide,
  skipParcelExplain,
} from './parcel';
import { clearRafiqKeys, loadAdventure, persistAdventure, shouldPersist } from './save';
import {
  applyCalculatorKey,
  closeShopDialogue,
  createCalculator,
  createShopQuest,
  emptyEvidence,
  inspectShop,
  isShopOverlay,
  reduceCrateDecide,
  reduceLookupNl,
  reduceNoticeApply,
  reduceNoticePost,
  reduceShopChoice,
  skipExplain,
} from './shop';
import type {
  DialogueChoiceId,
  GameAction,
  GameState,
  KeyValueStore,
  PortalId,
  SerializedTestState,
} from './types';

export function createInitialState(): GameState {
  return {
    playerName: '',
    nameDraft: '',
    nameError: null,
    map: 'apartment',
    position: { x: APARTMENT.spawn.x, y: APARTMENT.spawn.y },
    facing: 'down',
    mode: 'name_entry',
    trash: 'home',
    encounter: 'unseen',
    dialogueNode: null,
    conversationSeen: false,
    storyObjective: OBJECTIVES.takeTrash,
    checkpointReached: false,
    inventory: [],
    neighbor: 'unmet',
    shopkeeper: 'unmet',
    clerk: 'unmet',
    librarian: 'unmet',
    editor: 'unmet',
    officer: 'unmet',
    manager: 'unmet',
    journalEvents: [],
    evidence: emptyEvidence(),
    shopQuest: createShopQuest(),
    parcelQuest: createParcelQuest(),
    libraryQuest: createLibraryQuest(),
    newsroomQuest: createNewsroomQuest(),
    festivalQuest: createFestivalQuest(),
    workshopQuest: createWorkshopQuest(),
    kioskQuest: createKioskQuest(),
    labQuest: createLabQuest(),
    agentQuest: createAgentQuest(),
    bridgeQuest: createBridgeQuest(),
    skillQuest: createSkillQuest(),
    approvalQuest: createApprovalQuest(),
    crewQuest: createCrewQuest(),
    pathQuest: createPathQuest(),
    passportQuest: createPassportQuest(),
    calculator: createCalculator(),
    inspectTarget: null,
    explainTopic: null,
    robotUnderstood: null,
    shopFeedback: null,
    endingState: 'in_progress',
    mapsVisited: [],
    saveStatus: 'absent',
    restoreNotice: false,
  };
}

export function bootState(store: KeyValueStore): GameState {
  const loaded = loadAdventure(store);
  if (loaded.status === 'ok' || loaded.status === 'recovered') {
    return loaded.state;
  }
  const initial = createInitialState();
  if (loaded.status === 'unavailable') {
    return { ...initial, saveStatus: 'unavailable' };
  }
  return initial;
}

function pickup(state: GameState): GameState {
  if (state.trash !== 'home') return state;
  return {
    ...state,
    trash: 'carried',
    inventory: grantItem(state.inventory, 'trash_bag'),
    mode: 'dialogue',
    dialogueNode: 'pickup_leaving',
    storyObjective: OBJECTIVES.carryOut,
    journalEvents: recordEvent(state.journalEvents, 'pickup'),
  };
}

function goThroughPortal(state: GameState, portalId: PortalId): GameState {
  const portal = PORTALS.find((item) => item.id === portalId);
  if (!portal) return state;
  if (portal.requiresShopHelped && state.shopQuest.phase !== 'helped') {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  if (portal.requiresCommsRepaired && !state.parcelQuest.commsRepaired) {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  if (portal.requiresWorkshopLead && !state.newsroomQuest.workshopLead) {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  if (portal.requiresWorkshopMaterials && !state.festivalQuest.workshopMaterials) {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  if (portal.requiresArchiveSuccess && !(state.libraryQuest.contextModule && state.libraryQuest.specReleased)) {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  if (portal.requiresHelp && state.encounter !== 'help_accepted') {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  const dest = destinationOf(portal, state.map);
  let events = state.journalEvents;
  if (dest.map === 'shop') events = recordEvent(events, 'shop_visit');
  if (dest.map === 'library') events = recordEvent(events, 'library_visit');
  if (dest.map === 'parcel') events = recordEvent(events, 'parcel_visit');
  if (dest.map === 'archive') events = recordEvent(events, 'archive_visit');
  if (dest.map === 'newsroom') events = recordEvent(events, 'newsroom_visit');
  if (dest.map === 'festival') events = recordEvent(events, 'festival_visit');
  if (dest.map === 'workshop') events = recordEvent(events, 'workshop_visit');
  const next = {
    ...state,
    map: dest.map,
    position: { x: dest.position.x, y: dest.position.y },
    facing: dest.facing,
    mapsVisited: visitMap(state.mapsVisited, dest.map),
    journalEvents: events,
  };
  let storyObjective = dest.map === 'parcel' ? parcelObjective(next) : next.storyObjective;
  if (dest.map === 'archive' || dest.map === 'library') {
    storyObjective = libraryObjective({ ...next, storyObjective });
  }
  if (dest.map === 'newsroom') {
    storyObjective = newsroomObjective(next);
  }
  if (dest.map === 'festival') {
    storyObjective = festivalObjective(next);
  }
  if (dest.map === 'workshop') {
    storyObjective = workshopObjective(next);
  }
  if (dest.map === 'street') {
    if (
      next.workshopQuest.servicePosted ||
      next.workshopQuest.briefed ||
      next.festivalQuest.workshopMaterials ||
      next.festivalQuest.briefed
    ) {
      storyObjective = festivalObjective(next);
    } else if (next.newsroomQuest.workshopLead || (next.libraryQuest.contextModule && next.libraryQuest.specReleased)) {
      storyObjective = newsroomObjective(next);
    } else if (next.parcelQuest.commsRepaired) {
      storyObjective = libraryObjective(next);
    }
  }
  return { ...next, storyObjective };
}

function dispose(state: GameState): GameState {
  if (state.trash !== 'carried') return state;
  const encounter = state.encounter === 'unseen' ? 'available' : state.encounter;
  return {
    ...state,
    trash: 'disposed',
    inventory: removeItem(state.inventory, 'trash_bag'),
    encounter,
    storyObjective:
      encounter === 'help_accepted' ? state.storyObjective : OBJECTIVES.inspectRobot,
    journalEvents: recordEvent(state.journalEvents, 'disposal'),
  };
}

function postponeNpc(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    neighbor: state.neighbor === 'greeted' ? 'greeted' : 'unmet',
    shopkeeper: state.shopkeeper === 'greeted' ? 'greeted' : 'unmet',
    clerk: state.clerk === 'greeted' ? 'greeted' : 'unmet',
    librarian: state.librarian === 'greeted' ? 'greeted' : 'unmet',
    editor: state.editor === 'greeted' ? 'greeted' : 'unmet',
    officer: state.officer === 'greeted' ? 'greeted' : 'unmet',
    manager: state.manager === 'greeted' ? 'greeted' : 'unmet',
  };
}

function closeDialogue(state: GameState): GameState {
  if (state.dialogueNode === 'pickup_leaving' || isLockedNode(state.dialogueNode)) {
    return { ...state, mode: 'playing', dialogueNode: null };
  }
  const shopClosed = closeShopDialogue(state);
  if (shopClosed) return shopClosed;
  const parcelClosed = closeParcelDialogue(state);
  if (parcelClosed) return parcelClosed;
  const libraryClosed = closeLibraryDialogue(state);
  if (libraryClosed) return libraryClosed;
  const newsroomClosed = closeNewsroomDialogue(state);
  if (newsroomClosed) return newsroomClosed;
  const festivalClosed = closeFestivalDialogue(state);
  if (festivalClosed) return festivalClosed;
  const workshopClosed = closeWorkshopDialogue(state);
  if (workshopClosed) return workshopClosed;
  if (state.dialogueNode === 'neighbor_thanks') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      neighbor: 'greeted',
      journalEvents: recordEvent(state.journalEvents, 'neighbor_greeting'),
    };
  }
  if (state.dialogueNode?.startsWith('neighbor')) {
    return postponeNpc(state);
  }
  if (state.encounter === 'help_accepted') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      checkpointReached: true,
      storyObjective:
        state.festivalQuest.workshopMaterials ||
        state.workshopQuest.servicePosted ||
        state.newsroomQuest.workshopLead ||
        state.parcelQuest.commsRepaired
          ? libraryObjective(state)
          : state.shopQuest.phase === 'helped'
            ? OBJECTIVES.repairLead
            : state.storyObjective,
      journalEvents: recordEvent(state.journalEvents, 'help_accepted'),
    };
  }
  if (state.encounter === 'talking') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      encounter: 'available',
      storyObjective: OBJECTIVES.talkRobot,
    };
  }
  return { ...state, mode: 'playing', dialogueNode: null };
}

function advanceDialogue(state: GameState): GameState {
  if (state.mode !== 'dialogue' || !state.dialogueNode) return state;
  const line = DIALOGUE[state.dialogueNode];
  if (line.choices) return state;
  if (line.next) {
    const reachedAsk = line.next === 'ask_help';
    return {
      ...state,
      dialogueNode: line.next,
      conversationSeen: state.conversationSeen || reachedAsk,
    };
  }
  if (state.dialogueNode === 'lead') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      encounter: 'help_accepted',
      checkpointReached: true,
      storyObjective: OBJECTIVES.cornerStore,
      journalEvents: recordEvent(state.journalEvents, 'help_accepted'),
    };
  }
  return closeDialogue(state);
}

function choose(state: GameState, choice: DialogueChoiceId): GameState {
  if (state.mode !== 'dialogue') return state;
  if (state.dialogueNode === 'ask_help') {
    if (choice === 'postpone' || choice === 'npc_postpone') {
      return {
        ...state,
        mode: 'playing',
        dialogueNode: null,
        encounter: 'available',
        conversationSeen: true,
        storyObjective: OBJECTIVES.talkRobot,
      };
    }
    if (choice === 'agree' && state.encounter === 'talking') {
      return {
        ...state,
        dialogueNode: 'agree',
        encounter: 'help_accepted',
        conversationSeen: true,
        checkpointReached: true,
        storyObjective: OBJECTIVES.cornerStore,
        journalEvents: recordEvent(state.journalEvents, 'help_accepted'),
      };
    }
    return state;
  }
  if (state.dialogueNode === 'neighbor_pointer') {
    if (choice === 'postpone' || choice === 'npc_postpone') {
      return postponeNpc(state);
    }
    if (choice === 'npc_thanks' || choice === 'agree') {
      return {
        ...state,
        dialogueNode: 'neighbor_thanks',
        neighbor: 'greeted',
        journalEvents: recordEvent(state.journalEvents, 'neighbor_greeting'),
      };
    }
  }
  if (state.dialogueNode === 'parcel_delegate_prompt' && (choice === 'postpone' || choice === 'npc_postpone')) {
    return postponeNpc(state);
  }
  const parcelChoice = reduceParcelChoice(state, choice);
  if (parcelChoice) return parcelChoice;
  return reduceShopChoice(state, choice);
}

export function reduce(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAME_DRAFT':
      return { ...state, nameDraft: action.value, nameError: null };
    case 'SUBMIT_NAME': {
      if (state.mode !== 'name_entry') return state;
      const result = validateName(state.nameDraft);
      if (!result.ok) {
        return { ...state, nameError: result.message };
      }
      return {
        ...state,
        playerName: result.name,
        nameDraft: result.name,
        nameError: null,
        mode: 'confirm_name',
      };
    }
    case 'REVISE_NAME':
      if (state.mode !== 'confirm_name') return state;
      return { ...state, mode: 'name_entry', nameError: null };
    case 'CONFIRM_NAME':
      if (state.mode !== 'confirm_name' || !validateName(state.playerName).ok) {
        return state;
      }
      return {
        ...state,
        mode: 'playing',
        map: 'apartment',
        position: { x: APARTMENT.spawn.x, y: APARTMENT.spawn.y },
        facing: 'down',
        trash: 'home',
        encounter: 'unseen',
        dialogueNode: null,
        conversationSeen: false,
        checkpointReached: false,
        storyObjective: OBJECTIVES.takeTrash,
        inventory: [],
        neighbor: 'unmet',
        shopkeeper: 'unmet',
        clerk: 'unmet',
        librarian: 'unmet',
        editor: 'unmet',
        officer: 'unmet',
        manager: 'unmet',
        journalEvents: [],
        evidence: emptyEvidence(),
        shopQuest: createShopQuest(),
        parcelQuest: createParcelQuest(),
        libraryQuest: createLibraryQuest(),
        newsroomQuest: createNewsroomQuest(),
        festivalQuest: createFestivalQuest(),
        workshopQuest: createWorkshopQuest(),
        kioskQuest: createKioskQuest(),
        labQuest: createLabQuest(),
        agentQuest: createAgentQuest(),
        bridgeQuest: createBridgeQuest(),
        skillQuest: createSkillQuest(),
        approvalQuest: createApprovalQuest(),
        crewQuest: createCrewQuest(),
        pathQuest: createPathQuest(),
        passportQuest: createPassportQuest(),
        calculator: createCalculator(),
        inspectTarget: null,
        explainTopic: null,
        robotUnderstood: null,
        shopFeedback: null,
        endingState: 'in_progress',
        mapsVisited: ['apartment'],
        restoreNotice: false,
      };
    case 'MOVE': {
      if (state.mode !== 'playing') return state;
      if (action.dx === 0 && action.dy === 0) return state;
      const position = tryMove(
        state.map,
        state.position.x,
        state.position.y,
        action.dx,
        action.dy,
      );
      return {
        ...state,
        position,
        facing: facingFrom(action.dx, action.dy, state.facing),
      };
    }
    case 'INTERACT': {
      if (state.mode !== 'playing') return state;
      const target = getActionable(state);
      if (!target) return state;
      switch (target.id) {
        case 'trash':
          return pickup(state);
        case 'door':
          return goThroughPortal(state, 'home');
        case 'shop_door':
          return goThroughPortal(state, 'shop');
        case 'library_door':
          return goThroughPortal(state, 'library');
        case 'parcel_door':
          return goThroughPortal(state, 'parcel');
        case 'library_inner':
          return goThroughPortal(state, 'archive');
        case 'newsroom_door':
          return goThroughPortal(state, 'newsroom');
        case 'festival_door':
          return goThroughPortal(state, 'festival');
        case 'workshop_door':
          return goThroughPortal(state, 'workshop');
        case 'dumpster':
          return dispose(state);
        case 'robot':
          return openNpc(state, 'robot');
        case 'neighbor':
          return openNpc(state, 'neighbor');
        case 'shopkeeper':
          return openNpc(state, 'shopkeeper');
        case 'clerk':
          return openNpc(state, 'clerk');
        case 'librarian':
          return openNpc(state, 'librarian');
        case 'editor':
          return openNpc(state, 'editor');
        case 'officer':
          return openNpc(state, 'officer');
        case 'shelf_west':
          return inspectShop(state, 'west');
        case 'shelf_east':
          return inspectShop(state, 'east');
        case 'price_list':
          return inspectShop(state, 'price');
        case 'hold_west':
          return inspectParcel(state, 'hold_west');
        case 'hold_east':
          return inspectParcel(state, 'hold_east');
        case 'hold_board':
          return inspectParcel(state, 'hold_board');
        case 'pay_window':
          return { ...state, mode: 'pay', shopFeedback: null };
        case 'instruction_desk':
          return { ...state, mode: 'instruction', shopFeedback: null };
        case 'notice_board':
          return {
            ...state,
            mode: 'notice',
            shopQuest: { ...state.shopQuest, inspectedNotice: true, heardDraft: true },
            shopFeedback: null,
          };
        case 'calculator':
          return { ...state, mode: 'calculator', shopFeedback: null };
        case 'crate':
          return { ...state, mode: 'crate', shopFeedback: null };
        case 'context_bench':
          return { ...state, mode: 'context', shopFeedback: null };
        case 'notes_crate':
          return { ...state, mode: 'inspect', inspectTarget: 'notes', shopFeedback: null };
        case 'community_file':
          return { ...state, mode: 'redact', shopFeedback: null };
        case 'pack_table':
          return { ...state, mode: 'pack', shopFeedback: null };
        case 'spec_case':
          return { ...state, mode: 'inspect', inspectTarget: 'spec', shopFeedback: null };
        case 'source_bulletin':
          return inspectNewsroom(state, 'source_a');
        case 'source_poster':
          return inspectNewsroom(state, 'source_b');
        case 'clipping_board':
          return inspectNewsroom(state, 'clipping');
        case 'original_drawer':
          return inspectNewsroom(state, 'original');
        case 'compare_desk':
          return { ...state, mode: 'compare', shopFeedback: null };
        case 'draft_table':
          return openDraft(state);
        case 'voice_desk':
          return openVoice(state);
        case 'letter_desk':
          return { ...state, mode: 'letter', shopFeedback: null };
        case 'stock_table':
          return inspectFestival(state, 'festival_table');
        case 'receipts_desk':
          return inspectFestival(state, 'festival_receipts');
        case 'policy_board':
          return inspectFestival(state, 'festival_policy');
        case 'robot_cover':
          return inspectFestival(state, 'festival_cover');
        case 'reconcile_desk':
          return openReconcile(state);
        case 'submit_desk':
          return openSubmit(state);
        case 'manager':
          return openNpc(state, 'manager');
        case 'need_slip':
          return inspectWorkshop(state, 'workshop_need');
        case 'extras_slip':
          return inspectWorkshop(state, 'workshop_extras');
        case 'brief_desk':
          return openBrief(state);
        case 'builder_bench':
          return inspectWorkshop(state, 'workshop_builder');
        case 'result_check':
          return inspectWorkshop(state, 'workshop_result');
        case 'appointment_board':
          return openBoard(state);
        case 'kiosk_docs':
          return inspectKioskDocs(state);
        case 'kiosk_vault':
          return inspectKioskVault(state);
        case 'kiosk_face':
          return openKiosk(state);
        case 'lab_terminal':
          return openLabTerminal(state);
        case 'lab_prod':
          return openLabProd(state);
        case 'agent_console':
          return openAgentConsole(state);
        case 'agent_board':
          return openAgentBoard(state);
        case 'bridge_host':
          return openBridgeHost(state);
        case 'bridge_browser':
          return openBridgeBrowser(state);
        case 'skill_bench':
          return openSkillBench(state);
        case 'skill_clock':
          return openSkillClock(state);
        case 'approve_desk':
          return openApproveDesk(state);
        case 'decision_desk':
          return openDecisionDesk(state);
        case 'crew_desk':
          return openCrewDesk(state);
        case 'quality_desk':
          return openQualityDesk(state);
        case 'path_desk':
          return openPathDesk(state);
        case 'seal_desk':
          return openSealDesk(state);
        default:
          return state;
      }
    }
    case 'ADVANCE_DIALOGUE':
      return advanceDialogue(state);
    case 'CHOOSE':
      return choose(state, action.choice);
    case 'TOGGLE_PAUSE':
      if (state.mode === 'playing') return { ...state, mode: 'paused' };
      if (state.mode === 'paused') return { ...state, mode: 'playing' };
      return state;
    case 'OPEN_HELP':
      if (state.mode === 'playing' || state.mode === 'paused') {
        return { ...state, mode: 'paused' };
      }
      return state;
    case 'CLOSE_OVERLAY':
      if (state.mode === 'dialogue') return closeDialogue(state);
      if (state.mode === 'paused') return { ...state, mode: 'playing' };
      if (state.mode === 'ending') {
        return closePassportOverlay(state);
      }
      if (isPathOverlay(state.mode)) {
        return closePathOverlay(state);
      }
      if (isCrewOverlay(state.mode)) {
        return closeCrewOverlay(state);
      }
      if (isApproveOverlay(state.mode)) {
        return closeApproveOverlay(state);
      }
      if (isSkillOverlay(state.mode)) {
        return closeSkillOverlay(state);
      }
      if (isBridgeOverlay(state.mode)) {
        return closeBridgeOverlay(state);
      }
      if (isAgentOverlay(state.mode)) {
        return closeAgentOverlay(state);
      }
      if (isLabOverlay(state.mode)) {
        return closeLabOverlay(state);
      }
      if (isKioskOverlay(state.mode) || (state.mode === 'inspect' && isKioskInspect(state.inspectTarget))) {
        return closeKioskOverlay(state);
      }
      if (isWorkshopOverlay(state.mode) || (state.mode === 'inspect' && isWorkshopInspect(state.inspectTarget))) {
        return closeWorkshopOverlay(state);
      }
      if (isShopOverlay(state.mode)) {
        if (state.mode === 'explain') {
          if (isLibraryExplain(state.explainTopic)) {
            return skipLibraryExplain(state);
          }
          if (isNewsroomExplain(state.explainTopic)) {
            return skipNewsroomExplain(state);
          }
          if (isFestivalExplain(state.explainTopic)) {
            return skipFestivalExplain(state);
          }
          if (isWorkshopExplain(state.explainTopic)) {
            return skipWorkshopExplain(state);
          }
          if (isLabExplain(state.explainTopic)) {
            return skipLabExplain(state);
          }
          if (isPathExplain(state.explainTopic)) {
            return skipPathExplain(state);
          }
          if (isPassportExplain(state.explainTopic)) {
            return skipPassportExplain(state);
          }
          if (isCrewExplain(state.explainTopic)) {
            return skipCrewExplain(state);
          }
          if (isApproveExplain(state.explainTopic)) {
            return skipApproveExplain(state);
          }
          if (isSkillExplain(state.explainTopic)) {
            return skipSkillExplain(state);
          }
          if (isBridgeExplain(state.explainTopic)) {
            return skipBridgeExplain(state);
          }
          if (isAgentExplain(state.explainTopic)) {
            return skipAgentExplain(state);
          }
          if (isKioskExplain(state.explainTopic)) {
            return skipKioskExplain(state);
          }
          if (
            state.explainTopic === 'delegate' ||
            state.explainTopic === 'instruction' ||
            state.explainTopic === 'revise'
          ) {
            return skipParcelExplain(state);
          }
          return skipExplain(state);
        }
        return {
          ...state,
          mode: 'playing',
          inspectTarget: null,
          explainTopic: null,
          shopFeedback: null,
        };
      }
      if (isLibraryOverlay(state.mode)) {
        return closeLibraryOverlay(state);
      }
      if (isNewsroomOverlay(state.mode)) {
        return closeNewsroomOverlay(state);
      }
      if (isFestivalOverlay(state.mode)) {
        return closeFestivalOverlay(state);
      }
      if (isParcelOverlay(state.mode)) {
        return {
          ...state,
          mode: 'playing',
          shopFeedback: null,
        };
      }
      if (state.mode === 'playing') return { ...state, mode: 'paused' };
      return state;
    case 'CALCULATOR_KEY': {
      if (state.mode !== 'calculator') return state;
      const calculator = applyCalculatorKey(state.calculator, action.key);
      const hasExactTotal = calculator.result === 17 ? true : state.shopQuest.hasExactTotal;
      return {
        ...state,
        calculator,
        shopQuest: { ...state.shopQuest, hasExactTotal },
      };
    }
    case 'NOTICE_APPLY':
      if (state.mode !== 'notice') return state;
      return reduceNoticeApply(state, action.field);
    case 'NOTICE_POST':
      if (state.mode !== 'notice') return state;
      return reduceNoticePost(state, action.asDraft);
    case 'CRATE_DECIDE':
      if (state.mode !== 'crate') return state;
      return reduceCrateDecide(state, action.who);
    case 'SKIP_EXPLAIN':
      if (state.mode !== 'explain') return state;
      if (isLibraryExplain(state.explainTopic)) {
        return skipLibraryExplain(state);
      }
      if (isNewsroomExplain(state.explainTopic)) {
        return skipNewsroomExplain(state);
      }
      if (isFestivalExplain(state.explainTopic)) {
        return skipFestivalExplain(state);
      }
      if (isWorkshopExplain(state.explainTopic)) {
        return skipWorkshopExplain(state);
      }
      if (isLabExplain(state.explainTopic)) {
        return skipLabExplain(state);
      }
      if (isPathExplain(state.explainTopic)) {
        return skipPathExplain(state);
      }
      if (isPassportExplain(state.explainTopic)) {
        return skipPassportExplain(state);
      }
      if (isCrewExplain(state.explainTopic)) {
        return skipCrewExplain(state);
      }
      if (isApproveExplain(state.explainTopic)) {
        return skipApproveExplain(state);
      }
      if (isSkillExplain(state.explainTopic)) {
        return skipSkillExplain(state);
      }
      if (isBridgeExplain(state.explainTopic)) {
        return skipBridgeExplain(state);
      }
      if (isAgentExplain(state.explainTopic)) {
        return skipAgentExplain(state);
      }
      if (isKioskExplain(state.explainTopic)) {
        return skipKioskExplain(state);
      }
      if (
        state.explainTopic === 'delegate' ||
        state.explainTopic === 'instruction' ||
        state.explainTopic === 'revise'
      ) {
        return skipParcelExplain(state);
      }
      return skipExplain(state);
    case 'SUBMIT_NL':
      if (state.mode === 'instruction') return reduceParcelNl(state, action.text);
      if (state.mode === 'dialogue' && state.dialogueNode === 'parcel_overbroad') {
        return reduceParcelNl(state, action.text);
      }
      if (state.mode === 'dialogue' && state.dialogueNode === 'parcel_delegate_prompt') {
        return reduceParcelNl(state, action.text);
      }
      if (state.mode !== 'dialogue' || state.dialogueNode !== 'shop_lookup_prompt') return state;
      return reduceLookupNl(state, action.text);
    case 'INSTRUCTION_SET':
      if (state.mode !== 'instruction') return state;
      return reduceInstructionSet(state, action.field, action.value);
    case 'INSTRUCTION_SEND':
      if (state.mode !== 'instruction') return state;
      return reduceInstructionSend(state);
    case 'PAY_DECIDE':
      if (state.mode !== 'pay') return state;
      return reducePayDecide(state, action.who);
    case 'CONTEXT_LOAD':
      return reduceContextLoad(state, action.note);
    case 'CONTEXT_EJECT':
      return reduceContextEject(state, action.note);
    case 'CONTEXT_PIN':
      return reduceContextPin(state, action.note);
    case 'CONTEXT_RECITE':
      return reduceContextRecite(state);
    case 'REDACT_TOGGLE':
      return reduceRedactToggle(state, action.field);
    case 'FACT_TOGGLE':
      return reduceFactToggle(state, action.field);
    case 'REDACT_GIVE':
      return reduceRedactGive(state);
    case 'PACK_TOGGLE':
      return reducePackToggle(state, action.file);
    case 'PACK_STAMP':
      return reducePackStamp(state, action.stamp);
    case 'PACK_ASSEMBLE':
      return reducePackAssemble(state);
    case 'COMPARE_TOGGLE':
      return reduceCompareToggle(state, action.field);
    case 'COMPARE_SUBMIT':
      return reduceCompareSubmit(state, action.style);
    case 'CITE_CLIPPING':
      return reduceCiteClipping(state);
    case 'VERIFY_ORIGINAL':
      return reduceVerifyOriginal(state);
    case 'DRAFT_MARK':
      return reduceDraftMark(state, action.mismatch);
    case 'DRAFT_CORRECT':
      return reduceDraftCorrect(state, action.mismatch);
    case 'DRAFT_RELEASE':
      return reduceDraftRelease(state);
    case 'VOICE_APPLY':
      return reduceVoiceApply(state, action.style);
    case 'LETTER_SET':
      return reduceLetterSet(state, action.field, action.value);
    case 'LETTER_REVIEW':
      return reduceLetterReview(state);
    case 'LETTER_SEND':
      return reduceLetterSend(state, action.signer);
    case 'RECONCILE_MARK':
      return reduceReconcileMark(state, action.line, action.mark);
    case 'RECONCILE_SUM':
      return reduceReconcileSum(state);
    case 'RECONCILE_ROBOT':
      return reduceReconcileRobot(state);
    case 'SUBMIT_SET':
      return reduceSubmitSet(state, action.field, action.value);
    case 'SUBMIT_SEND':
      return reduceSubmitSend(state, action.sender);
    case 'BRIEF_SET':
      return reduceBriefSet(state, action.field, action.value);
    case 'BUILDER_HAND':
      return reduceBuilderHand(state);
    case 'BUILDER_BUILD':
      return reduceBuilderBuild(state);
    case 'BUILDER_DONE':
      return reduceBuilderDone(state);
    case 'RESULT_MATCH':
      return reduceResultMatch(state, action.part);
    case 'BOARD_BOOK':
      return reduceBoardBook(state, action.slot);
    case 'BOARD_EXTRA':
      return reduceBoardExtra(state, action.control);
    case 'KIOSK_STRIP':
      return reduceKioskStrip(state);
    case 'KIOSK_VAULT_PUT':
      return reduceKioskVaultPut(state);
    case 'KIOSK_VAULT_EMPTY':
      return reduceKioskVaultEmpty(state);
    case 'KIOSK_MOVE_VAULT':
      return reduceKioskMoveVault(state);
    case 'KIOSK_EMBED':
      return reduceKioskEmbed(state);
    case 'KIOSK_SEND':
      return reduceKioskSend(state);
    case 'KIOSK_SET_RTL':
      return reduceKioskSetRtl(state);
    case 'KIOSK_ISOLATE':
      return reduceKioskIsolate(state);
    case 'KIOSK_LOOKUP':
      return reduceKioskLookup(state, action.slot);
    case 'KIOSK_CHECK':
      return reduceKioskCheck(state, action.item);
    case 'KIOSK_ROBOT_DONE':
      return reduceKioskRobotDone(state);
    case 'LAB_LS':
      return reduceLabLs(state);
    case 'LAB_CAT':
      return reduceLabCat(state, action.path);
    case 'LAB_SELECT_LOG':
      return reduceLabSelectLog(state, action.log);
    case 'LAB_PATCH':
      return reduceLabPatch(state, action.file);
    case 'LAB_PUBLISH':
      return reduceLabPublish(state);
    case 'LAB_LOOKUP':
      return reduceLabLookup(state);
    case 'LAB_REFUSE':
      return reduceLabRefuse(state, action.command);
    case 'LAB_ROBOT_DONE':
      return reduceLabRobotDone(state);
    case 'LAB_CMD':
      return reduceLabCmd(state, action.text);
    case 'AGENT_CHAT_PLAN':
      return reduceAgentChatPlan(state);
    case 'AGENT_RUN':
      return reduceAgentRun(state);
    case 'AGENT_EXTRA_STEP':
      return reduceAgentExtraStep(state);
    case 'AGENT_LOAD_JOB':
      return reduceAgentLoadJob(state, action.job);
    case 'AGENT_SET_GOAL':
      return reduceAgentSetGoal(state, action.goal);
    case 'AGENT_TOGGLE_TOOL':
      return reduceAgentToggleTool(state, action.tool);
    case 'AGENT_SET_SUCCESS':
      return reduceAgentSetSuccess(state, action.test);
    case 'AGENT_SET_STOP':
      return reduceAgentSetStop(state, action.rule);
    case 'AGENT_ROBOT_DONE':
      return reduceAgentRobotDone(state);
    case 'AGENT_INVOKE':
      return reduceAgentInvoke(state, action.tool);
    case 'BRIDGE_CONNECT':
      return reduceBridgeConnect(state);
    case 'BRIDGE_LIST_TOOLS':
      return reduceBridgeListTools(state);
    case 'BRIDGE_LIST_RESOURCES':
      return reduceBridgeListResources(state);
    case 'BRIDGE_GRANT':
      return reduceBridgeGrant(state, action.grant);
    case 'BRIDGE_LOOKUP':
      return reduceBridgeLookup(state);
    case 'BRIDGE_LOOKUP_PAYROLL':
      return reduceBridgeLookupPayroll(state);
    case 'BRIDGE_SAVE_DRAFT':
      return reduceBridgeSaveDraft(state);
    case 'BRIDGE_INVOKE_REWRITE':
      return reduceBridgeInvokeRewrite(state);
    case 'BRIDGE_INVOKE_PAY':
      return reduceBridgeInvokePay(state);
    case 'BRIDGE_LOAD_SKILL':
      return reduceBridgeLoadSkill(state);
    case 'BRIDGE_ROBOT_DONE':
      return reduceBridgeRobotDone(state);
    case 'BRIDGE_BROWSER_SAVE':
      return reduceBridgeBrowserSave(state);
    case 'SKILL_ONESHOT':
      return reduceSkillOneshot(state);
    case 'SKILL_CORRECT':
      return reduceSkillCorrect(state);
    case 'SKILL_SAVE':
      return reduceSkillSave(state);
    case 'SKILL_STANDING':
      return reduceSkillStanding(state);
    case 'SKILL_LOAD_CONNECTOR':
      return reduceSkillLoadConnector(state);
    case 'SKILL_EMBED_SECRET':
      return reduceSkillEmbedSecret(state);
    case 'SKILL_TRIAL_SECOND':
      return reduceSkillTrialSecond(state);
    case 'SKILL_TRIAL_SAME':
      return reduceSkillTrialSame(state);
    case 'SKILL_ROBOT_DONE':
      return reduceSkillRobotDone(state);
    case 'SKILL_SET_TRIGGER':
      return reduceSkillSetTrigger(state, action.trigger);
    case 'SKILL_SET_INPUT':
      return reduceSkillSetInput(state, action.input);
    case 'SKILL_SET_STEPS':
      return reduceSkillSetSteps(state, action.steps);
    case 'SKILL_SET_OUTPUT':
      return reduceSkillSetOutput(state, action.output);
    case 'SKILL_SET_STOP':
      return reduceSkillSetStop(state, action.stop);
    case 'SKILL_SET_SCHEDULE':
      return reduceSkillSetSchedule(state, action.schedule);
    case 'SKILL_ARM':
      return reduceSkillArm(state);
    case 'SKILL_TICK_SUN8':
      return reduceSkillTickSun8(state);
    case 'SKILL_TICK_EMPTY':
      return reduceSkillTickEmpty(state);
    case 'SKILL_PAUSE':
      return reduceSkillPause(state);
    case 'SKILL_CANCEL':
      return reduceSkillCancel(state);
    case 'APPROVE_PREPARE':
      return reduceApprovePrepare(state);
    case 'APPROVE_SET_RECIPIENT':
      return reduceApproveSetRecipient(state, action.recipient);
    case 'APPROVE_SET_PAYLOAD':
      return reduceApproveSetPayload(state, action.payload);
    case 'APPROVE_INSPECT':
      return reduceApproveInspect(state);
    case 'APPROVE_REJECT':
      return reduceApproveReject(state);
    case 'APPROVE_CONFIRM':
      return reduceApproveConfirm(state);
    case 'APPROVE_DELETE':
      return reduceApproveDelete(state);
    case 'APPROVE_PAY':
      return reduceApprovePay(state);
    case 'APPROVE_ROBOT_DONE':
      return reduceApproveRobotDone(state);
    case 'APPROVE_CASE_PREPARE':
      return reduceApproveCasePrepare(state);
    case 'APPROVE_CASE_AUTO':
      return reduceApproveCaseAuto(state);
    case 'APPROVE_CASE_MAJORITY':
      return reduceApproveCaseMajority(state);
    case 'APPROVE_CASE_SHARE':
      return reduceApproveCaseShare(state);
    case 'APPROVE_CASE_KEEP':
      return reduceApproveCaseKeep(state);
    case 'APPROVE_CASE_ROBOT_DONE':
      return reduceApproveCaseRobotDone(state);
    case 'CREW_ASSIGN_RESEARCHER':
      return reduceCrewAssignResearcher(state);
    case 'CREW_ASSIGN_BUILDER':
      return reduceCrewAssignBuilder(state);
    case 'CREW_ASSIGN_REVIEWER':
      return reduceCrewAssignReviewer(state);
    case 'CREW_ROLES_MERGE':
      return reduceCrewRolesMerge(state);
    case 'CREW_SET_OWNER':
      return reduceCrewSetOwner(state, action.owner);
    case 'CREW_HANDOFF':
      return reduceCrewHandoff(state);
    case 'CREW_INSPECT_SOURCE':
      return reduceCrewInspectSource(state);
    case 'CREW_MAJORITY':
      return reduceCrewMajority(state);
    case 'CREW_PICK_EVIDENCE':
      return reduceCrewPickEvidence(state);
    case 'CREW_PICK_CONFLICT':
      return reduceCrewPickConflict(state);
    case 'CREW_ROBOT_DONE':
      return reduceCrewRobotDone(state);
    case 'CREW_RESEND':
      return reduceCrewResend(state);
    case 'CREW_OPEN_CRITERIA':
      return reduceCrewOpenCriteria(state);
    case 'CREW_REPAIR_ACCURACY':
      return reduceCrewRepairAccuracy(state);
    case 'CREW_REPAIR_TONE':
      return reduceCrewRepairTone(state);
    case 'CREW_ACCEPT':
      return reduceCrewAccept(state);
    case 'CREW_QUALITY_MAJORITY':
      return reduceCrewQualityMajority(state);
    case 'CREW_QUALITY_ROBOT_DONE':
      return reduceCrewQualityRobotDone(state);
    case 'CREW_QUALITY_RESEND':
      return reduceCrewQualityResend(state);
    case 'PATH_INSPECT_SOURCE':
      return reducePathInspectSource(state);
    case 'PATH_TRUST_RUMOR':
      return reducePathTrustRumor(state);
    case 'PATH_REFUSE_RUMOR':
      return reducePathRefuseRumor(state);
    case 'PATH_SET_GOAL':
      return reducePathSetGoal(state, action.goal);
    case 'PATH_SET_TOOLS':
      return reducePathSetTools(state, action.tools);
    case 'PATH_SET_STOP':
      return reducePathSetStop(state, action.stop);
    case 'PATH_LOAD_READING':
      return reducePathLoadReading(state);
    case 'PATH_LOAD_MANGO':
      return reducePathLoadMango(state);
    case 'PATH_LOAD_CLINIC':
      return reducePathLoadClinic(state);
    case 'PATH_RUN_SKILL':
      return reducePathRunSkill(state);
    case 'PATH_RUN_OLD':
      return reducePathRunOld(state);
    case 'PATH_RUN_CHAT':
      return reducePathRunChat(state);
    case 'PATH_EXTRA_STEP':
      return reducePathExtraStep(state);
    case 'PATH_EXAM':
      return reducePathExam(state);
    case 'PATH_QUIZ':
      return reducePathQuiz(state);
    case 'PATH_ROBOT_DONE':
      return reducePathRobotDone(state);
    case 'PATH_PREPARE':
      return reducePathPrepare(state);
    case 'PATH_SET_RECIPIENT':
      return reducePathSetRecipient(state, action.recipient);
    case 'PATH_SET_PAYLOAD':
      return reducePathSetPayload(state, action.payload);
    case 'PATH_INSPECT_SEND':
      return reducePathInspectSend(state);
    case 'PATH_REJECT':
      return reducePathReject(state);
    case 'PATH_CONFIRM':
      return reducePathConfirm(state);
    case 'PATH_RESEND_OLD':
      return reducePathResendOld(state);
    case 'PASSPORT_OPEN':
      return reducePassportOpen(state);
    case 'PASSPORT_CONFIRM_NAME':
      return reducePassportConfirmName(state);
    case 'PASSPORT_DOWNLOAD':
      return reducePassportDownload(state, action.format);
    case 'PASSPORT_DOWNLOAD_FAIL':
      return reducePassportDownloadFail(state);
    case 'PASSPORT_EXAM':
      return reducePassportExam(state);
    case 'PASSPORT_PERCENT':
      return reducePassportPercent(state);
    case 'PASSPORT_VERIFY_PUBLIC':
      return reducePassportVerifyPublic(state);
    case 'PASSPORT_REGISTRY':
      return reducePassportRegistry(state);
    case 'PASSPORT_LEGACY':
      return reducePassportLegacy(state);
    case 'PASSPORT_NETWORK':
      return reducePassportNetwork(state);
    case 'PASSPORT_ROBOT_DONE':
      return reducePassportRobotDone(state);
    case 'CONFIRM_NEW_ADVENTURE':
      return createInitialState();
    case 'DISMISS_RESTORE_NOTICE':
      return { ...state, restoreNotice: false };
    case 'DEBUG_TELEPORT':
      return {
        ...state,
        map: action.map ?? state.map,
        position: { x: action.x, y: action.y },
      };
    default:
      return state;
  }
}

export function stepGame(store: KeyValueStore, state: GameState, action: GameAction): GameState {
  if (action.type === 'CONFIRM_NEW_ADVENTURE') {
    clearRafiqKeys(store);
    return createInitialState();
  }
  const next = reduce(state, action);
  if (shouldPersist(state, next, action)) {
    return persistAdventure(store, next);
  }
  return next;
}

export function serializeState(state: GameState): SerializedTestState {
  return {
    playerName: state.playerName,
    map: state.map,
    position: { x: state.position.x, y: state.position.y },
    facing: state.facing,
    mode: state.mode,
    trash: state.trash,
    encounter: state.encounter,
    dialogueNode: state.dialogueNode,
    conversationSeen: state.conversationSeen,
    storyObjective: state.storyObjective,
    checkpointReached: state.checkpointReached,
    nearby: getActionable(state),
    interactables: listInteractables(state),
    inventory: [...state.inventory],
    neighbor: state.neighbor,
    shopkeeper: state.shopkeeper,
    clerk: state.clerk,
    librarian: state.librarian,
    editor: state.editor,
    officer: state.officer,
    manager: state.manager,
    journalEvents: [...state.journalEvents],
    mapsVisited: [...state.mapsVisited],
    saveStatus: state.saveStatus,
    restoreNotice: state.restoreNotice,
    endingState: state.endingState,
    companion: state.encounter === 'help_accepted',
    evidence: { ...state.evidence },
    shopQuest: { ...state.shopQuest },
    parcelQuest: { ...state.parcelQuest },
    libraryQuest: { ...state.libraryQuest },
    newsroomQuest: { ...state.newsroomQuest },
    festivalQuest: { ...state.festivalQuest },
    workshopQuest: { ...state.workshopQuest },
    kioskQuest: { ...state.kioskQuest },
    labQuest: { ...state.labQuest },
    agentQuest: { ...state.agentQuest },
    bridgeQuest: { ...state.bridgeQuest },
    skillQuest: { ...state.skillQuest },
    approvalQuest: { ...state.approvalQuest },
    crewQuest: { ...state.crewQuest },
    pathQuest: { ...state.pathQuest },
    passportQuest: { ...state.passportQuest },
    inspectTarget: state.inspectTarget,
    explainTopic: state.explainTopic,
    robotUnderstood: state.robotUnderstood,
    calculatorResult: state.calculator.result,
  };
}

export { getActionable, listInteractables };
