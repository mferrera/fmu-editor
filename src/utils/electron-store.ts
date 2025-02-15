const ElectronStore = require("electron-store");

const IPosition = {
    type: "object",
    properties: {
        lineNumber: {
            type: "number",
        },
        column: {
            type: "number",
        },
    },
};

const ICursorState = {
    type: "object",
    properties: {
        inSelectionMode: {
            type: "boolean",
        },
        selectionStart: IPosition,
        position: IPosition,
    },
};

const IViewState = {
    type: "object",
    properties: {
        scrollTop: {
            type: "number",
        },
        scrollTopWithoutViewZones: {
            type: "number",
        },
        scrollLeft: {
            type: "number",
        },
        firstPosition: IPosition,
        firstPositionDeltaTop: {
            type: "number",
        },
    },
};

const ICodeEditorViewState = {
    type: "object",
    properties: {
        cursorState: {
            type: "array",
            items: ICursorState,
        },
        viewState: IViewState,
    },
};

const schema = {
    preferences: {
        type: "object",
        properties: {
            pathToPythonInterpreter: {
                type: "string",
            },
            pathToYamlSchemaFile: {
                type: "string",
            },
            webvizTheme: {
                type: "string",
            },
        },
    },
    ui: {
        type: "object",
        properties: {
            settings: {
                type: "object",
                properties: {
                    theme: {
                        type: "string",
                    },
                },
            },
            paneConfiguration: {
                type: "object",
                patternProperties: {
                    ".*": {
                        type: "array",
                        items: {
                            type: "number",
                        },
                    },
                },
            },
            recentDocuments: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    },
    uiCoach: {
        type: "object",
        properties: {
            initialConfigurationDone: {
                type: "boolean",
            },
        },
    },
    files: {
        type: "object",
        properties: {
            activeFile: {
                type: "string",
            },
            files: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        filePath: {
                            type: "string",
                        },
                        editorViewState: {
                            oneOf: [ICodeEditorViewState, {type: "string"}],
                        },
                    },
                },
            },
        },
    },
};

const defaults = {
    preferences: {
        pathToPythonInterpreter: "",
        pathToYamlSchemaFile: "",
        webvizTheme: "",
    },
    ui: {
        settings: {
            theme: "light",
            editorFontSize: 1.0,
        },
        paneConfiguration: {
            "Editor-Issues": [75, 25],
            "file-explorer": [25, 75],
            "Editor-Preview": [50, 50],
            pull: [25, 75],
            "source-control": [25, 75],
        },
        recentDocument: [],
    },
    uiCoach: {
        initialConfigurationDone: false,
    },
    files: {
        activeFile: "",
        files: [],
    },
};

const electronStore = new ElectronStore({
    schema,
    defaults,
});

export default electronStore;
