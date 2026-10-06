import {useState} from 'react';
import type {CSSProperties, ReactNode, MouseEventHandler} from 'react';

import {AutoComplete, Button, Input, Spin} from 'antd';
import type {InputProps} from 'antd';
import {
  AppstoreOutlined, CheckCircleOutlined, CloseOutlined, CloudServerOutlined, CodeOutlined,
  ContainerOutlined, DatabaseOutlined, FileOutlined, FilterOutlined, FolderOutlined,
  LinkOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined, SearchOutlined,
  SettingOutlined, ShareAltOutlined, SplitCellsOutlined, WarningOutlined,
} from '@ant-design/icons';

import {Colors as AppColors, PanelColors} from '@shared/styles/colors';

export {PanelColors};
export const Colors = {...AppColors, backgroundGrey: AppColors.grey3};
export type IconNames = string;

const icons = {
  document: FileOutlined, folder: FolderOutlined, helm: ContainerOutlined, validation: CheckCircleOutlined,
  settings: SettingOutlined, compare: SplitCellsOutlined, terminal: CodeOutlined, image: ContainerOutlined,
  checked: CheckCircleOutlined, warning: WarningOutlined, error: WarningOutlined,
  'split-view': SplitCellsOutlined, 'resource-graph': ShareAltOutlined, link: LinkOutlined,
  incoming: LinkOutlined, outgoing: LinkOutlined, Pod: ContainerOutlined, Deployment: AppstoreOutlined,
  Service: CloudServerOutlined, ConfigMap: FileOutlined, Secret: DatabaseOutlined,
} as const;

export function Icon(props: {
  name: IconNames; color?: string; $color?: string; $transparent?: boolean;
  style?: CSSProperties; className?: string; onMouseEnter?: MouseEventHandler; onMouseLeave?: MouseEventHandler;
}) {
  const Symbol = icons[props.name as keyof typeof icons] || AppstoreOutlined;
  return <span className={props.className} style={{display: 'inline-flex', alignItems: 'center', color: props.$color || props.color, ...props.style}} onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave}><Symbol /></span>;
}

export const IconButton = Button;
export const Spinner = Spin;

export function PaneCloseIcon(props: {isOpen?: boolean; onClick?: () => void; style?: CSSProperties; containerStyle?: CSSProperties; className?: string; type?: string}) {
  return <Button type="text" aria-label={props.isOpen ? 'Close pane' : 'Open pane'} icon={props.isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} onClick={props.onClick} style={{...props.containerStyle, ...props.style}} className={props.className} />;
}

export function TitleBar(props: {
  title: ReactNode; actions?: ReactNode; description?: ReactNode; expandable?: boolean; isOpen?: boolean;
  type?: 'primary' | 'secondary'; descriptionStyle?: CSSProperties; headerStyle?: CSSProperties; onExpand?: () => void;
  style?: CSSProperties; className?: string;
}) {
  return (
    <div className={props.className} style={props.style}>
      <header style={{minHeight: props.type === 'secondary' ? 32 : 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '4px 12px', background: AppColors.grey11, color: AppColors.grey9, ...props.headerStyle}}>
        <div style={{display: 'flex', alignItems: 'center', minWidth: 0, gap: 4}}>
          {props.expandable && <Button type="text" size="small" aria-label="Expand section" aria-expanded={props.isOpen} icon={<PlusOutlined />} onClick={props.onExpand} />}
          <span style={{fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{props.title}</span>
        </div>
        {props.actions && <div style={{display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0}}>{props.actions}</div>}
      </header>
      {props.description && (!props.expandable || props.isOpen) && <div style={{padding: 12, fontSize: 12, ...props.descriptionStyle}}>{props.description}</div>}
    </div>
  );
}

export function TitleBarCount(props: {count: number; isActive?: boolean}) {
  return <span style={{fontSize: 12, color: props.isActive ? AppColors.whitePure : AppColors.grey7}}>{props.count}</span>;
}

export function SearchInput(props: Omit<InputProps, 'onChange'> & {onChange?: (value: string) => void; onSearch?: (value: string) => void}) {
  const {onChange, onSearch, ...inputProps} = props;
  return <Input allowClear prefix={<SearchOutlined />} {...inputProps} onChange={event => onChange?.(event.target.value)} onPressEnter={event => onSearch?.(event.currentTarget.value)} />;
}

export function FilterButton(props: {active?: boolean; iconHighlight?: boolean; disabled?: boolean; onClick?: () => void}) {
  return <Button type="text" size="small" aria-label="Filter resources" aria-pressed={props.active} icon={<FilterOutlined style={{color: props.iconHighlight ? AppColors.cyan : undefined}} />} disabled={props.disabled} onClick={props.onClick} />;
}

export function Filter(props: {
  height?: number; search?: string | null; onSearch?: (value: string) => void; onClear?: () => void;
  active?: boolean; hasActiveFilters?: boolean; onToggle?: () => void; filterButton?: ReactNode; header?: ReactNode; children?: ReactNode;
}) {
  return <div><div style={{display: 'flex', gap: 4, padding: '4px 8px'}}><SearchInput value={props.search || ''} placeholder="Filter resources" onChange={props.onSearch} />{props.filterButton}</div>{props.active && <div style={{maxHeight: props.height, overflowY: 'auto', padding: 8}}>{props.header}{props.children}</div>}</div>;
}

export function FilterHeader(props: {onClear?: () => void; filterActions?: ReactNode}) {
  return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}><Button type="text" size="small" onClick={props.onClear}>Clear</Button>{props.filterActions}</div>;
}

export function FilterField(props: {name: string; children?: ReactNode}) {
  return <div style={{marginBottom: 12}}><label style={{display: 'block', fontSize: 12, marginBottom: 4}}>{props.name}</label>{props.children}</div>;
}

export function KeyValueInput(props: {pair: [string, string]; onDelete: (key: string) => void; onChange: (pair: [string, string]) => void}) {
  return <div style={{display: 'flex', alignItems: 'center', gap: 4, marginTop: 4}}><Input value={props.pair[0]} onChange={event => props.onChange([event.target.value, props.pair[1]])} /><Input value={props.pair[1]} onChange={event => props.onChange([props.pair[0], event.target.value])} /><Button type="text" aria-label="Remove filter" icon={<CloseOutlined />} onClick={() => props.onDelete(props.pair[0])} /></div>;
}

export function NewKeyValueInput(props: {onAddKeyValue: (pair: [string, string]) => void; keyOptions?: {value: string}[]}) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const add = () => {if (!key.trim()) return; props.onAddKeyValue([key, value]); setKey(''); setValue('');};
  return <div style={{display: 'flex', alignItems: 'center', gap: 4}}><AutoComplete options={props.keyOptions} value={key} onChange={setKey} placeholder="Key" style={{flex: 1, minWidth: 0}} /><Input value={value} onChange={event => setValue(event.target.value)} placeholder="Value" onPressEnter={add} /><Button type="text" aria-label="Add filter" icon={<PlusOutlined />} onClick={add} disabled={!key.trim()} /></div>;
}
