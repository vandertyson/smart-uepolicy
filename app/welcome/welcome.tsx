import React, { useState, useEffect } from "react";
import 'antd/dist/reset.css';
import { Dropdown, Button, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import Templates from './Templates';
import PolicyFormEditor from './PolicyFormEditor';
import POLICY_COLORS, { POLICY_OUTLINE } from './policyColors';
import { policyApi, convertToLegacyFormat, convertFromLegacyFormat, type PolicyFull } from '../api/ursp-api';


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
	const [isClient, setIsClient] = useState(false);
	// Editor metadata (dynamic; updates when editor content changes or template applied)
	const [editorName, setEditorName] = useState('(unnamed)');
	const [editorLastModified, setEditorLastModified] = useState(new Date().toISOString());
	const [editorPolicyType, setEditorPolicyType] = useState('URSP');
	const [editorCategory, setEditorCategory] = useState('Policy');
	
	// State for loaded policies from database
	const [loadedPolicies, setLoadedPolicies] = useState<any[]>([]);
	const [currentPolicyId, setCurrentPolicyId] = useState<string | null>(null);
	const [currentPartId, setCurrentPartId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Set client-side flag to avoid hydration mismatch
	useEffect(() => {
		setIsClient(true);
	}, []);
	
	// Load policies from API on mount
	useEffect(() => {
		const loadPolicies = async () => {
			try {
				const response = await policyApi.list();
				if (response.success && response.data) {
					setLoadedPolicies(response.data);
					console.log('Loaded policies from API:', response.data);
				}
			} catch (error) {
				console.error('Failed to load policies:', error);
			}
		};
		loadPolicies();
	}, []);

	// Inline name edit state
	const [editingName, setEditingName] = useState(false);
	const [nameInput, setNameInput] = useState(editorName);
	const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

	const handleSetPolicyData = (newData: any) => {
		setPolicyData(newData);
		setEditorLastModified(new Date().toISOString());
	};

	const insertTemplateIntoPolicy = (templateOrData: any) => {
		// Accept either a template object { id, name, data } or raw data; prefer template.data if present
		const payload = templateOrData && templateOrData.data ? templateOrData.data : templateOrData;
		const dataCopy = JSON.parse(JSON.stringify(payload));
		setPolicyData(dataCopy);
		
		// Track which template is currently being edited
		if (templateOrData && typeof templateOrData.id === 'string') setCurrentTemplateId(templateOrData.id);
		// Track policy ID and part ID if loading from database
		if (templateOrData && typeof templateOrData.policyId === 'string') {
			setCurrentPolicyId(templateOrData.policyId);
			if (templateOrData.partId) setCurrentPartId(templateOrData.partId);
		}
		// update editor metadata to the template's name (if available) and set lastModified to now
		if (templateOrData && typeof templateOrData.name === 'string') setEditorName(templateOrData.name);
		if (templateOrData && typeof templateOrData.policy === 'string') setEditorPolicyType(templateOrData.policy);
		if (templateOrData && typeof templateOrData.category === 'string') setEditorCategory(templateOrData.category);
		setEditorLastModified(new Date().toISOString());
		// show a toast confirmation
		message.success('Template applied to editor');
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

	const handleSaveSelect = async (key: string) => {
		switch (key) {
			case 'database': {
				if (loading) return;
				setLoading(true);
				try {
					if (currentPolicyId) {
						// Update existing policy
						const response = await policyApi.update(currentPolicyId, {
							name: editorName,
							description: `Last modified: ${editorLastModified}`,
						});
						if (response.success) {
							message.success('Policy updated in database');
						} else {
							message.error(response.error || 'Failed to update policy');
						}
					} else {
						// Create new policy
						const response = await policyApi.create({
							name: editorName,
							description: `Created: ${editorLastModified}`,
							mcc: '452',
							mnc: '04',
						});
						if (response.success && response.data) {
							setCurrentPolicyId(response.data.id);
							message.success('Policy saved to database');
							// Reload policies list
							const listResponse = await policyApi.list();
							if (listResponse.success && listResponse.data) {
								setLoadedPolicies(listResponse.data);
							}
						} else {
							message.error(response.error || 'Failed to save policy');
						}
					}
				} catch (error) {
					console.error('Error saving to database:', error);
					message.error('Failed to save to database');
				} finally {
					setLoading(false);
				}
				break;
			}
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
					<Templates 
						onInsert={insertTemplateIntoPolicy} 
						onDelete={() => { 
							setPolicyData({}); 
							setEditorName('(unnamed)'); 
							setEditorLastModified(new Date().toISOString()); 
							setCurrentTemplateId(null);
							setCurrentPolicyId(null);
							setCurrentPartId(null);
						}} 
						currentEditingId={currentTemplateId}
						loadedPolicies={loadedPolicies}
						onLoadPolicy={async (policyId: string) => {
							try {
								const response = await policyApi.getFull(policyId);
								if (response.success && response.data) {
									const legacyFormat = convertToLegacyFormat(response.data);
									const partId = response.data.parts[0]?.id || null;
									insertTemplateIntoPolicy({
										id: policyId,
										name: response.data.name,
										data: legacyFormat,
										policyId: policyId,
										partId: partId,
										policy: 'URSP',
										category: 'Policy'
									});
								} else {
									message.error(response.error || 'Failed to load policy');
								}
							} catch (error) {
								console.error('Error loading policy:', error);
								message.error('Failed to load policy from database');
							}
						}}
					/>
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
							{/* Save dropdown */}
							<Dropdown
								trigger={['click']}
								menu={{
									items: [
										{ key: 'database', label: currentPolicyId ? '💾 Update in Database' : '💾 Save to Database' },
										{ type: 'divider' },
										{ key: 'json', label: 'Save as JSON' },
										{ key: 'binary', label: 'Save as Binary' },
										{ key: 'hex', label: 'Save as Hex' },
										{ key: 'registry', label: 'Policy registry' }
									],
									onClick: (info: any) => { handleSaveSelect(info.key); },
								}}
							>
								<Button className="bg-green-600 text-white border-0 hover:bg-green-700" loading={loading}>
									💾 Save ▾
								</Button>
							</Dropdown>

							{/* Delete button */}
							{currentPolicyId && (
								<Popconfirm
									title="Delete Policy"
									description="Are you sure you want to delete this policy?"
									onConfirm={async () => {
										try {
											setLoading(true);
											const response = await policyApi.delete(currentPolicyId);
											if (response.success) {
												message.success('Policy deleted successfully');
												// Clear editor
												setPolicyData({});
												setEditorName('(unnamed)');
												setCurrentPolicyId(null);
												setCurrentPartId(null);
												// Reload policies list
												const listResponse = await policyApi.list();
												if (listResponse.success && listResponse.data) {
													setLoadedPolicies(listResponse.data);
												}
											} else {
												message.error(response.error || 'Failed to delete policy');
											}
										} catch (error) {
											console.error('Error deleting policy:', error);
											message.error('Failed to delete policy');
										} finally {
											setLoading(false);
										}
									}}
									okText="Yes, delete"
									cancelText="Cancel"
									okButtonProps={{ danger: true }}
								>
									<Button danger icon={<DeleteOutlined />} loading={loading}>
										Delete
									</Button>
								</Popconfirm>
							)}
						</div>
						<div className="text-xs text-gray-500 flex-shrink-0">
							Last modified: {isClient ? new Date(editorLastModified).toLocaleString() : 'Loading...'}
						</div>
					</div>

					{/* Editor */}
					<div className="flex-1 overflow-auto border-t border-gray-200 pt-3">
						{Object.keys(policyData).length === 0 ? (
							<div className="h-full flex items-center justify-center text-gray-400">
								<p>Select a template or create a new policy to get started</p>
							</div>
						) : (
							<PolicyFormEditor 
								data={policyData}
								onChange={handleSetPolicyData}
							/>
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
