import React, { useState, Suspense, useRef } from "react";
import 'antd/dist/reset.css';
import { Dropdown, Button, message } from 'antd';
import Templates from './Templates';
import POLICY_COLORS, { POLICY_OUTLINE } from './policyColors';

// Lazy-load json-edit-react to avoid build issues if types are missing
const JsonEditor = React.lazy(async () => {
	// @ts-ignore: dynamic import of a JS package without types
	const mod = await import("json-edit-react");
	// package exports a named `JsonEditor` component — prefer that, fallback to default
	const Comp = (mod as any).JsonEditor ?? (mod as any).default ?? (mod as any);
	return { default: Comp };
});

// json-edit-react has weak/missing types; help TS by aliasing to `any` for JSX usage
const AnyJsonEditor: any = JsonEditor;
const name = "Netflix 4K";
const initialPolicyData = JSON.parse(`{
    "uePolicySectionManagementList":[
      {
        "uePolicySectionManagementSublist":{
          "mccMNC":{
            "mcc":"452",
            "mnc":"04"
          },
          "uePolicySectionManagementSublistContents":[
            {
              "instruction":{
                "upsc":80,
                "uePolicySectionContents":[
                  {
                    "uePolicyPart":{
                      "spare4":0,
                      "uePolicyPartType":1,
                      "uePolicyPartContents":{
                        "ursp":[
                          {
                            "urspRule":{
                              "precedenceValue":0,
                              "trafficDescriptor":[
                                {
                                  "trafficDescriptorType":144,
                                  "trafficDescriptorValue":{
                                    "connectionCapabilities":[
                                      8
                                    ]
                                  }
                                }
                              ],
                              "routeSelectionDescriptorList":[
                                {
                                  "routeSelectionDescriptor":{
                                    "precedenceValue":0,
                                    "routeSelectionDescriptorContents":[
                                      {
                                        "routeSelectionType":2,
                                        "routeSelectionValue":{
                                          "s-NSSAI":{
                                            "length":4,
                                            "sNSSAI":{
                                              "sstAndSD":{
                                                "sst":1,
                                                "sd":1
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          {
                            "urspRule":{
                              "precedenceValue":1,
                              "trafficDescriptor":[
                                {
                                  "trafficDescriptorType":144,
                                  "trafficDescriptorValue":{
                                    "connectionCapabilities":[
                                      1
                                    ]
                                  }
                                }
                              ],
                              "routeSelectionDescriptorList":[
                                {
                                  "routeSelectionDescriptor":{
                                    "precedenceValue":0,
                                    "routeSelectionDescriptorContents":[
                                      {
                                        "routeSelectionType":2,
                                        "routeSelectionValue":{
                                          "s-NSSAI":{
                                            "length":4,
                                            "sNSSAI":{
                                              "sstAndSD":{
                                                "sst":1,
                                                "sd":1
                                              }
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          {
                            "urspRule":{
                              "precedenceValue":2,
                              "trafficDescriptor":[
                                {
                                  "trafficDescriptorType":8,
                                  "trafficDescriptorValue":{
                                    "osId-osAppId":{
                                      "osId":"97A498E3FC925C9489860333D06E4E47",
                                      "osAppId":"454E5445525052495345"
                                    }
                                  }
                                }
                              ],
                              "routeSelectionDescriptorList":[
                                {
                                  "routeSelectionDescriptor":{
                                    "precedenceValue":0,
                                    "routeSelectionDescriptorContents":[
                                      {
                                        "routeSelectionType":2,
                                        "routeSelectionValue":{
                                          "s-NSSAI":{
                                            "length":4,
                                            "sNSSAI":{
                                              "sstAndSD":{
                                                "sst":1,
                                                "sd":0
                                              }
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "routeSelectionType":4,
                                        "routeSelectionValue":{
                                          "dnn":{
                                            "dnn":"0A762D696E7465726E6574"
                                          }
                                        }
                                      }
                                    ]
                                  }
                                },
                                {
                                  "routeSelectionDescriptor":{
                                    "precedenceValue":1,
                                    "routeSelectionDescriptorContents":[
                                      {
                                        "routeSelectionType":2,
                                        "routeSelectionValue":{
                                          "s-NSSAI":{
                                            "length":4,
                                            "sNSSAI":{
                                              "sstAndSD":{
                                                "sst":1,
                                                "sd":1
                                              }
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "routeSelectionType":4,
                                        "routeSelectionValue":{
                                          "dnn":{
                                            "dnn":"0A762D696E7465726E6574"
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          {
                            "urspRule":{
                              "precedenceValue":3,
                              "trafficDescriptor":[
                                {
                                  "trafficDescriptorType":1,
                                  "trafficDescriptorValue":{
                                    "match-all":null
                                  }
                                }
                              ],
                              "routeSelectionDescriptorList":[
                                {
                                  "routeSelectionDescriptor":{
                                    "precedenceValue":0,
                                    "routeSelectionDescriptorContents":[
                                      {
                                        "routeSelectionType":2,
                                        "routeSelectionValue":{
                                          "s-NSSAI":{
                                            "length":4,
                                            "sNSSAI":{
                                              "sstAndSD":{
                                                "sst":1,
                                                "sd":1
                                              }
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "routeSelectionType":4,
                                        "routeSelectionValue":{
                                          "dnn":{
                                            "dnn":"0A762D696E7465726E6574"
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
}`);

