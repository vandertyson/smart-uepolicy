import React from 'react';
import { Form, Input, Button, Collapse, Select, InputNumber, Space, Divider, Card, Tag, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, CaretRightOutlined } from '@ant-design/icons';

interface PolicyFormEditorProps {
	data: any;
	onChange: (data: any) => void;
}

export default function PolicyFormEditor({ data, onChange }: PolicyFormEditorProps) {
	const [form] = Form.useForm();
	const [formData, setFormData] = React.useState<any>({
		name: '',
		mcc: '',
		mnc: '',
		upsi: '',
		rules: []
	});
	const isInternalChange = React.useRef(false);
	const prevDataRef = React.useRef<any>(null);

	React.useEffect(() => {
		// Only update form if data changed externally (not from user input)
		if (isInternalChange.current) {
			isInternalChange.current = false;
			return;
		}

		// Check if data actually changed
		const dataStr = JSON.stringify(data);
		if (prevDataRef.current === dataStr) {
			return;
		}
		prevDataRef.current = dataStr;

		console.log('PolicyFormEditor - Received data:', JSON.stringify(data, null, 2));
		
		// Extract data from complex nested structure
		let extractedData: any = {
			name: '',
			mcc: '',
			mnc: '',
			upsi: '',
			rules: []
		};

		// Format 1: From convertToLegacyFormat (API format)
		if (data.uePolicySectionContents) {
			console.log('Using uePolicySectionContents format (from API)');
			const urspRules = data.uePolicySectionContents?.[0]?.uePolicy?.uePolicySection?.[0]?.ursp || [];
			
			// Transform to match Form's nested structure: rules[].urspRule.*
			extractedData.rules = urspRules.map((rule: any) => ({
				urspRule: {
					precedenceValue: rule.precedence,
					trafficDescriptor: rule.trafficDescriptors?.map((td: any) => ({
						trafficDescriptorType: td.type,
						trafficDescriptorValue: td
					})) || [],
					routeSelectionDescriptorList: rule.routeSelectionDescriptor?.map((rd: any) => ({
						routeSelectionDescriptor: {
							precedenceValue: rd.precedence,
							routeSelectionDescriptorContents: [
								// Convert sNssais to components (type 1)
								...(rd.sNssais || []).map((snssai: any) => ({
									routeSelectionComponentType: 1,
									routeSelectionComponentValue: snssai
								})),
								// Convert dnns to components (type 2)
								...(rd.dnns || []).map((dnn: string) => ({
									routeSelectionComponentType: 2,
									routeSelectionComponentValue: { dnn: dnn }
								}))
							]
						}
					})) || []
				}
			}));
			
			console.log('Transformed rules for Form:', JSON.stringify(extractedData.rules, null, 2));
		}
		// Format 2: From database format (simpler structure)
		else if (data.uePolicySectionManagementSublist) {
			console.log('Using uePolicySectionManagementSublist format');
			extractedData.name = data.uePolicySectionManagementSublist?.uePolicySection?.[0]?.uePolicySectionIdentifier || '';
			extractedData.mcc = data.uePolicySectionManagementSublist?.mccMNC?.mcc || '';
			extractedData.mnc = data.uePolicySectionManagementSublist?.mccMNC?.mnc || '';
			extractedData.upsi = data.uePolicySectionManagementSublist?.upsi || '';
			extractedData.rules = data.uePolicySectionManagementSublist?.uePolicySection?.[0]?.urspRules || [];
		}
		// Format 3: From full policy format (nested structure)
		else if (data.uePolicySectionManagementList) {
			console.log('Using uePolicySectionManagementList format');
			const mgmtSublist = data.uePolicySectionManagementList?.[0]?.uePolicySectionManagementSublist;
			extractedData.mcc = mgmtSublist?.mccMNC?.mcc || '';
			extractedData.mnc = mgmtSublist?.mccMNC?.mnc || '';
			extractedData.upsi = mgmtSublist?.upsi || '';
			
			// Extract URSP rules from nested structure
			const contents = mgmtSublist?.uePolicySectionManagementSublistContents?.[0];
			const policyPart = contents?.instruction?.uePolicySectionContents?.[0]?.uePolicyPart;
			const urspRules = policyPart?.uePolicyPartContents?.ursp || [];
			extractedData.rules = urspRules;
			console.log('Extracted URSP rules from nested format:', urspRules);
		}

		console.log('PolicyFormEditor - Extracted data:', extractedData);
		console.log('Rules count:', extractedData.rules?.length || 0);
		
		setFormData(extractedData);
		form.setFieldsValue(extractedData);
	}, [data, form]);

	const handleValuesChange = (changedValues: any, allValues: any) => {
		// Mark this as internal change to prevent form reset
		isInternalChange.current = true;
		
		// Convert form values back to policy data structure
		const newData = {
			uePolicySectionManagementSublist: {
				mccMNC: {
					mcc: allValues.mcc || '',
					mnc: allValues.mnc || ''
				},
				upsi: allValues.upsi || '',
				uePolicySection: [{
					uePolicySectionIdentifier: allValues.name || '',
					urspRules: allValues.rules || []
				}]
			}
		};
		onChange(newData);
	};

	return (
		<div className="h-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
			<Form
				form={form}
				layout="vertical"
				onValuesChange={handleValuesChange}
				className="max-w-6xl mx-auto"
				initialValues={formData}
			>
				{/* URSP Rules Section */}
				<Card title="📑 URSP Rules" className="mb-4">
					<div className="mb-3 text-sm text-gray-600">
						{formData.rules?.length > 0 ? (
							<span>✅ Found {formData.rules.length} rules</span>
						) : (
							<span className="text-orange-600">⚠️ No rules found in policy data</span>
						)}
					</div>
					<Form.List name="rules">
						{(fields, { add, remove }) => (
							<>
								{fields.length === 0 && (
									<div className="text-center py-8 text-gray-400">
										No rules yet. Click "Add Rule" to create one.
									</div>
								)}
								<Collapse
									expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
									className="mb-4"
								>
									{fields.map((field, index) => (
										<Collapse.Panel
											key={field.key}
											header={
												<div className="flex items-center justify-between">
													<span className="font-medium">
														Rule #{index + 1}
														<Tag color="blue" className="ml-2">
															Precedence: {form.getFieldValue(['rules', index, 'urspRule', 'precedenceValue']) ?? 'Not set'}
														</Tag>
													</span>
												</div>
											}
											extra={
												<Button
													type="text"
													danger
													size="small"
													icon={<DeleteOutlined />}
													onClick={(e) => {
														e.stopPropagation();
														remove(field.name);
													}}
												>
													Delete
												</Button>
											}
										>
											<RuleEditor fieldName={field.name} form={form} />
										</Collapse.Panel>
									))}
								</Collapse>
								<Button
									type="primary"
									onClick={() => add({
										urspRule: {
											precedenceValue: fields.length,
											trafficDescriptor: [],
											routeSelectionDescriptorList: []
										}
									})}
									block
									icon={<PlusOutlined />}
									className="bg-blue-500 hover:bg-blue-600"
								>
									Add Rule
								</Button>
							</>
						)}
					</Form.List>
				</Card>
			</Form>
		</div>
	);
}

