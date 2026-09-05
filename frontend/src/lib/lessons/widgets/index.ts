import type { Component } from 'svelte';
import type { LessonStep } from '../../../convex/model/lessonSteps';
import type { Action } from '../engine/validate';
import AudiencePicker from './rusender/AudiencePicker.svelte';
import BlockEditor from './rusender/BlockEditor.svelte';
import CampaignHeader from './rusender/CampaignHeader.svelte';
import CampaignList from './rusender/CampaignList.svelte';
import SendDialog from './rusender/SendDialog.svelte';

export type WidgetProps = { step: LessonStep; onaction: (action: Action) => void; wrong: boolean };

export const widgets: Record<string, Component<WidgetProps>> = {
	campaignList: CampaignList,
	campaignHeader: CampaignHeader,
	blockEditor: BlockEditor,
	audiencePicker: AudiencePicker,
	sendDialog: SendDialog
};
