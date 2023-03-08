import {BLSessionEvent, NTRunnerConfig} from "@notest/common"
import {SessionRunner} from "../../../notest-backend-shared/src/session-runner/session-runner";

export async function runNewSession(
    eventList: BLSessionEvent[],
    config: NTRunnerConfig,
) {
    const sessionRunner = new SessionRunner();
    return await sessionRunner.run(eventList, config) as {
        screenshotList: { name: string; data: Buffer, fired: Date }[],
        events: BLSessionEvent[],
        testFailed: boolean,
        lastEvent: BLSessionEvent,
        startVideoTimeStamp: Date,
        videoPath: string,
    }
}