// Rule Editor Component
function RuleEditor({ fieldName, form }: { fieldName: number; form: any }) {
	return (
		<div className="space-y-4">
			{/* Precedence */}
			<Form.Item
				label="Precedence Value"
				name={[fieldName, 'urspRule', 'precedenceValue']}
				tooltip="Lower values have higher priority"
				rules={[{ required: true, message: 'Please enter precedence' }]}
			>
				<InputNumber min={0} max={255} className="w-full" />
			</Form.Item>

			{/* Traffic Descriptors */}
			<Collapse 
				defaultActiveKey={['traffic']} 
				size="small"
				className="mb-3"
				expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
			>
				<Collapse.Panel header={<span className="font-medium">🚦 Traffic Descriptors</span>} key="traffic">
					<Form.List name={[fieldName, 'urspRule', 'trafficDescriptor']}>
						{(fields, { add, remove }) => (
							<>
								{fields.map((field, index) => (
									<Card key={field.key} size="small" className="mb-3" type="inner">
										<Space direction="vertical" className="w-full">
											<div className="flex justify-between items-center">
												<span className="font-medium">Descriptor #{index + 1}</span>
												<Button
													type="text"
													danger
													size="small"
													icon={<DeleteOutlined />}
													onClick={() => remove(field.name)}
												/>
											</div>
											<Form.Item
												label="Type"
												name={[field.name, 'trafficDescriptorType']}
												rules={[{ required: true }]}
											>
												<Select placeholder="Select type">
													<Select.Option value={1}>DNN (1)</Select.Option>
													<Select.Option value={16}>Connection Capabilities (16)</Select.Option>
													<Select.Option value={144}>OS ID + OS App ID (144)</Select.Option>
													<Select.Option value={8}>IP Descriptor (8)</Select.Option>
													<Select.Option value={64}>FQDN (64)</Select.Option>
												</Select>
											</Form.Item>
											<TrafficDescriptorValue 
												fieldName={field.name} 
												form={form}
												ruleIndex={fieldName}
											/>
										</Space>
									</Card>
								))}
								<Button
									type="primary"
									onClick={() => add({ trafficDescriptorType: 1, trafficDescriptorValue: {} })}
									block
									icon={<PlusOutlined />}
									size="small"
									className="bg-blue-500 hover:bg-blue-600"
								>
									Add Traffic Descriptor
								</Button>
							</>
						)}
					</Form.List>
				</Collapse.Panel>
			</Collapse>

			{/* Route Selection Descriptors */}
			<Collapse 
				defaultActiveKey={['route']} 
				size="small"
				expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
			>
				<Collapse.Panel header={<span className="font-medium">🛣️ Route Selection Descriptors</span>} key="route">
					<Form.List name={[fieldName, 'urspRule', 'routeSelectionDescriptorList']}>
						{(fields, { add, remove }) => (
							<>
								{fields.map((field, index) => (
									<Card key={field.key} size="small" className="mb-3" type="inner">
										<div className="flex justify-between items-center mb-3">
											<span className="font-medium">Route #{index + 1}</span>
											<Button
												type="text"
												danger
												size="small"
												icon={<DeleteOutlined />}
												onClick={() => remove(field.name)}
											/>
										</div>
										<RouteSelectionDescriptor 
											fieldName={field.name}
											form={form}
											ruleIndex={fieldName}
										/>
									</Card>
								))}
								<Button
									type="primary"
									onClick={() => add({
										routeSelectionDescriptor: {
											precedenceValue: fields.length,
											routeSelectionDescriptorContents: []
										}
									})}
									block
									icon={<PlusOutlined />}
									size="small"
									className="bg-blue-500 hover:bg-blue-600"
								>
									Add Route
								</Button>
							</>
						)}
					</Form.List>
				</Collapse.Panel>
			</Collapse>
		</div>
	);
}

