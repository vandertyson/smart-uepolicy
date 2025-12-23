import React, { useState } from "react";

import { message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default function Templates({ onInsert, onDelete, currentEditingId }: { onInsert: (template: any) => void; onDelete?: () => void; currentEditingId?: string | null }) {
	const [selected, setSelected] = useState('URSP');
	const [search, setSearch] = useState('');
	const componentsByPolicy: Record<string, string[]> = {
		URSP: ['Policy', 'Rules', 'Traffic Descriptors', 'Route Descriptors'],
		A2X: ['Policy', 'Rules', 'Route Descriptors'],
		V2X: ['Policy', 'Rules', 'Traffic Descriptors'],
		ANDSP: ['Policy', 'Rules'],
		ProSe: ['Policy', 'Rules']
	};
	const [category, setCategory] = useState<string>(componentsByPolicy[selected][0]);

	// keep category in sync when selected policy changes
	React.useEffect(() => {
		const opts = componentsByPolicy[selected] || ['Policy'];
		const defaultCat = opts[0];
		// ensure category stays valid for the new policy
		setCategory((prev) => (opts.includes(prev) ? prev : defaultCat));
	}, [selected]);

	const categories = componentsByPolicy[selected] || ['Policy'];

	// sample templates for demo purposes
	const initialTemplates: Record<string, Record<string, Array<{ id: string; name: string; data: any }>>> = {
		URSP: {
			Policy: [
				{ id: 'ursp-policy-1', name: 'URSP Policy A', data: { uePolicySectionManagementSublist: { mccMNC: { mcc: '452', mnc: '04' } } } }
			],
			Rules: [
				{ id: 'ursp-rule-1', name: 'URSP Rule: video', data: { urspRule: { precedenceValue: 0, trafficDescriptor: [{ trafficDescriptorType: 144, trafficDescriptorValue: { connectionCapabilities: [8] } }], routeSelectionDescriptorList: [] } } }
			],
			['Traffic Descriptors']: [
				{ id: 'ursp-td-1', name: 'TD: video', data: { trafficDescriptorType: 144, trafficDescriptorValue: { connectionCapabilities: [8] } } }
			],
			['Route Descriptors']: [
				{ id: 'ursp-rd-1', name: 'RD: default', data: { routeSelectionDescriptor: { precedenceValue: 0, routeSelectionDescriptorContents: [] } } }
			]
		},
		A2X: {
			Policy: [{ id: 'a2x-policy-1', name: 'A2X Policy', data: {} }],
			Rules: [],
			['Route Descriptors']: []
		},
		V2X: { Policy: [], Rules: [], ['Traffic Descriptors']: [] },
		ANDSP: { Policy: [], Rules: [] },
		ProSe: { Policy: [], Rules: [] }
	};

	const [templatesByPolicy, setTemplatesByPolicy] = useState(initialTemplates);

	const results = (templatesByPolicy[selected]?.[category] || []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800 flex flex-col h-full">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-bold text-lg">Templates</h3>
			</div>
			<div className="mb-3">
				<label className="text-sm font-medium mb-2 block">Policy Type</label>
				<select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800">
					{['A2X', 'V2X', 'URSP', 'ANDSP', 'ProSe'].map((cat) => (
						<option key={cat} value={cat}>{cat}</option>
					))}
				</select>
			</div>

			<div className="mb-3">
				<label className="text-sm font-medium mb-2 block">Category</label>
				<select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800">
					{categories.map((opt) => (
						<option key={opt} value={opt}>{opt}</option>
					))}
				</select>
			</div>

			<div className="mb-3">
				<label htmlFor="template-search" className="text-sm font-medium mb-2 block">Search</label>
				<div className="flex gap-2">
					<input id="template-search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { /* focus remains on input after search */ } }} placeholder="Search templates..." className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
					<button onClick={() => { /* trigger search */ }} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0">Search</button>
				</div>

				<hr className="border-t border-gray-200 dark:border-gray-700 my-3" />
				<div className="mt-3 flex-1 min-h-0">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-3">
							<div className="text-sm font-medium">Results</div>
							<div className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''}</div>
						</div>
						<div>
							<button onClick={() => {
								const id = `tmp-${Date.now()}`;
								const newItem = { id, name: 'New template', data: {} };
								setTemplatesByPolicy(prev => {
									const copy = { ...prev } as any;
									copy[selected] = { ...(copy[selected] || {}) };
									copy[selected][category] = [newItem, ...(copy[selected][category] || [])];
									return copy;
								});
								message.success('Added new template');
							}} className="text-sm border rounded px-3 py-1 bg-white dark:bg-gray-800">+ Add new item</button>
						</div>
					</div>
					<div className="space-y-2 overflow-auto pr-1 h-full">
						{results.length === 0 && <div className="text-sm text-gray-500">No templates</div>}
						{results.map((r) => (
							<div key={r.id} className={`w-full flex items-center justify-between p-2 rounded border group ${currentEditingId === r.id ? 'bg-blue-50 dark:bg-blue-900 border-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
								<button onClick={() => onInsert({ ...r, category, policy: selected })} className="text-left flex-1 min-w-0">
									<div className="font-medium truncate">{r.name}</div>
									<div className="text-xs text-gray-500 mt-1">Click to apply to editor</div>
								</button>
								<button aria-label="Delete" onClick={() => {
									setTemplatesByPolicy(prev => {
										const copy = { ...prev } as any;
										copy[selected] = { ...(copy[selected] || {}) };
										copy[selected][category] = (copy[selected][category] || []).filter((t: any) => t.id !== r.id);
										return copy;
									});
									message.success('Deleted');
									onDelete?.();
								}} className="text-red-600 p-1 rounded hover:bg-red-100 bg-red-50 ml-2 flex-shrink-0">
									<DeleteOutlined />
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}