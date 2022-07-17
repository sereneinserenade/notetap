/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";

import { resizableMediaActions } from "./resizableMediaMenuUtil";

import "./styles.scss";

// ! had to manage this state outside of the component because `useState` isn't fast enough and creates problem cause
// ! the function is getting old data even though new data is set by `useState` before the execution of function
let lastClientX: number;

export const ResizableMediaNodeView = ({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) => {
  const [mediaType, setMediaType] = useState<"img" | "video">();

  useEffect(() => {
    setMediaType(node.attrs["media-type"]);
  }, [node.attrs]);

  const [aspectRatio, setAspectRatio] = useState(0);

  const [proseMirrorContainerWidth, setProseMirrorContainerWidth] = useState(0);

  const [mediaActionActiveState, setMediaActionActiveState] = useState<
    Record<string, boolean>
  >({});

  const resizableImgRef = useRef<HTMLImageElement | HTMLVideoElement | null>(
    null
  );

  const calculateMediaActionActiveStates = () => {
    const activeStates: Record<string, boolean> = {};

    resizableMediaActions.forEach(({ tooltip, isActive }) => {
      activeStates[tooltip] = !!isActive?.(node.attrs);
    });

    setMediaActionActiveState(activeStates);
  };

  useEffect(() => {
    calculateMediaActionActiveStates();
  }, [node.attrs]);

  const mediaSetupOnLoad = () => {
    // ! TODO: move this to extension storage
    const proseMirrorContainerDiv = document.querySelector(".ProseMirror");

    if (proseMirrorContainerDiv)
      setProseMirrorContainerWidth(proseMirrorContainerDiv?.clientWidth);

    // When the media has loaded
    if (!resizableImgRef.current) return;

    if (mediaType === "video") {
      const video = resizableImgRef.current as HTMLVideoElement;

      video.addEventListener("loadeddata", function () {
        // Aspect Ratio from its original size
        setAspectRatio(video.videoWidth / video.videoHeight);

        // for the first time when video is added with custom width and height
        // and we have to adjust the video height according to it's width
        onHorizontalResize("left", 0);
      });
    } else {
      resizableImgRef.current.onload = () => {
        // Aspect Ratio from its original size
        setAspectRatio(
          (resizableImgRef.current as HTMLImageElement).naturalWidth /
            (resizableImgRef.current as HTMLImageElement).naturalHeight
        );
      };
    }

    setTimeout(() => calculateMediaActionActiveStates(), 200);
  };

  const setLastClientX = (x: number) => {
    lastClientX = x;
  };

  useEffect(() => {
    mediaSetupOnLoad();
  });

  const [isHorizontalResizeActive, setIsHorizontalResizeActive] =
    useState(false);

  interface WidthAndHeight {
    width: number;
    height: number;
  }

  const limitWidthOrHeightToFiftyPixels = ({ width, height }: WidthAndHeight) =>
    width < 100 || height < 100;

  const documentHorizontalMouseMove = (e: MouseEvent) => {
    setTimeout(() => onHorizontalMouseMove(e));
  };

  const startHorizontalResize = (e: { clientX: number }) => {
    setIsHorizontalResizeActive(true);
    lastClientX = e.clientX;

    setTimeout(() => {
      document.addEventListener("mousemove", documentHorizontalMouseMove);
      document.addEventListener("mouseup", stopHorizontalResize);
    });
  };

  const stopHorizontalResize = () => {
    setIsHorizontalResizeActive(false);
    lastClientX = -1;

    document.removeEventListener("mousemove", documentHorizontalMouseMove);
    document.removeEventListener("mouseup", stopHorizontalResize);
  };

  const onHorizontalResize = (
    directionOfMouseMove: "right" | "left",
    diff: number
  ) => {
    if (!resizableImgRef.current) {
      console.error("Media ref is undefined|null", {
        resizableImg: resizableImgRef.current,
      });
      return;
    }

    const currentMediaDimensions = {
      width: resizableImgRef.current?.width,
      height: resizableImgRef.current?.height,
    };

    const newMediaDimensions = {
      width: -1,
      height: -1,
    };

    if (directionOfMouseMove === "left") {
      newMediaDimensions.width = currentMediaDimensions.width - Math.abs(diff);
    } else {
      newMediaDimensions.width = currentMediaDimensions.width + Math.abs(diff);
    }

    if (newMediaDimensions.width > proseMirrorContainerWidth)
      newMediaDimensions.width = proseMirrorContainerWidth;

    newMediaDimensions.height = newMediaDimensions.width / aspectRatio;

    if (limitWidthOrHeightToFiftyPixels(newMediaDimensions)) return;

    updateAttributes(newMediaDimensions);
  };

  const onHorizontalMouseMove = (e: MouseEvent) => {
    if (lastClientX === -1) return;

    const { clientX } = e;

    const diff = lastClientX - clientX;

    if (diff === 0) return;

    const directionOfMouseMove: "left" | "right" = diff > 0 ? "left" : "right";

    setTimeout(() => {
      onHorizontalResize(directionOfMouseMove, Math.abs(diff));
      lastClientX = clientX;
    });
  };

  const [isFloat, setIsFloat] = useState<boolean>();

  useEffect(() => {
    setIsFloat(node.attrs.dataFloat);
  }, [node.attrs]);

  const [isAlign, setIsAlign] = useState<boolean>();

  useEffect(() => {
    setIsAlign(node.attrs.dataAlign);
  }, [node.attrs]);

  return (
    <NodeViewWrapper
      as="article"
      className={`
        media-node-view flex pos-relative not-prose
        ${(isFloat && `f-${node.attrs.dataFloat}`) || ""}
        ${(isAlign && `align-${node.attrs.dataAlign}`) || ""}
        group
      `}
    >
      <div className="w-fit flex relative">
        {mediaType === "img" && (
          <img
            src={node.attrs.src}
            ref={resizableImgRef as any}
            className={`rounded-lg ${`float-${node.attrs.dataFloat}`} ${`align-${node.attrs.dataAlign}`}`}
            draggable="true"
            alt={node.attrs.src}
            width={node.attrs.width}
            height={node.attrs.height}
          />
        )}

        {mediaType === "video" && (
          <video
            ref={resizableImgRef as any}
            className={`rounded-lg ${`float-${node.attrs.dataFloat}`} ${`align-${node.attrs.dataAlign}`}`}
            draggable="true"
            controls
            width={node.attrs.width}
            height={node.attrs.height}
          >
            <source src={node.attrs.src} />
          </video>
        )}

        <div
          className={`horizontal-resize-handle ${
            isHorizontalResizeActive ? "horizontal-resize-active" : ""
          }`}
          title="Resize"
          onClick={({ clientX }) => setLastClientX(clientX)}
          onMouseDown={startHorizontalResize}
          onMouseUp={stopHorizontalResize}
        />

        <section
          className="
            group-hover:opacity-100 opacity-0 absolute top-2 left-2 bg-white transition-all duration-200 ease-linear
            shadow-xl rounded-sm overflow-hidden border border-slate-200 box-border
          "
        >
          {resizableMediaActions.map((btn) => {
            return (
              // TODO: figure out why tooltips are not working
              <div className="tooltip" key={btn.tooltip} data-tip={btn.tooltip}>
                <button
                  type="button"
                  className={`btn btn-xs btn-ghost rounded-none h-8 px-2 ${
                    mediaActionActiveState[btn.tooltip]
                      ? "btn-active text-black"
                      : ""
                  }`}
                  onClick={() =>
                    btn.tooltip === "Delete"
                      ? deleteNode()
                      : btn.action?.(updateAttributes)
                  }
                >
                  <i className={`${btn.icon} scale-150`} />
                </button>
              </div>
            );
          })}
        </section>
      </div>
    </NodeViewWrapper>
  );
};
