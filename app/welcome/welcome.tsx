import React, { useState, Suspense, useRef } from "react";
import 'antd/dist/reset.css';
import { Dropdown, Button, message } from 'antd';
import Templates from './Templates';

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
const lastModified = "2025-12-19T15:48:42Z";
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

export default function Welcome({ message }: { message?: string }) {
	const [policyData, setPolicyData] = useState(initialPolicyData);

// Derive the editor root key (top-level object key) and its content
	const rootKey = Object.keys(policyData)[0] ?? "Policy";
	const rootTitle = rootKey;
	const rootContent = policyData[rootKey];

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
	};

	const insertTemplateIntoPolicy = (template: any) => {
		// Replace entire editor content with the selected template and record it in history
		handleSetPolicyData(JSON.parse(JSON.stringify(template)));
		// show a toast confirmation
		message.success('Template applied to editor');
	};

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
		<div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<header className="border-b border-gray-300 dark:border-gray-700 mb-4">
				<div className="max-w-[1200px] mx-auto flex items-center justify-between py-3">
				<h1 className="text-xl font-bold">Policy Editor</h1>
				</div>
			</header>

			<main className="max-w-[1200px] mx-auto grid grid-cols-3 gap-6 min-h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)]">
				<section className="col-span-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded shadow-sm p-4 flex flex-col max-h-[calc(100vh-6rem)]">
					<div className="flex items-center justify-between mb-2">
						<div>
				<h2 className="text-2xl font-semibold">{name} <span className="ml-3 inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">Policy</span></h2>
					<div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last modified: {new Date(lastModified).toLocaleString()}</div>
					</div>
						<div className="flex items-center gap-2">
						<button onClick={undo} disabled={!canUndo()} className={`px-3 py-1 border rounded text-sm ${!canUndo() ? "opacity-50 cursor-not-allowed" : ""}`}>Undo</button>
						<button onClick={redo} disabled={!canRedo()} className={`px-3 py-1 border rounded text-sm ${!canRedo() ? "opacity-50 cursor-not-allowed" : ""}`}>Redo</button>
						{/* Save dropdown (Ant Design) */}
						{/* @ts-ignore */}
						<Dropdown
							menu={{
								items: [
									{ key: 'json', label: 'Save as JSON' },
									{ key: 'binary', label: 'Save as Binary' },
									{ key: 'hex', label: 'Save as Hex' },
									{ key: 'registry', label: 'Policy registry' }
								],
								onClick: (info: any) => handleSaveSelect(info.key),
							}}
						>
							<Button className="bg-green-600 text-white border-0">Save ▾</Button>
						</Dropdown>
					</div>
					</div>
					<div className="flex-1 overflow-auto border-t border-gray-200 pt-3">
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
					</div>
				</section>

				<aside className="col-span-1 flex flex-col gap-4">
						<Templates onInsert={insertTemplateIntoPolicy} />

					<div className="border border-gray-300 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800 flex-1 flex flex-col">
						<h4 className="font-bold text-center mb-2">Agent</h4>
						<div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded mb-2 p-2 overflow-auto text-sm"></div>
						<div className="flex gap-2">
							<input className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Type a message..." />
							<button className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
						</div>
					</div>
				</aside>
			</main>
		</div>
	);
}