// Traffic Descriptor Value Editor
function TrafficDescriptorValue({ fieldName, form, ruleIndex }: { fieldName: number; form: any; ruleIndex: number }) {
	const type = form.getFieldValue(['rules', ruleIndex, 'urspRule', 'trafficDescriptor', fieldName, 'trafficDescriptorType']);

	if (type === 1) {
		// DNN
		return (
			<Form.Item
				label="DNN"
				name={[fieldName, 'trafficDescriptorValue', 'dnn']}
				rules={[{ required: true }]}
			>
				<Input placeholder="e.g., internet, ims" />
			</Form.Item>
		);
	}

	if (type === 16 || type === 144) {
		// Connection Capabilities or OS ID
		return (
			<Form.Item
				label="Connection Capabilities"
				name={[fieldName, 'trafficDescriptorValue', 'connectionCapabilities']}
			>
				<Select mode="tags" placeholder="Enter values">
					<Select.Option value={1}>1 - Voice</Select.Option>
					<Select.Option value={2}>2 - SMS</Select.Option>
					<Select.Option value={4}>4 - Data</Select.Option>
					<Select.Option value={8}>8 - Video</Select.Option>
				</Select>
			</Form.Item>
		);
	}

	if (type === 8) {
		// IP Descriptor
		return (
			<Space direction="vertical" className="w-full">
				<Form.Item label="Protocol" name={[fieldName, 'trafficDescriptorValue', 'protocol']}>
					<Select placeholder="Select protocol">
						<Select.Option value={6}>TCP (6)</Select.Option>
						<Select.Option value={17}>UDP (17)</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item label="Port" name={[fieldName, 'trafficDescriptorValue', 'port']}>
					<InputNumber min={1} max={65535} placeholder="e.g., 443, 8883" className="w-full" />
				</Form.Item>
			</Space>
		);
	}

	if (type === 64) {
		// FQDN
		return (
			<Form.Item
				label="FQDN"
				name={[fieldName, 'trafficDescriptorValue', 'fqdn']}
				rules={[{ required: true }]}
			>
				<Input placeholder="e.g., netflix.com" />
			</Form.Item>
		);
	}

	return null;
}

