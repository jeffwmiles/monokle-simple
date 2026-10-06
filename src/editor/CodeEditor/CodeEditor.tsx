import {memo, useEffect} from 'react';
import {useEffectOnce, useMeasure} from 'react-use';

import 'monaco-yaml';
import '../monacoWorkers';

import {useAppDispatch} from '@redux/hooks';

import {editorMounted, editorUnmounted} from '@editor/editor.slice';

import {getEditor, mountEditor, unmountEditor} from '../editor.instance';
import * as S from './CodeEditor.styled';
import './handleCodeChanges';

type CodeEditorProps = {
  type: 'local' | 'cluster';
};

const CodeEditor = (props: CodeEditorProps) => {
  const {type} = props;
  const dispatch = useAppDispatch();
  const [containerRef, dimensions] = useMeasure<HTMLDivElement>();

  useEffectOnce(() => {
    mountEditor({element: document.getElementById('monokle-monaco')!, type});
    dispatch(editorMounted());
    return () => {
      dispatch(editorUnmounted());
      unmountEditor();
    };
  });

  useEffect(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.layout(dimensions);
  }, [dimensions]);

  return (
    <S.MonacoContainer ref={containerRef}>
      <div id="monokle-monaco" />
    </S.MonacoContainer>
  );
};

export default memo(CodeEditor);
