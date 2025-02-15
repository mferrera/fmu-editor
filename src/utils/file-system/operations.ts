import {ICommit} from "@shared-types/changelog";
import {FileChange, FileChangeOrigin, FileChangeType} from "@shared-types/file-changes";

import path from "path";
import {v4} from "uuid";

import {Directory} from "./directory";
import {File} from "./file";
import {Snapshot} from "./snapshot";

export type FileMap = {
    file: File;
    origin: "main" | "user";
};

const deduplicate = (fileMap: FileMap[]): FileMap[] => {
    return fileMap.filter(el => {
        if (el.origin === "user" && fileMap.some(el2 => el2.origin === "main" && el2.file.equals(el.file, true))) {
            return false;
        }
        return true;
    });
};

export const compareDirectories = (workingDirectory: string, user: string): FileChange[] => {
    const changes: FileChange[] = [];
    const snapshot = new Snapshot(workingDirectory, user);
    const mainDirectory = new Directory("./", workingDirectory);
    const userDirectory = mainDirectory.getUserVersion(user) as Directory;

    const mainFiles = mainDirectory.getFilesRecursively();
    const userFiles = userDirectory.getFilesRecursively();

    const combinedFiles = deduplicate([
        ...mainFiles.map(el => ({file: el, origin: "main"})),
        ...userFiles.map(el => ({file: el, origin: "user"})),
    ] as FileMap[]);

    combinedFiles.forEach(({origin, file}) => {
        if (origin === "main") {
            const userFile = file.getUserVersion(user) as File;
            if (userFile.exists()) {
                if (
                    snapshot.getModifiedMs(file.relativePath()) < file.modifiedTime() &&
                    snapshot.getModifiedMs(file.relativePath()) < userFile.modifiedTime() &&
                    !userFile.compare(file)
                ) {
                    changes.push({
                        type: FileChangeType.MODIFIED,
                        relativePath: file.relativePath(),
                        origin: FileChangeOrigin.BOTH,
                        user,
                        modified: file.modifiedTime(),
                    });
                } else if (
                    snapshot.getModifiedMs(file.relativePath()) < file.modifiedTime() &&
                    !userFile.compare(file)
                ) {
                    changes.push({
                        type: FileChangeType.MODIFIED,
                        relativePath: file.relativePath(),
                        origin: FileChangeOrigin.MAIN,
                        user,
                        modified: file.modifiedTime(),
                    });
                } else if (
                    snapshot.getModifiedMs(userFile.relativePath()) < userFile.modifiedTime() &&
                    !userFile.compare(file)
                ) {
                    changes.push({
                        type: FileChangeType.MODIFIED,
                        relativePath: file.relativePath(),
                        user,
                        origin: FileChangeOrigin.USER,
                        modified: userFile.modifiedTime(),
                    });
                }
            } else if (snapshot.fileExists(file.relativePath())) {
                changes.push({
                    type: FileChangeType.DELETED,
                    relativePath: file.relativePath(),
                    origin: FileChangeOrigin.USER,
                    user,
                });
            } else {
                changes.push({
                    type: FileChangeType.ADDED,
                    relativePath: file.relativePath(),
                    origin: FileChangeOrigin.MAIN,
                    user,
                });
            }
        } else if (snapshot.fileExists(file.getMainVersion().relativePath())) {
            changes.push({
                type: FileChangeType.DELETED,
                relativePath: file.getMainVersion().relativePath(),
                origin: FileChangeOrigin.MAIN,
                user,
            });
        } else {
            changes.push({
                type: FileChangeType.ADDED,
                relativePath: file.getMainVersion().relativePath(),
                origin: FileChangeOrigin.USER,
                user,
            });
        }
    });

    return changes;
};

export const pushFiles = (
    fileChanges: FileChange[],
    username: string,
    commitSummary: string,
    commitDescription: string,
    workingDirectory: string
): {pushedFilesPaths: string[]; notPushedFilesPaths: string[]; commit: ICommit} => {
    const committedFileChanges: FileChange[] = [];
    const snapshot = new Snapshot(workingDirectory, username);

    fileChanges.forEach(fileChange => {
        if (fileChange.type === FileChangeType.DELETED) {
            const mainFile = new File(fileChange.relativePath, workingDirectory).getMainVersion();
            if (mainFile.remove()) {
                const dir = new Directory(
                    path.relative(workingDirectory, mainFile.parentDirectoryPath()),
                    workingDirectory
                );
                if (dir.absolutePath() !== workingDirectory && dir.isEmpty()) {
                    dir.remove();
                }
                committedFileChanges.push(fileChange);
                snapshot.delete(fileChange.relativePath);
            }
        } else {
            const userFile = new File(fileChange.relativePath, workingDirectory).getUserVersion(username);
            if (userFile.push()) {
                committedFileChanges.push(fileChange);
                snapshot.updateModified(fileChange.relativePath);
            }
        }
    });

    const commit: ICommit = {
        id: v4(),
        author: username,
        message: [commitSummary, commitDescription].join("\n"),
        datetime: new Date().getTime(),
        files: committedFileChanges.map(el => ({
            path: el.relativePath,
            action: el.type,
        })),
    };

    return {
        pushedFilesPaths: committedFileChanges.map(el => el.relativePath),
        notPushedFilesPaths: fileChanges.filter(el => !committedFileChanges.includes(el)).map(el => el.relativePath),
        commit,
    };
};

export const pullFiles = (
    fileChanges: FileChange[],
    username: string,
    workingDirectory: string
): {
    pulledFilesPaths: string[];
    notPulledFilesPaths: string[];
} => {
    const snapshot = new Snapshot(workingDirectory, username);
    const pulledFileChanges: FileChange[] = [];

    fileChanges.forEach(fileChange => {
        const file = new File(fileChange.relativePath, workingDirectory);
        if (fileChange.type === FileChangeType.DELETED) {
            if (file.getUserVersion(username).remove()) {
                const dir = new Directory(
                    path.relative(workingDirectory, file.getMainVersion().parentDirectoryPath()),
                    workingDirectory
                );
                if (dir.absolutePath() !== workingDirectory && dir.getUserVersion(username).isEmpty()) {
                    dir.getUserVersion(username).remove();
                }
                pulledFileChanges.push(fileChange);
                snapshot.delete(fileChange.relativePath);
            }
        } else if (file.pull(username)) {
            pulledFileChanges.push(fileChange);
            snapshot.updateModified(fileChange.relativePath);
        }
    });

    return {
        pulledFilesPaths: pulledFileChanges.map(el => el.relativePath),
        notPulledFilesPaths: fileChanges.filter(el => !pulledFileChanges.includes(el)).map(el => el.relativePath),
    };
};
