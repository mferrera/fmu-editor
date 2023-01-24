import React from "react";

import {File} from "@utils/file-system/file";

import {useAppSelector} from "@redux/hooks";

import "./preview.css";

const trueAsStr = "true" as any;

export type PreviewProps = {
    filePath: string;
};

export const Preview: React.VFC<PreviewProps> = props => {
    const [previewAvailable, setPreviewAvailable] = React.useState<boolean>(false);
    const broadcastChannel = React.useRef<BroadcastChannel | null>(null);

    const directory = useAppSelector(state => state.files.directory);
    const theme = useAppSelector(state => state.ui.settings.theme);

    React.useEffect(() => {
        broadcastChannel.current = new BroadcastChannel("preview");

        broadcastChannel.current.onmessage = event => {
            if (event.data.moduleAvailable) {
                setPreviewAvailable(true);
                return;
            }
            setPreviewAvailable(false);
        };

        return () => {
            broadcastChannel.current.close();
        };
    }, []);

    React.useEffect(() => {
        if (broadcastChannel.current && directory && props.filePath) {
            const currentFile = new File(props.filePath, directory);
            broadcastChannel.current.postMessage({
                relativeFilePath: currentFile.getMainVersion().relativePath(),
                fileContent: currentFile.readString(),
                theme,
            });
        }
    }, [props.filePath, directory, theme]);

    /* eslint-disable react/no-unknown-property */
    return (
        <div className="Preview">
            <div className="Preview__NoPreviewOverlay" style={{display: previewAvailable ? "none" : "flex"}}>
                No preview available
            </div>
            <webview
                src="http://localhost:3000/preview.html"
                nodeintegration={trueAsStr}
                className="Preview__Webview"
            />
        </div>
    );
};
