import {useState} from 'react';
import type {ReactNode} from 'react';

import {Button, Modal} from 'antd';

export function LearnPage(props: {children?: ReactNode; onHelpfulResourceCardClick?: (topic: string) => void}) {
  return <div style={{padding: 24}}><div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16}}>{props.children}</div><div style={{display: 'flex', gap: 12, marginTop: 24}}>{['documentation', 'discord', 'video-tutorial'].map(topic => <Button key={topic} type="link" onClick={() => props.onHelpfulResourceCardClick?.(topic)}>{topic}</Button>)}</div></div>;
}

export function LearnCard(props: {title: string; description: string; icon?: ReactNode; onClick?: () => void}) {
  return <button type="button" onClick={props.onClick} style={{textAlign: 'left', padding: 20, border: '1px solid #434343', borderRadius: 4, background: '#191F21', color: '#DBDBDB', cursor: 'pointer'}}><div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 16}}>{props.icon}<strong>{props.title}</strong></div><p style={{fontSize: 13, lineHeight: 1.5}}>{props.description}</p></button>;
}

export function WalkThrough(props: {dismissWalkThrough: () => void; topic: string; children?: ReactNode}) {
  return <Modal open title={props.topic} onCancel={props.dismissWalkThrough} footer={null} width={760}>{props.children}</Modal>;
}

function Card(props: {heading: string; onFinish: () => void; items: ReactNode[]; mediaItems?: {index: number; src: string}[]}) {
  const [step, setStep] = useState(0);
  const media = props.mediaItems?.find(item => item.index === step);
  return <div><h3>{props.heading}</h3>{media && <img src={media.src} alt={`${props.heading} ${step + 1}`} style={{width: '100%', aspectRatio: '16 / 9', objectFit: 'contain', maxHeight: 300}} />}<div style={{minHeight: 150}}>{props.items[step]}</div><div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16}}><Button onClick={() => setStep(value => value - 1)} disabled={!step}>Back</Button><span>{step + 1} / {props.items.length}</span><Button type="primary" onClick={() => step + 1 < props.items.length ? setStep(value => value + 1) : props.onFinish()}>{step + 1 < props.items.length ? 'Next' : 'Finish'}</Button></div></div>;
}

export const WalkThroughCard = Object.assign(Card, {
  Slice: (props: {children?: ReactNode}) => <section>{props.children}</section>,
  SubHeading: (props: {children?: ReactNode}) => <h4>{props.children}</h4>,
  Text: (props: {children?: ReactNode; $bold?: boolean}) => <span style={{fontWeight: props.$bold ? 600 : undefined, lineHeight: 1.6}}>{props.children}</span>,
});
