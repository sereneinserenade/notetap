/* eslint-disable */
import { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useState } from "react";
import "tippy.js/animations/shift-toward-subtle.css";
// import applyDevTools from "prosemirror-dev-tools";

import { getExtensions } from "./extensions";
import { CustomBubbleMenu, LinkBubbleMenu } from "./menus";
import { content } from "./mocks";

import "./styles/tiptap.scss";

export const Tiptap = () => {
  const logContent = useCallback(
    (e: Editor) => console.log(JSON.stringify(e.getJSON())),
    []
  );

  const [isAddingNewLink, setIsAddingNewLink] = useState(false);

  const openLinkModal = () => setIsAddingNewLink(true);

  const closeLinkModal = () => setIsAddingNewLink(false);

  const addImage = () =>
    editor?.commands.setMedia({
      src: "https://source.unsplash.com/8xznAGy4HcY/800x400",
      "media-type": "img",
      alt: "Something else",
      title: "Something",
      width: "800",
      height: "400",
    });

  const videoUrl =
    "https://user-images.githubusercontent.com/45892659/178123048-0257e732-8cc2-466b-8447-1e2b7cd1b5d9.mov";

  const addVideo = () =>
    editor?.commands.setMedia({
      src: videoUrl,
      "media-type": "video",
      alt: "Some Video",
      title: "Some Title Video",
      width: "400",
      height: "400",
    });

  const addFile = () =>
    editor?.commands.setFile({
      title: `File no ${Math.floor(Math.random() * 100)}`,
      file: {
        src: "https://source.unsplash.com/8xznAGy4HcY/800x400",
      },
    });

  const editor = useEditor({
    extensions: getExtensions({ openLinkModal }),
    content,
    editorProps: {
      attributes: {
        class: "prose focus:outline-none w-full",
        spellcheck: "false",
      },
    },
    onUpdate({ editor: e }) {
      logContent(e);
    },
  });

  return (
    editor && (
      <section className="flex flex-col gap-2">
        <span className="flex gap-2">
          <button
            className="btn btn-sm btn-outline"
            type="button"
            onClick={() => addImage()}
          >
            Add Image
          </button>
          <button
            className="btn btn-sm btn-outline"
            type="button"
            onClick={() => addVideo()}
          >
            Add Video
          </button>
          <button
            className="btn btn-sm btn-outline"
            type="button"
            onClick={() => addFile()}
          >
            Add File
          </button>
        </span>

        <EditorContent className="w-full" editor={editor} />

        <CustomBubbleMenu editor={editor} />

        <LinkBubbleMenu editor={editor} />
      </section>
    )
  );
};