export default function Welcome() {
	const [policyData, setPolicyData] = useState({});
	// Editor metadata (dynamic; updates when editor content changes or template applied)
	const [editorName, setEditorName] = useState('(unnamed)');
	const [editorLastModified, setEditorLastModified] = useState(new Date().toISOString());
	const [editorPolicyType, setEditorPolicyType] = useState('URSP');
	const [editorCategory, setEditorCategory] = useState('Policy');

	// Dropdown visibility state for Save
	const [saveDropdownOpen, setSaveDropdownOpen] = useState(false);

	// Inline name edit s tate
	const [editingName, setEditingName] = useState(false);
	const [nameInput, setNameInput] = useState(editorName);
	const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

// Derive the editor root key (top-level object key) and its content
	const rootKey = Object.keys(policyData)[0] ?? "Policy";

	// Simple undo/redo history stack managed outside the editor
	const historyRef = useRef<Array<any>>([initialPolicyData]);
	const historyIndexRef = useRef<number>(0);
	const applyingHistoryRef = useRef(false);
	const [, setTick] = useState(0);

	const pushHistory = (newData: any) => {
		if (applyingHistoryRef.current) return;
		const slice = historyRef.current.slice(0, historyIndexRef.current + 1);
		slice.push(JSON.parse(JSON.stringify(newData)));
		historyRef.current = slice;
		historyIndexRef.current = slice.length - 1;
		setTick((t) => t + 1);
	};

	const handleSetPolicyData = (newData: any) => {
		setPolicyData(newData);
		pushHistory(newData);
		// update last modified when the editor data changes, and update name if provided by data
		setEditorLastModified(new Date().toISOString());
		if (newData && typeof newData.name === 'string') setEditorName(newData.name);
	};

	const insertTemplateIntoPolicy = (templateOrData: any) => {
		// Accept either a template object { id, name, data } or raw data; prefer template.data if present
		const payload = templateOrData && templateOrData.data ? templateOrData.data : templateOrData;
		const dataCopy = JSON.parse(JSON.stringify(payload));
		// Set data WITHOUT pushing to history - template application is not an edit operation
		setPolicyData(dataCopy);
		// Reset history stack to start fresh from the template data
		historyRef.current = [dataCopy];
		historyIndexRef.current = 0;
		// Track which template is currently being edited
		if (templateOrData && typeof templateOrData.id === 'string') setCurrentTemplateId(templateOrData.id);
		// update editor metadata to the template's name (if available) and set lastModified to now
		if (templateOrData && typeof templateOrData.name === 'string') setEditorName(templateOrData.name);
		if (templateOrData && typeof templateOrData.policy === 'string') setEditorPolicyType(templateOrData.policy);
		if (templateOrData && typeof templateOrData.category === 'string') setEditorCategory(templateOrData.category);
		setEditorLastModified(new Date().toISOString());
		// show a toast confirmation
		message.success('Template applied to editor');
	};

	const canUndo = () => historyIndexRef.current > 0;
	const canRedo = () => historyIndexRef.current < historyRef.current.length - 1;

	const undo = () => {
		if (!canUndo()) return;
		applyingHistoryRef.current = true;
		historyIndexRef.current -= 1;
		setPolicyData(historyRef.current[historyIndexRef.current]);
		setTimeout(() => (applyingHistoryRef.current = false), 0);
		setTick((t) => t + 1);
	};

	const redo = () => {
		if (!canRedo()) return;
		applyingHistoryRef.current = true;
		historyIndexRef.current += 1;
		setPolicyData(historyRef.current[historyIndexRef.current]);
		setTimeout(() => (applyingHistoryRef.current = false), 0);
		setTick((t) => t + 1);
	};

	// Download helper
	const downloadFile = (filename: string, content: BlobPart, type = 'application/octet-stream') => {
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const handleSaveSelect = (key: string) => {
		switch (key) {
			case 'json': {
				const json = JSON.stringify(policyData, null, 2);
				downloadFile(`${name.replace(/\s+/g, '_')}.json`, json, 'application/json');
				break;
			}
			case 'binary': {
				const bytes = new TextEncoder().encode(JSON.stringify(policyData));
				downloadFile(`${name.replace(/\s+/g, '_')}.bin`, bytes, 'application/octet-stream');
				break;
			}
			case 'hex': {
				const bytes = new TextEncoder().encode(JSON.stringify(policyData));
				const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
				downloadFile(`${name.replace(/\s+/g, '_')}.hex`, hex, 'text/plain');
				break;
			}
			case 'registry': {
				window.alert('Save to Policy registry is not implemented yet.');
				break;
			}
			default:
				break;
		}
	};

	return (
		<div className="min-h-screen px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-x-hidden">

			<main className="w-full grid grid-cols-[minmax(160px,20%)_minmax(0,1fr)_minmax(160px,20%)] gap-4 min-h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)]">
				<aside className="min-w-0 min-h-0 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded shadow-sm p-3 flex flex-col max-h-[calc(100vh-6rem)]">
					{/* Left column: Templates */}
					<Templates onInsert={insertTemplateIntoPolicy} onDelete={() => { setPolicyData({}); setEditorName('(unnamed)'); setEditorLastModified(new Date().toISOString()); setCurrentTemplateId(null); }} currentEditingId={currentTemplateId} />
				</aside>

				<section className="min-w-0 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded shadow-sm p-3 flex flex-col max-h-[calc(100vh-6rem)]">
					{/* Metadata: Name + Badges (on same line) */}
					<div className="flex items-start justify-between gap-4 mb-3">
						<div className="flex-1 min-w-0">
							{editingName ? (
								<div className="flex items-center gap-2 mb-2">
									<input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setEditorName(nameInput); setEditingName(false); setEditorLastModified(new Date().toISOString()); message.success('Name saved'); } }} className="text-2xl font-semibold border-b border-gray-300 dark:border-gray-700 bg-transparent px-1 py-0.5" />
									<button aria-label="Save" onClick={() => { setEditorName(nameInput); setEditingName(false); setEditorLastModified(new Date().toISOString()); message.success('Name saved'); }} className="text-green-600 p-0.5 rounded hover:bg-green-50 text-sm">✓</button>
									<button aria-label="Cancel" onClick={() => { setNameInput(editorName); setEditingName(false); }} className="text-gray-500 p-0.5 rounded hover:bg-gray-100 text-sm">✕</button>
								</div>
							) : (
								<h2 onClick={() => { setEditingName(true); setNameInput(editorName); }} title="Click to rename" className="text-2xl font-semibold cursor-edit hover:underline truncate mb-1">{editorName || '(unnamed)'}</h2>
							)}
						</div>
						<div className="flex items-center gap-2 flex-shrink-0">
						<span className={`inline-block px-2.5 py-1 rounded text-sm font-medium ${POLICY_COLORS[editorPolicyType] ?? 'bg-blue-500 text-white'}`}>{editorPolicyType}</span>
						<span className={`inline-block px-2.5 py-1 rounded text-sm border font-medium ${POLICY_OUTLINE[editorPolicyType] ?? 'border-blue-500 text-blue-500'}`}>{editorCategory}</span>
						</div>
					</div>

					{/* Controls */}
					<div className="flex items-center justify-between gap-2 mb-3">
						<div className="flex items-center gap-2">
							<button onClick={undo} disabled={!canUndo()} className={`px-3 py-1 border rounded text-sm ${!canUndo() ? "opacity-50 cursor-not-allowed" : ""}`}>Undo</button>
							<button onClick={redo} disabled={!canRedo()} className={`px-3 py-1 border rounded text-sm ${!canRedo() ? "opacity-50 cursor-not-allowed" : ""}`}>Redo</button>
							{/* Save dropdown - show on hover */}
							{/* @ts-ignore */}
							<Dropdown
								open={saveDropdownOpen}
								onOpenChange={setSaveDropdownOpen}
								trigger={['hover']}
								menu={{
									items: [
										{ key: 'json', label: 'Save as JSON' },
										{ key: 'binary', label: 'Save as Binary' },
										{ key: 'hex', label: 'Save as Hex' },
										{ key: 'registry', label: 'Policy registry' }
									],
									onClick: (info: any) => { handleSaveSelect(info.key); setSaveDropdownOpen(false); },
								}}
							>
								<Button className="bg-green-600 text-white border-0">Save ▾</Button>
							</Dropdown>
						</div>
						<div className="text-xs text-gray-500 flex-shrink-0">Last modified: {new Date(editorLastModified).toLocaleString()}</div>
					</div>

					{/* Editor */}
					<div className="flex-1 overflow-auto border-t border-gray-200 pt-3">
						{Object.keys(policyData).length === 0 ? (
							<div className="h-full flex items-center justify-center text-gray-400">
								<p>Select a template or create a new policy to get started</p>
							</div>
						) : (
							<div className="h-full">
								<Suspense fallback={<div className="text-sm text-gray-500">Loading editor...</div>}>
									{/* json-edit-react expects `data` and `setData` props (see package) */}
									{/* @ts-ignore */}
									<AnyJsonEditor
										data={policyData}
										setData={handleSetPolicyData}
										minWidth={300}
										maxWidth="100%"
										indent={2}
										showCollectionCount={false}
										collapse={false}
										stringTruncate={500}
										showStringQuotes={true}
										className="jer-editor-container h-full"
									/>
								</Suspense>
							</div>
						)}
					</div>
				</section>

				<aside className="min-w-0 border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800 flex flex-col max-h-[calc(100vh-6rem)] overflow-auto">
					<h4 className="font-bold text-center mb-2">Agent</h4>
					<div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded mb-2 p-2 overflow-auto text-sm"></div>
					<div className="flex gap-2">
						<input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Type a message..." />
						<button className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
					</div>
				</aside>
			</main>
		</div>
	);
}
