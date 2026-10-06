import {useEffect, useRef} from 'react';

import Editor, {DiffEditor, loader} from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

loader.config({monaco});

export {monaco};

type CommonProps = {
  width?: number | string; height?: number | string; language?: string; theme?: string; className?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  editorWillMount?: (api: typeof monaco) => void;
};

type EditorProps = CommonProps & {
  value?: string; defaultValue?: string;
  overrideServices?: monaco.editor.IEditorOverrideServices;
  onChange?: (value: string, event: monaco.editor.IModelContentChangedEvent) => void;
  editorDidMount?: (editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) => void;
  editorWillUnmount?: (editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) => void;
};

export default function MonacoEditor(props: EditorProps) {
  const instance = useRef<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);
  const callbacks = useRef(props);
  callbacks.current = props;
  useEffect(() => () => {if (instance.current) callbacks.current.editorWillUnmount?.(instance.current, monaco);}, []);
  return <Editor width={props.width || '100%'} height={props.height || '100%'} language={props.language || 'yaml'} theme={props.theme} className={props.className} value={props.value} defaultValue={props.defaultValue} options={props.options} overrideServices={props.overrideServices} beforeMount={props.editorWillMount} onMount={editor => {instance.current = editor; callbacks.current.editorDidMount?.(editor, monaco);}} onChange={(value, event) => {if (value !== undefined) callbacks.current.onChange?.(value, event);}} />;
}

export function MonacoDiffEditor(props: CommonProps & {
  original?: string; value?: string; modified?: string;
  options?: monaco.editor.IDiffEditorConstructionOptions;
  editorDidMount?: (editor: monaco.editor.IStandaloneDiffEditor, api: typeof monaco) => void;
  editorWillUnmount?: (editor: monaco.editor.IStandaloneDiffEditor, api: typeof monaco) => void;
  onChange?: (value: string, event: monaco.editor.IModelContentChangedEvent) => void;
}) {
  const instance = useRef<monaco.editor.IStandaloneDiffEditor | undefined>(undefined);
  const subscription = useRef<monaco.IDisposable | undefined>(undefined);
  const callbacks = useRef(props);
  callbacks.current = props;
  useEffect(() => () => {subscription.current?.dispose(); if (instance.current) callbacks.current.editorWillUnmount?.(instance.current, monaco);}, []);
  return <DiffEditor width={props.width || '100%'} height={props.height || '100%'} language={props.language || 'yaml'} theme={props.theme} className={props.className} original={props.original || ''} modified={props.value ?? props.modified ?? ''} options={props.options} beforeMount={props.editorWillMount} onMount={editor => {instance.current = editor; callbacks.current.editorDidMount?.(editor, monaco); subscription.current?.dispose(); subscription.current = editor.getModifiedEditor().onDidChangeModelContent(event => callbacks.current.onChange?.(editor.getModifiedEditor().getValue(), event));}} />;
}