// Route Selection Descriptor Editor
function RouteSelectionDescriptor({ fieldName, form, ruleIndex }: { fieldName: number; form: any; ruleIndex: number }) {
	return (
		<div className="space-y-3">
			<Form.Item
				label="Precedence"
				name={[fieldName, 'routeSelectionDescriptor', 'precedenceValue']}
				rules={[{ required: true }]}
			>
				<InputNumber min={0} max={255} className="w-full" />
			</Form.Item>

			{/* Route Selection Components */}
			<div>
				<Divider orientation="left" plain style={{ fontSize: '13px', margin: '8px 0' }}>
					Route Components
				</Divider>
				<Form.List name={[fieldName, 'routeSelectionDescriptor', 'routeSelectionDescriptorContents']}>
					{(fields, { add, remove }) => (
						<>
							{fields.map((field, index) => (
								<Card key={field.key} size="small" className="mb-2">
									<div className="flex justify-between items-center mb-2">
										<span className="text-xs font-medium">Component #{index + 1}</span>
										<Button
											type="text"
											danger
											size="small"
											icon={<DeleteOutlined />}
											onClick={() => remove(field.name)}
										/>
									</div>
									<RouteComponent 
										fieldName={field.name}
										form={form}
										ruleIndex={ruleIndex}
										routeIndex={fieldName}
									/>
								</Card>
							))}
							<Button
								type="primary"
								onClick={() => add({ routeSelectionComponentType: 1, routeSelectionComponentValue: {} })}
								block
								icon={<PlusOutlined />}
								size="small"
								className="bg-blue-500 hover:bg-blue-600"
							>
								Add Component
							</Button>
						</>
					)}
				</Form.List>
			</div>
		</div>
	);
}

// Route Component Editor
function RouteComponent({ fieldName, form, ruleIndex, routeIndex }: { fieldName: number; form: any; ruleIndex: number; routeIndex: number }) {
	const type = form.getFieldValue([
		'rules', ruleIndex, 'urspRule', 'routeSelectionDescriptorList', routeIndex,
		'routeSelectionDescriptor', 'routeSelectionDescriptorContents', fieldName, 'routeSelectionComponentType'
	]);

	return (
		<Space direction="vertical" className="w-full" size="small">
			<Form.Item
				label="Type"
				name={[fieldName, 'routeSelectionComponentType']}
				rules={[{ required: true }]}
				style={{ marginBottom: 8 }}
			>
				<Select placeholder="Select type" size="small">
					<Select.Option value={1}>S-NSSAI (1)</Select.Option>
					<Select.Option value={2}>DNN (2)</Select.Option>
					<Select.Option value={4}>PDU Session Type (4)</Select.Option>
					<Select.Option value={32}>Access Type (32)</Select.Option>
				</Select>
			</Form.Item>

			{type === 1 && (
				<>
					<Form.Item
						label="SST"
						name={[fieldName, 'routeSelectionComponentValue', 'sst']}
						rules={[{ required: true }]}
						style={{ marginBottom: 8 }}
					>
						<InputNumber min={0} max={255} placeholder="e.g., 1" className="w-full" size="small" />
					</Form.Item>
					<Form.Item
						label="SD (hex)"
						name={[fieldName, 'routeSelectionComponentValue', 'sd']}
						style={{ marginBottom: 8 }}
					>
						<Input placeholder="e.g., 000001" maxLength={6} size="small" />
					</Form.Item>
				</>
			)}

			{type === 2 && (
				<Form.Item
					label="DNN"
					name={[fieldName, 'routeSelectionComponentValue', 'dnn']}
					rules={[{ required: true }]}
					style={{ marginBottom: 8 }}
				>
					<Input placeholder="e.g., internet" size="small" />
				</Form.Item>
			)}

			{type === 4 && (
				<Form.Item
					label="PDU Session Type"
					name={[fieldName, 'routeSelectionComponentValue', 'pduSessionType']}
					rules={[{ required: true }]}
					style={{ marginBottom: 8 }}
				>
					<Select placeholder="Select type" size="small">
						<Select.Option value={1}>IPv4 (1)</Select.Option>
						<Select.Option value={2}>IPv6 (2)</Select.Option>
						<Select.Option value={3}>IPv4v6 (3)</Select.Option>
						<Select.Option value={4}>Unstructured (4)</Select.Option>
						<Select.Option value={5}>Ethernet (5)</Select.Option>
					</Select>
				</Form.Item>
			)}

			{type === 32 && (
				<Form.Item
					label="Access Type"
					name={[fieldName, 'routeSelectionComponentValue', 'accessType']}
					rules={[{ required: true }]}
					style={{ marginBottom: 8 }}
				>
					<Select placeholder="Select type" size="small">
						<Select.Option value={1}>3GPP (1)</Select.Option>
						<Select.Option value={2}>Non-3GPP (2)</Select.Option>
					</Select>
				</Form.Item>
			)}
		</Space>
	);
}
