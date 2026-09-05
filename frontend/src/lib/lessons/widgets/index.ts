import type { Component } from 'svelte';
import type { LessonStep } from '../../../convex/model/lessonSteps';
import type { Action } from '../engine/validate';
import OrderList from './common/OrderList.svelte';
import AudiencePicker from './rusender/AudiencePicker.svelte';
import BlockEditor from './rusender/BlockEditor.svelte';
import CampaignHeader from './rusender/CampaignHeader.svelte';
import CampaignList from './rusender/CampaignList.svelte';
import SegmentBuilder from './rusender/SegmentBuilder.svelte';
import SendDialog from './rusender/SendDialog.svelte';
import UcDesignPicker from './ucoz/DesignPicker.svelte';
import UcDomain from './ucoz/Domain.svelte';
import UcPageBuilder from './ucoz/PageBuilder.svelte';
import UcPanel from './ucoz/Panel.svelte';
import UcSettings from './ucoz/Settings.svelte';
import WaDashboard from './webask/Dashboard.svelte';
import WaLogic from './webask/Logic.svelte';
import WaPublish from './webask/Publish.svelte';
import WaQuestionText from './webask/QuestionText.svelte';
import WaQuestionType from './webask/QuestionType.svelte';
import WaResults from './webask/Results.svelte';
import './widgets.css';

export type WidgetProps = { step: LessonStep; onaction: (action: Action) => void; wrong: boolean };

export const widgets: Record<string, Component<WidgetProps>> = {
	campaignList: CampaignList,
	campaignHeader: CampaignHeader,
	blockEditor: BlockEditor,
	audiencePicker: AudiencePicker,
	sendDialog: SendDialog,
	segmentBuilder: SegmentBuilder,
	orderList: OrderList,
	ucPanel: UcPanel,
	ucSettings: UcSettings,
	ucDomain: UcDomain,
	ucDesign: UcDesignPicker,
	ucPageBuilder: UcPageBuilder,
	waDashboard: WaDashboard,
	waQuestionType: WaQuestionType,
	waQuestionText: WaQuestionText,
	waLogic: WaLogic,
	waPublish: WaPublish,
	waResults: WaResults
};
