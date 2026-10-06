import {useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';

import {Button, Empty, Input, List, Popover, Select, Spin, Tag} from 'antd';
import {CheckCircleOutlined, DownloadOutlined, SettingOutlined, WarningOutlined} from '@ant-design/icons';

import type {ValidationResponse, ValidationResult} from '@monokle/validation';

export type ValidationFiltersValueType = {'tool-component'?: string[]; type?: 'error' | 'warning'};

export function ProblemIcon(props: {level: string; style?: CSSProperties; className?: string}) {
  const Symbol = props.level === 'none' ? CheckCircleOutlined : WarningOutlined;
  return <Symbol className={props.className} style={{color: props.level === 'error' || props.level === 'both' ? '#E84749' : props.level === 'warning' ? '#E8B339' : '#09b89d', ...props.style}} />;
}

export function ValidationPopover(props: {
  level: string; results: ValidationResult[]; disabled?: boolean; popoverIconStyle?: CSSProperties;
  popoverRenderItem?: ReactNode; style?: CSSProperties; onMessageClickHandler?: (result: ValidationResult) => void;
  title?: ReactNode; hideEmptyPopover?: boolean;
}) {
  if (props.hideEmptyPopover && !props.results.length) return null;
  const content = <List size="small" dataSource={props.results} renderItem={result => <List.Item><Button type="link" style={{whiteSpace: 'normal', height: 'auto', textAlign: 'left'}} onClick={() => props.onMessageClickHandler?.(result)}>{result.message?.text || result.ruleId}</Button></List.Item>} />;
  return <Popover title={props.title || 'Validation'} content={content} trigger={props.disabled ? [] : ['hover', 'click']}><span style={props.style}><ProblemIcon level={props.level} style={props.popoverIconStyle} /></span></Popover>;
}

export function ProblemInfo(props: {
  problem: ValidationResult;
  rule: {name?: string; id?: string; shortDescription?: {text?: string}; fullDescription?: {text?: string}; helpUri?: string};
  onHelpURLClick?: (url: string) => void; onSettingsClick?: () => void;
}) {
  return <section style={{padding: 16, borderTop: '1px solid #303030'}}><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><ProblemIcon level={props.problem.level || 'warning'} /><strong>{props.rule.shortDescription?.text || props.rule.name || props.rule.id}</strong><Button type="text" aria-label="Validation settings" icon={<SettingOutlined />} onClick={props.onSettingsClick} /></div><p>{props.problem.message?.text}</p>{props.rule.fullDescription?.text && <p>{props.rule.fullDescription.text}</p>}{props.rule.helpUri && <Button type="link" onClick={() => props.onHelpURLClick?.(props.rule.helpUri!)}>Documentation</Button>}</section>;
}

export function ValidationOverview(props: {
  status: string; validationResponse: ValidationResponse; activePlugins?: string[]; containerStyle?: CSSProperties;
  containerClassName?: string; filters?: ValidationFiltersValueType; height?: number; selectedProblem?: ValidationResult;
  groupOnlyByResource?: boolean; newProblemsIntroducedType?: string; skeletonStyle?: CSSProperties;
  onProblemSelect?: (payload: {problem: ValidationResult; selectedFrom: 'resource' | 'file'}) => void;
  onFiltersChange?: (filters: ValidationFiltersValueType) => void;
  triggerValidationSettingsRedirectCallback?: () => void; downloadSarifResponseCallback?: () => void;
}) {
  const [search, setSearch] = useState('');
  const results = props.validationResponse.runs.flatMap(run => run.results || []).filter(result => {
    if (props.filters?.type && result.level !== props.filters.type) return false;
    if (props.filters?.['tool-component']?.length && !props.filters['tool-component'].some(plugin => result.ruleId?.startsWith(`${plugin}/`))) return false;
    return !search.trim() || `${result.message?.text || ''} ${result.ruleId || ''}`.toLowerCase().includes(search.toLowerCase());
  });
  return <section className={props.containerClassName} style={{...props.containerStyle, height: props.height, display: 'flex', flexDirection: 'column', minHeight: 0}}><div style={{display: 'flex', gap: 6, padding: 8}}><Input allowClear placeholder="Search problems" value={search} onChange={event => setSearch(event.target.value)} /><Select allowClear placeholder="Severity" value={props.filters?.type} options={[{label: 'Error', value: 'error'}, {label: 'Warning', value: 'warning'}]} onChange={type => props.onFiltersChange?.({...props.filters, type})} style={{minWidth: 110}} /><Button type="text" aria-label="Download SARIF" icon={<DownloadOutlined />} onClick={props.downloadSarifResponseCallback} /><Button type="text" aria-label="Validation settings" icon={<SettingOutlined />} onClick={props.triggerValidationSettingsRedirectCallback} /></div><Select mode="multiple" allowClear placeholder="Validation plugins" value={props.filters?.['tool-component']} options={props.activePlugins?.map(plugin => ({label: plugin, value: plugin}))} onChange={plugins => props.onFiltersChange?.({...props.filters, 'tool-component': plugins})} style={{margin: '0 8px 8px'}} />{props.status === 'loading' ? <Spin style={{margin: 16}} /> : <List style={{overflowY: 'auto', flex: 1}} size="small" dataSource={results} locale={{emptyText: <Empty description="No validation problems" />}} renderItem={problem => <List.Item style={{cursor: 'pointer', padding: '8px 12px', background: props.selectedProblem === problem ? '#113536' : undefined}} onClick={() => props.onProblemSelect?.({problem, selectedFrom: problem.locations?.[0]?.physicalLocation ? 'file' : 'resource'})}><div style={{display: 'flex', alignItems: 'flex-start', gap: 8}}><ProblemIcon level={problem.level || 'warning'} /><div><div>{problem.message?.text}</div><Tag style={{marginTop: 4}}>{problem.ruleId}</Tag></div></div></List.Item>} />}</section>;
}
