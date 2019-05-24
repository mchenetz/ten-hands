import localforage from "localforage";
import throttle from "lodash/throttle";
import React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";

localforage.config({
    name: "ten-hands",
});

// Reducer that saves state of jobs output

enum ACTION_TYPES {
    UPDATE_JOB,
    CLEAR_OUTPUT,
    RESTORE_STATE_FROM_STORAGE,
    UPDATE_JOB_PROCESS,
}

export let roomSocketState = {};

const initializeRoomSocketState = state => {
    Object.keys(state).forEach(room => {
        roomSocketState[room] = false;
    });
};

const updateData = throttle(async data => {
    try {
        if (Object.keys(data).length > 0) {
            console.log(`Writing to storage`);

            await localforage.setItem("state", data);
        }
    } catch (error) {
        console.log("error:", error);
    }
}, 200);

export const initialState = {};

export const jobsReducer = (state = initialState, action: IJobAction): object => {
    switch (action.type) {
        case ACTION_TYPES.UPDATE_JOB: {
            const { room, stdout, isRunning } = action;
            // const newStdout = state[room] ? state[room].stdout + (stdout || "") : "";
            const newStdout = state[room] ? stdout || "" : "";
            return {
                ...state,
                [room]: {
                    ...state[room],
                    stdout: newStdout,
                    isRunning,
                },
            };
        }
        case ACTION_TYPES.UPDATE_JOB_PROCESS: {
            const { room, process } = action;
            const pid = process && process.pid ? process.pid : -1;

            const newState = {
                ...state,
                [room]: {
                    ...state[room],
                    isRunning: pid === -1 ? false : true,
                    process,
                },
            };
            updateData(newState);
            return newState;
        }
        case ACTION_TYPES.CLEAR_OUTPUT: {
            const room = action.room;

            return {
                ...state,
                [room]: {
                    ...state[room],
                    stdout: "",
                },
            };
        }
        case ACTION_TYPES.RESTORE_STATE_FROM_STORAGE: {
            return action.state!;
        }
        default:
            return state;
    }
};

interface IJobsContextValue {
    state: object;
    dispatch: React.Dispatch<IJobAction>;
}

interface IJobsProviderProps {
    value?: IJobsContextValue;
    children: React.ReactNode;
}

export const JobsContext = React.createContext<IJobsContextValue | undefined>(undefined);

function JobsProvider(props: IJobsProviderProps) {
    const [state, dispatch] = React.useReducer(jobsReducer, initialState);

    React.useEffect(() => {
        const restoreData = async () => {
            try {
                const storedState = await localforage.getItem("state");
                if (storedState) {
                    dispatch({
                        type: ACTION_TYPES.RESTORE_STATE_FROM_STORAGE,
                        room: "none",
                        state: storedState,
                    });
                    initializeRoomSocketState(storedState);
                }
            } catch (error) {
                console.log("error:", error);
            }
        };
        restoreData();
    }, []);
    // useDeepCompareEffect(() => {
    //     // updateData(state);
    // }, [state]);
    const value = React.useMemo(() => {
        return {
            state,
            dispatch,
        };
    }, [state, dispatch]);
    return <JobsContext.Provider value={value} {...props} />;
}

function useJobs() {
    const context = React.useContext(JobsContext);
    if (!context) {
        throw new Error("useJobs must be used within a JobsProvider");
    }
    return { ...context, ACTION_TYPES };
}

export { JobsProvider, useJobs };
