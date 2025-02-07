import React, {
  useEffect,
  useState,
  useImperativeHandle,
} from 'react';

import pkg from '../package.json';
import { Editor, EditorRef, EmailEditorProps } from './types';
import { loadScript } from './loadScript';


export const EmailEditor = React.forwardRef<EditorRef, EmailEditorProps>(
  (props, ref) => {
    const { onLoad, onReady, scriptUrl, minHeight = 500, style = {} } = props;

    const [editor, setEditor] = useState<Editor | null>(null);

    const [editorId, setEditorId] = useState<string | undefined>(undefined);

    const [hasLoadedEmbedScript, setHasLoadedEmbedScript] = useState(false);



    // const editorId = useMemo(
    //   () => props.editorId || `editor-${++window.__unlayer_lastEditorId}`,
    //   [props.editorId]
    // );
    //
    useEffect(() => {
        window.__unlayer_lastEditorId = window.__unlayer_lastEditorId || 0;
        setEditorId(props.editorId || `editor-${++window.__unlayer_lastEditorId}`)
    }, [props.editorId])

    useImperativeHandle(
      ref,
      () => ({
        editor,
      }),
      [editor]
    );

    useEffect(() => {
      return () => {
        editor?.destroy();
      };
    }, []);

    useEffect(() => {
      setHasLoadedEmbedScript(false);
      loadScript(() => setHasLoadedEmbedScript(true), scriptUrl);
    }, [scriptUrl]);

    useEffect(() => {
      if (!hasLoadedEmbedScript || !editorId) return;
        const options: EmailEditorProps['options'] = {
            ...(props.options || {}),
            appearance: props.appearance ?? props.options?.appearance,
            displayMode: props?.displayMode || props.options?.displayMode || 'email',
            locale: props.locale ?? props.options?.locale,
            projectId: props.projectId ?? props.options?.projectId,
            tools: props.tools ?? props.options?.tools,

            id: editorId,
            source: {
                name: pkg.name,
                version: pkg.version,
            },
        };
      editor?.destroy();
      setEditor(unlayer.createEditor(options));
    }, [JSON.stringify(props?.options), hasLoadedEmbedScript, editorId]);

    const methodProps = Object.keys(props).filter((propName) =>
      /^on/.test(propName)
    );
    useEffect(() => {
      if (!editor) return;

      onLoad?.(editor);

      // All properties starting with on[Name] are registered as event listeners.
      methodProps.forEach((methodProp) => {
        if (
          /^on/.test(methodProp) &&
          methodProp !== 'onLoad' &&
          methodProp !== 'onReady' &&
          typeof props[methodProp] === 'function'
        ) {
          editor.addEventListener(methodProp, props[methodProp]);
        }
      });

      if (onReady) {
        editor.addEventListener('editor:ready', () => {
          onReady(editor);
        });
      }
    }, [editor, Object.keys(methodProps).join(',')]);

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: minHeight,
        }}
      >
        <div id={editorId} style={{ ...style, flex: 1 }} />
      </div>
    );
  }
);
