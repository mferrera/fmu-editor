import {useTheme} from "@mui/material";

import React from "react";

import {ChangesBrowser} from "@components/ChangesBrowser";
import {CommitBrowser} from "@components/CommitBrowser";
import {DiffEditor} from "@components/DiffEditor";
import {Editor} from "@components/Editor";
import {Explorer} from "@components/Explorer/explorer";
import {OngoingChangesBrowser} from "@components/OngoingChangesBrowser";
import {PageTabs} from "@components/PageTabs";
import {Pull} from "@components/Pull";
import {ResizablePanels} from "@components/ResizablePanels";
import {Toolbar} from "@components/Toolbar";

import {useAppSelector} from "@redux/hooks";

import {View} from "@shared-types/ui";

import path from "path";

import {Page} from "./components/page";
import {Pages} from "./components/pages";
import "./main-window.css";

import {SingleFileChangesBrowser} from "../SingleFileChangesBrowser/single-file-changes-browser";

export const MainWindow: React.FC = () => {
    const theme = useTheme();

    const mainWindowRef = React.useRef<HTMLDivElement | null>(null);
    const files = useAppSelector(state => state.files);
    const originalRelativeFilePath = useAppSelector(state => state.ui.diff.originalRelativeFilePath);
    const view = useAppSelector(state => state.ui.view);

    React.useEffect(() => {
        if (view === View.Editor && files && files.activeFilePath !== "") {
            document.title = `${path.basename(files.activeFilePath)} - FMU Editor`;
            return;
        }
        if (view === View.SourceControl) {
            document.title = "Source Control - FMU Editor";
            return;
        }
        document.title = "FMU Editor";
    }, [files, view]);

    return (
        <div className="MainWindow" ref={mainWindowRef} style={{backgroundColor: theme.palette.background.default}}>
            <div className="ContentWrapper">
                <PageTabs />
                <div className="InnerContentWrapper">
                    <Pages activePage={view}>
                        <Page name={View.Editor}>
                            <ResizablePanels direction="horizontal" id="file-explorer" minSizes={[250, 0]}>
                                <Explorer />
                                <Editor />
                            </ResizablePanels>
                        </Page>
                        <Page name={View.SourceControl}>
                            <ResizablePanels direction="horizontal" id="source-control" minSizes={[300, 0]}>
                                <ChangesBrowser />
                                {originalRelativeFilePath ? <DiffEditor /> : <CommitBrowser />}
                            </ResizablePanels>
                        </Page>
                        <Page name={View.OngoingChanges}>
                            <ResizablePanels direction="horizontal" id="user-changes" minSizes={[300, 0]}>
                                <OngoingChangesBrowser />
                                {originalRelativeFilePath ? <DiffEditor /> : null}
                            </ResizablePanels>
                        </Page>
                        <Page name={View.SingleFileChanges}>
                            <ResizablePanels direction="horizontal" id="single-file-changes" minSizes={[300, 0]}>
                                <SingleFileChangesBrowser />
                                {originalRelativeFilePath ? <DiffEditor /> : null}
                            </ResizablePanels>
                        </Page>
                        <Page name={View.Merge}>
                            <Pull />
                        </Page>
                    </Pages>
                </div>
            </div>
            <Toolbar />
        </div>
    );
};
