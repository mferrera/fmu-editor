import {Typography} from "@mui/material";
import {Stack} from "@mui/system";
import {ChangelogWatcherTopics, changelogWatcherService} from "@services/changelog-service";
import {notificationsService} from "@services/notifications-service";

import React from "react";
import {VscSourceControl} from "react-icons/vsc";

import {CommitList} from "@components/CommitList";
import {Surface} from "@components/Surface";

import {ISnapshotCommitBundle} from "@shared-types/changelog";
import {NotificationType} from "@shared-types/notifications";

import "./commit-browser.css";

export const CommitBrowser: React.FC = () => {
    const [commitBundles, setCommitBundles] = React.useState<ISnapshotCommitBundle[]>([]);

    React.useEffect(() => {
        const getChangelogChanges = () => {
            changelogWatcherService
                .getAllChanges()
                .then(result => {
                    setCommitBundles(result);
                })
                .catch(error => {
                    notificationsService.publishNotification({
                        type: NotificationType.ERROR,
                        message: error,
                    });
                });
        };
        getChangelogChanges();

        const unsubscribeFunc = changelogWatcherService
            .getMessageBus()
            .subscribe(ChangelogWatcherTopics.MODIFIED, getChangelogChanges);

        return unsubscribeFunc;
    }, []);

    return (
        <Surface elevation="none" className="CommitBrowser">
            <div className="CommitBrowserContent">
                {commitBundles.length === 0 || commitBundles.at(0)?.commits.length === 0 ? (
                    <Stack direction="column" className="CommitBrowserEmpty" spacing={2}>
                        <VscSourceControl size={40} />
                        <Typography variant="body2">No commits in the current working directory yet</Typography>
                    </Stack>
                ) : (
                    <CommitList commitBundles={commitBundles} />
                )}
            </div>
        </Surface>
    );
};
