import {changeFilePath, markAsSaved} from "@redux/reducers/files";
import {addNotification} from "@redux/reducers/notifications";
import {AppDispatch} from "@redux/store";

import {Notification, NotificationType} from "@shared-types/notifications";

import { File } from "@utils/file-system/file";
import path from "path";

export function saveFile(
    filePath: string,
    value: string,
    workingDirectory: string,
    dispatch: AppDispatch
): void {
    const file = new File(path.relative(workingDirectory, filePath), workingDirectory);

    if (file.writeString(value)) {
        dispatch(markAsSaved(filePath));
        const notification: Notification = {
            type: NotificationType.SUCCESS,
            message: `${file.relativePath()} successfully saved.`,
        };
        dispatch(addNotification(notification));
        return;
    }
    const notification: Notification = {
        type: NotificationType.ERROR,
        message: `${file.relativePath()} could not be saved.`,
    };
    dispatch(addNotification(notification));
}

export function saveFileAs(oldFilePath: string, newFilePath: string, value: string, workingDirectory: string, dispatch: AppDispatch) {
    const file = new File(path.relative(workingDirectory, newFilePath), workingDirectory);

    if (file.writeString(value)) {
        dispatch(changeFilePath({oldFilePath, newFilePath}));
        const notification: Notification = {
            type: NotificationType.SUCCESS,
            message: `${newFilePath} successfully saved.`,
        };
        dispatch(addNotification(notification));
    }
    else {
        const notification: Notification = {
            type: NotificationType.ERROR,
            message: `Could not save file '${newFilePath}'.`,
        };
        dispatch(addNotification(notification));
    }
}
