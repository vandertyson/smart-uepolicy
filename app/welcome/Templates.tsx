import React from "react";

export default function Templates() {
	return (
		<div className="border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-bold text-lg">Templates</h3>
				<input placeholder="Search" className="border rounded px-2 py-1 text-sm" />
			</div>
			<div className="flex gap-2 mb-3">
				<button className="px-2 py-1 border rounded text-sm">A2X</button>
				<button className="px-2 py-1 bg-blue-500 text-white rounded text-sm">URSP</button>
				<button className="px-2 py-1 border rounded text-sm">V2X</button>
				<button className="px-2 py-1 border rounded text-sm">ProSe</button>
			</div>
			<div className="border rounded overflow-hidden">
				<div className="p-3 text-center border-b text-gray-600">Policy</div>
				<div className="p-3 text-center border-b text-gray-600">Rules</div>
				<div className="p-3 text-center bg-blue-500 text-white font-semibold">Route Descriptors</div>
				<div className="p-3 text-center border-t text-gray-600">Traffic Descriptors</div>
			</div>
		</div>
	);
}