import React, { useState } from "react";

export default function Templates({ onInsert }: { onInsert: (data: any) => void }) {
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
		if (!opts.includes(category)) setCategory(opts[0]);
	}, [selected]);

	const categories = componentsByPolicy[selected] || ['Policy'];

	// sample templates for demo purposes
	const templatesData: Record<string, Record<string, Array<{ id: string; name: string; data: any }>>> = {
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
			Policy: [{ id: 'a2x-policy-1', name: 'A2X Policy', data: { } }],
			Rules: [],
			['Route Descriptors']: []
		},
		V2X: { Policy: [], Rules: [], ['Traffic Descriptors']: [] },
		ANDSP: { Policy: [], Rules: [] },
		ProSe: { Policy: [], Rules: [] }
	};

	const results = (templatesData[selected]?.[category] || []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-bold text-lg">Templates</h3>
			</div>
			<div className="mb-3">
				<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full border rounded px-2 py-1 text-sm" />
			</div>
			<div className="mb-3">
				<div className="text-sm font-medium mb-2">Policy Type</div>
				<div className="flex gap-2" role="radiogroup" aria-label="Templates category">
				{['A2X','V2X','URSP','ANDSP','ProSe'].map((cat) => (
					<button
						key={cat}
						type="button"
						onClick={() => setSelected(cat)}
						aria-pressed={selected === cat}
						className={`px-3 py-1 rounded text-sm ${selected === cat ? 'bg-blue-500 text-white' : 'border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
						{cat}
					</button>
				))}
				</div>
			</div>

			<div className="mb-3">
				<div className="text-sm font-medium mb-2">Category</div>
				<div className="flex gap-2" role="radiogroup" aria-label="Category">
					{categories.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setCategory(opt)}
							aria-pressed={category === opt}
							className={`px-3 py-1 rounded text-sm ${category === opt ? 'bg-blue-500 text-white' : 'border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
							{opt}
						</button>
					))}
				</div>
			</div>

			<div className="border rounded overflow-hidden">
				{categories.map((opt) => (
					<div key={opt} className={`p-3 text-center ${opt === category ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 border-b'}`}>{opt}</div>
				))}
			</div>

			{/* Results list */}
			<div className="mt-3">
				<div className="text-sm font-medium mb-2">Results</div>
				<div className="space-y-2">
					{results.length === 0 && <div className="text-sm text-gray-500">No templates</div>}
					{results.map((r) => (
						<button key={r.id} onClick={() => onInsert(r.data)} className="w-full text-left p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
							<div className="font-medium">{r.name}</div>
							<div className="text-xs text-gray-500 mt-1">Click to insert into editor</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}