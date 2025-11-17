"use client";

import React, { useCallback, useMemo, useState } from "react";
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
    placeholder = "Nhập nội dung...",
    minHeight = "200px",
}) => {
    const [key, setKey] = useState(0);
    const editor = useMemo(() => withHistory(withReact(createEditor())), [key]);

    const initialValue: Descendant[] = useMemo(() => {
        if (!value || value.trim() === "") {
            return [{
                type: "paragraph",
                children: [{ text: "" }]
            } as CustomElement];
        }

        const lines = value.split("\n");
        return lines.map(line => ({
            type: "paragraph",
            children: [{ text: line }]
        } as CustomElement));
    }, [value, key]);

    const renderElement = useCallback((props: RenderElementProps) => {
        const { attributes, children, element } = props;
        const style = { textAlign: (element as any).align || "left" } as React.CSSProperties;

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

        if ((leaf as any).bold) {
            children = <strong>{children}</strong>;
        }
        if ((leaf as any).italic) {
            children = <em>{children}</em>;
        }
        if ((leaf as any).underline) {
            children = <u>{children}</u>;
        }

        return <span {...attributes}>{children}</span>;
    }, []);

    const handleChange = (val: Descendant[]) => {
        const isAstChange = editor.operations.some(
            op => 'set_selection' !== op.type
        );
        if (isAstChange) {
            const text = val.map(n => {
                if ('children' in n) {
                    return n.children.map((child: any) => child.text || '').join('');
                }
                return '';
            }).join("\n");
            onChange(text);
        }
    };

    const isMarkActive = (format: string) => {
        const marks = Editor.marks(editor) as any;
        return marks ? marks[format] === true : false;
    };

    const isBlockActive = (format: string) => {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    (n as any).type === format,
            })
        );

        return !!match;
    };

    const toggleMark = (format: string) => {
        const isActive = isMarkActive(format);

        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    };

    const toggleBlock = (format: string) => {
        const isActive = isBlockActive(format);
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes((n as any).type),
            split: true,
        });

        let newProperties: Partial<SlateElement>;
        if (isActive) {
            newProperties = {
                type: 'paragraph',
            } as any;
        } else if (isList) {
            newProperties = {
                type: 'list-item',
            } as any;
        } else {
            newProperties = {
                type: format,
            } as any;
        }

        Transforms.setNodes<SlateElement>(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block as any);
        }
    };

    const toggleAlign = (align: string) => {
        Transforms.setNodes(
            editor,
            { align } as any,
            { match: n => Editor.isBlock(editor, n) }
        );
    };

    const ToolbarButton = ({
        active,
        onToggle,
        icon: Icon,
        tooltip
    }: {
        active: boolean;
        onToggle: () => void;
        icon: any;
        tooltip: string;
    }) => (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onToggle();
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${active ? "bg-blue-100 text-blue-600" : "text-gray-700"
                }`}
            title={tooltip}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                    <ToolbarButton
                        active={isMarkActive("bold")}
                        onToggle={() => toggleMark("bold")}
                        icon={Bold}
                        tooltip="Bold (Ctrl+B)"
                    />
                    <ToolbarButton
                        active={isMarkActive("italic")}
                        onToggle={() => toggleMark("italic")}
                        icon={Italic}
                        tooltip="Italic (Ctrl+I)"
                    />
                    <ToolbarButton
                        active={isMarkActive("underline")}
                        onToggle={() => toggleMark("underline")}
                        icon={Underline}
                        tooltip="Underline (Ctrl+U)"
                    />
                </div>

                <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                    <ToolbarButton
                        active={isBlockActive("bulleted-list")}
                        onToggle={() => toggleBlock("bulleted-list")}
                        icon={List}
                        tooltip="Bullet List"
                    />
                    <ToolbarButton
                        active={isBlockActive("numbered-list")}
                        onToggle={() => toggleBlock("numbered-list")}
                        icon={ListOrdered}
                        tooltip="Numbered List"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <ToolbarButton
                        active={false}
                        onToggle={() => toggleAlign("left")}
                        icon={AlignLeft}
                        tooltip="Align Left"
                    />
                    <ToolbarButton
                        active={false}
                        onToggle={() => toggleAlign("center")}
                        icon={AlignCenter}
                        tooltip="Align Center"
                    />
                    <ToolbarButton
                        active={false}
                        onToggle={() => toggleAlign("right")}
                        icon={AlignRight}
                        tooltip="Align Right"
                    />
                </div>
            </div>

            {/* Editor */}
            <Slate
                editor={editor}
                initialValue={initialValue}
                onChange={handleChange}
            >
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder}
                    className="p-4 outline-none"
                    style={{
                        minHeight: minHeight,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        fontSize: "14px",
                        lineHeight: "1.6",
                    }}
                    onKeyDown={(event) => {
                        if (!event.ctrlKey && !event.metaKey) return;

                        switch (event.key) {
                            case "b": {
                                event.preventDefault();
                                toggleMark("bold");
                                break;
                            }
                            case "i": {
                                event.preventDefault();
                                toggleMark("italic");
                                break;
                            }
                            case "u": {
                                event.preventDefault();
                                toggleMark("underline");
                                break;
                            }
                        }
                    }}
                />
            </Slate>
        </div>
    );
};

export default RichTextEditor;