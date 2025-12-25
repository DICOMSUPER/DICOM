"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { createEditor, Descendant, Transforms, Editor, Text, Element as SlateElement, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor, RenderElementProps, RenderLeafProps } from "slate-react";
import { withHistory, HistoryEditor } from "slate-history";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight
} from "lucide-react";

interface RichTextEditorProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
    minHeight?: string;
}

type CustomElement = {
    type: 'paragraph' | 'bulleted-list' | 'numbered-list' | 'list-item';
    align?: 'left' | 'center' | 'right';
    children: CustomText[];
};

type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
};

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Enter content...",
    minHeight = "200px",
}) => {
    const [editorKey, setEditorKey] = useState(0);
    const editor = useMemo(() => withHistory(withReact(createEditor())), [editorKey]);

    const initialValue: Descendant[] = useMemo(() => {
        if (!value || value.trim() === "") {
            return [{ type: "paragraph", children: [{ text: "" }] }];
        }
        return value.split("\n").map(line => ({
            type: "paragraph",
            children: [{ text: line }]
        }));
    }, [value, editorKey]);

    // Track if the last change came from inside the editor
    const isInternalChangeRef = React.useRef(false);

    // ⛔ Slate không tự update khi value từ parent đổi
    // 🔥 Fix: reset nội dung mỗi khi value thay đổi từ ngoài (không phải từ typing)
    useEffect(() => {
        // Skip if the change came from internal typing
        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false;
            return;
        }

        const parsed = value?.split("\n") || [""];
        const newSlateValue: Descendant[] = parsed.map(line => ({
            type: "paragraph",
            children: [{ text: line }],
        }));

        // Only reset if content is actually different
        const currentText = editor.children
            .map(n => ('children' in n ? n.children.map((c: any) => c.text || "").join("") : ""))
            .join("\n");

        if (currentText !== value) {
            editor.children = newSlateValue;
            Transforms.deselect(editor);
            editor.onChange();
        }
    }, [value, editor]);

    const renderElement = useCallback((props: RenderElementProps) => {
        const { attributes, children, element } = props;
        const style = { textAlign: element.align || "left" };

        switch (element.type) {
            case "bulleted-list":
                return <ul className="list-disc ml-6 my-2" {...attributes}>{children}</ul>;
            case "numbered-list":
                return <ol className="list-decimal ml-6 my-2" {...attributes}>{children}</ol>;
            case "list-item":
                return <li className="my-1" {...attributes}>{children}</li>;
            default:
                return <p style={style} className="my-1" {...attributes}>{children}</p>;
        }
    }, []);

    const renderLeaf = useCallback((props: RenderLeafProps) => {
        let { attributes, children, leaf } = props;
        if (leaf.bold) children = <strong>{children}</strong>;
        if (leaf.italic) children = <em>{children}</em>;
        if (leaf.underline) children = <u>{children}</u>;
        return <span {...attributes}>{children}</span>;
    }, []);

    const handleChange = (val: Descendant[]) => {
        const isAstChange = editor.operations.some(op => op.type !== "set_selection");
        if (!isAstChange) return;

        const text = val
            .map(n => ('children' in n ? n.children.map((c: any) => c.text || "").join("") : ""))
            .join("\n");

        // Mark this as an internal change so useEffect doesn't reset the editor
        isInternalChangeRef.current = true;
        onChange(text);
    };

    const isMarkActive = (format: string) => {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    };

    const isBlockActive = (format: string) => {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
            })
        );
        return !!match;
    };

    const toggleMark = (format: string) => {
        const isActive = isMarkActive(format);
        isActive ? Editor.removeMark(editor, format) : Editor.addMark(editor, format, true);
    };

    const toggleBlock = (format: string) => {
        const isActive = isBlockActive(format);
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
            split: true,
        });

        const newProperties: Partial<SlateElement> = {
            type: isActive ? "paragraph" : isList ? "list-item" : format,
        };

        Transforms.setNodes(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    };

    const toggleAlign = (align: string) => {
        Transforms.setNodes(editor, { align }, { match: n => Editor.isBlock(editor, n) });
    };

    const ToolbarButton = ({ active, onToggle, icon: Icon, tooltip }: any) => (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onToggle();
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${active ? "bg-blue-100 text-blue-600" : "text-gray-700"}`}
            title={tooltip}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                    <ToolbarButton active={isMarkActive("bold")} onToggle={() => toggleMark("bold")} icon={Bold} tooltip="Bold (Ctrl+B)" />
                    <ToolbarButton active={isMarkActive("italic")} onToggle={() => toggleMark("italic")} icon={Italic} tooltip="Italic (Ctrl+I)" />
                    <ToolbarButton active={isMarkActive("underline")} onToggle={() => toggleMark("underline")} icon={Underline} tooltip="Underline (Ctrl+U)" />
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                    <ToolbarButton active={isBlockActive("bulleted-list")} onToggle={() => toggleBlock("bulleted-list")} icon={List} tooltip="Bullet List" />
                    <ToolbarButton active={isBlockActive("numbered-list")} onToggle={() => toggleBlock("numbered-list")} icon={ListOrdered} tooltip="Numbered List" />
                </div>

                <div className="flex items-center gap-1">
                    <ToolbarButton active={false} onToggle={() => toggleAlign("left")} icon={AlignLeft} tooltip="Align Left" />
                    <ToolbarButton active={false} onToggle={() => toggleAlign("center")} icon={AlignCenter} tooltip="Align Center" />
                    <ToolbarButton active={false} onToggle={() => toggleAlign("right")} icon={AlignRight} tooltip="Align Right" />
                </div>
            </div>

            <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder}
                    className="p-4 outline-none"
                    style={{
                        minHeight,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: "14px",
                        lineHeight: "1.6",
                    }}
                />
            </Slate>
        </div>
    );
};

export default RichTextEditor;
