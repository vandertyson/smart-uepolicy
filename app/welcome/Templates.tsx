import React, { useState } from "react";

export default function Templates() {
	const [selected, setSelected] = useState('URSP');
	const componentsByPolicy: Record<string, string[]> = {
		URSP: ['Policy', 'Rules', 'Traffic Descriptors', 'Route Descriptors'],
		A2X: ['Policy', 'Rules', 'Route Descriptors'],
		V2X: ['Policy', 'Rules', 'Traffic Descriptors'],
		ANDSP: ['Policy', 'Rules'],
		ProSe: ['Policy', 'Rules']
	};
	const [component, setComponent] = useState<string>(componentsByPolicy[selected][0]);

	// keep component in sync when selected policy changes
	React.useEffect(() => {
		const opts = componentsByPolicy[selected] || ['Policy'];
		if (!opts.includes(component)) setComponent(opts[0]);
	}, [selected]);

	const options = componentsByPolicy[selected] || ['Policy'];

	return (
		<div className="border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-bold text-lg">Templates</h3>
			</div>
			<div className="mb-3">
				<input placeholder="Search" className="w-full border rounded px-2 py-1 text-sm" />
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
				<div className="text-sm font-medium mb-2">Component Type</div>
				<div className="flex gap-2" role="radiogroup" aria-label="Component type">
					{options.map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setComponent(opt)}
							aria-pressed={component === opt}
							className={`px-3 py-1 rounded text-sm ${component === opt ? 'bg-blue-500 text-white' : 'border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
							{opt}
						</button>
					))}
				</div>
			</div>

			<div className="border rounded overflow-hidden">
				{options.map((opt) => (
					<div key={opt} className={`p-3 text-center ${opt === component ? 'bg-blue-500 text-white font-semibold' : 'text-gray-600 border-b'}`}>{opt}</div>
				))}
			</div>
		</div>
	);
}