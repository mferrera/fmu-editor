import useSize from "@react-hook/size";

import React from "react";

export enum EllipsisPosition {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
}

export type OverflowEllipsisType = {
    text: string;
    ellipsisPosition: EllipsisPosition;
    showFullTextAsTitle?: boolean;
};

export const OverflowEllipsis: React.FC<OverflowEllipsisType> = props => {
    const [adjustedText, setAdjustedText] = React.useState<string>(props.text);
    const ref = React.useRef<HTMLDivElement | null>(null);
    const size = useSize(ref.current);

    React.useLayoutEffect(() => {
        const measureTextWidth = (text: string, font?: string): number => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (context && ref.current) {
                context.font = font || getComputedStyle(ref.current).font;

                return context.measureText(text).width;
            }
            return 0;
        };

        if (size[0] === 0) {
            return;
        }
        let ellipsis = "";
        if (props.ellipsisPosition === EllipsisPosition.LEFT) {
            let newText = props.text;
            while (measureTextWidth(`${ellipsis}${newText}`) > size[0] && newText.length > 0) {
                newText = newText.substring(1);
                ellipsis = "...";
            }
            setAdjustedText(`${ellipsis}${newText}`);
        }
        if (props.ellipsisPosition === EllipsisPosition.RIGHT) {
            let newText = props.text;
            while (measureTextWidth(`${newText}${ellipsis}`) > size[0] && newText.length > 0) {
                newText = newText.substring(0, newText.length - 1);
                ellipsis = "...";
            }
            setAdjustedText(`${newText}${ellipsis}`);
        }
        if (props.ellipsisPosition === EllipsisPosition.CENTER) {
            let middlePosition = Math.round(props.text.length / 2);
            let firstPartOfText = props.text.substring(0, middlePosition);
            let secondPartOfText = props.text.substring(middlePosition);
            let count = 0;
            while (
                measureTextWidth(`${firstPartOfText}${ellipsis}${secondPartOfText}`) > size[0] &&
                firstPartOfText.length + secondPartOfText.length > 0
            ) {
                firstPartOfText = firstPartOfText.substring(0, firstPartOfText.length - 1);
                secondPartOfText = secondPartOfText.substring(1);
                ellipsis = "...";
                if (count++ > 20) {
                    break;
                }
            }
            setAdjustedText(`${firstPartOfText}${ellipsis}${secondPartOfText}`);
        }
    }, [size, props.text, props.ellipsisPosition]);

    return (
        <div ref={ref} title={props.showFullTextAsTitle ? props.text : undefined} style={{flexGrow: 4}}>
            {adjustedText}
        </div>
    );
};
