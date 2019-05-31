import React, { useEffect } from "react";
import styled from "styled-components";
import { useTheme } from "../shared/Themes";
import { JobTerminal, JobTerminalManager } from "./terminal";

interface ICommandProps {
    room: string;
}

const TerminalContainer = styled.div`
    flex: 1;
    max-width: 100%;
    padding: 10px;
    white-space: pre-wrap;
`;

const CommandOutputXterm: React.FC<ICommandProps> = React.memo(({ room }) => {
    const elRef = React.useRef<HTMLDivElement>(null);
    const terminal = React.useRef<JobTerminal | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (elRef && elRef.current) {
            if (terminal.current === null) {
                terminal.current = JobTerminalManager.getInstance().createJobTerminal(room);
                terminal.current.attachTo(elRef.current);
            }
        }
    }, []);

    useEffect(() => {
        let themeTimeout: any = null;
        // Setting theme is taking a LOOOOOOOOOONG time.
        // So had to do it later with 0 time.
        const setThemeLater = () => {
            themeTimeout = setTimeout(() => {
                if (terminal && terminal.current) {
                    terminal.current.setTheme(theme);
                }
            }, 0);
        };
        setThemeLater();
        return () => {
            clearTimeout(themeTimeout);
        };
    }, [theme]);

    return <TerminalContainer ref={elRef} />;
});

export default CommandOutputXterm;