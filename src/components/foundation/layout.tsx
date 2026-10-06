import type {CSSProperties, ReactNode} from 'react';

import {Button, Tooltip} from 'antd';
import {CloseOutlined} from '@ant-design/icons';
import {Allotment} from 'allotment';

export type ActivityType<Name extends string> = {
  type: 'panel' | 'fullscreen';
  name: Name;
  tooltip: ReactNode;
  icon: () => ReactNode;
  component: ReactNode;
  useBadge: () => {count?: number; size?: string} | undefined;
  isVisible?: () => boolean;
};

type ActivityButtonProps<Name extends string> = {
  activity: ActivityType<Name>;
  selected?: Name;
  onChange: (name: Name) => void;
};

function ActivityButton<Name extends string>({activity, selected, onChange}: ActivityButtonProps<Name>) {
  const visible = activity.isVisible?.() ?? true;
  const badge = activity.useBadge();
  const ActivityIcon = activity.icon;
  if (!visible) return null;
  return (
    <Tooltip title={activity.tooltip} placement="right">
      <button
        type="button"
        aria-label={activity.name}
        aria-pressed={selected === activity.name}
        onClick={() => onChange(activity.name)}
        style={{position: 'relative', width: 48, height: 44, border: 0, borderLeft: selected === activity.name ? '2px solid #58D1C9' : '2px solid transparent', background: 'transparent', color: selected === activity.name ? '#fff' : '#93989C', cursor: 'pointer'}}
      >
        <ActivityIcon />
        {Boolean(badge?.count) && <span style={{position: 'absolute', right: 3, top: 2, fontSize: 10}}>{badge?.count}</span>}
      </button>
    </Tooltip>
  );
}

export function ActivityBar<Name extends string, ExtraName extends string>(props: {
  activities: ActivityType<Name>[];
  extraActivities: ActivityType<ExtraName>[];
  value?: Name;
  extraValue?: ExtraName;
  onChange: (name: Name) => void;
  onChangeExtra: (name: ExtraName) => void;
  isActive?: boolean;
  style?: CSSProperties;
}) {
  return (
    <aside style={{width: 48, height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #303030', ...props.style}}>
      {props.activities.map(activity => <ActivityButton key={activity.name} activity={activity} selected={props.value} onChange={props.onChange} />)}
      <div style={{marginTop: 'auto'}}>
        {props.extraActivities.map(activity => <ActivityButton key={activity.name} activity={activity} selected={props.extraValue} onChange={props.onChangeExtra} />)}
      </div>
    </aside>
  );
}

type ResizableColumnsProps = {
  left?: ReactNode;
  middle?: ReactNode;
  right?: ReactNode;
  isLeftActive?: boolean;
  leftClosable?: boolean;
  onCloseLeftPane?: () => void;
  defaultSizes?: number[];
  onDragEnd?: (sizes: number[]) => void;
  paneCloseIconStyle?: CSSProperties;
};

export function ResizableColumnsPanel(props: ResizableColumnsProps) {
  return (
    <div style={{height: '100%', width: '100%', position: 'relative'}}>
    <Allotment defaultSizes={props.defaultSizes} onDragEnd={props.onDragEnd}>
      <Allotment.Pane visible={Boolean(props.left) && props.isLeftActive !== false} minSize={180}>
        {props.left}
        {props.leftClosable && <Tooltip title="Close pane"><Button type="text" aria-label="Close pane" icon={<CloseOutlined />} onClick={props.onCloseLeftPane} style={{position: 'absolute', top: 4, right: 4, zIndex: 2, ...props.paneCloseIconStyle}} /></Tooltip>}
      </Allotment.Pane>
      <Allotment.Pane visible={Boolean(props.middle)} minSize={180}>{props.middle}</Allotment.Pane>
      <Allotment.Pane visible={Boolean(props.right)} minSize={260}>{props.right}</Allotment.Pane>
    </Allotment>
    </div>
  );
}

export function ResizableRowsPanel(props: {
  top: ReactNode;
  bottom: ReactNode;
  defaultSizes?: number[];
  isBottomVisible?: boolean;
  onDragEnd?: (sizes: number[]) => void;
}) {
  return (
    <div style={{height: '100%', width: '100%', position: 'relative'}}>
    <Allotment vertical defaultSizes={props.defaultSizes} onDragEnd={props.onDragEnd}>
      <Allotment.Pane minSize={200}>{props.top}</Allotment.Pane>
      <Allotment.Pane visible={props.isBottomVisible} minSize={100}>{props.bottom}</Allotment.Pane>
    </Allotment>
    </div>
  );
}
