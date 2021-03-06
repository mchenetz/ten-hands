import { BrowserWindow, session } from "electron";
import { showMessage } from "./tray";
import { getConfig } from "../shared/config";
import { join } from "path";
import { readdir } from "fs";

export const openAndFocusWindow = (mainWindow: BrowserWindow) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    mainWindow.focus();
  }
};

export const hideWindowToTray = (mainWindow: BrowserWindow) => {
  console.info("Hiding app to tray.");
  mainWindow.hide();
  if (getConfig()?.showAppRunningTrayNotification) {
    showMessage(
      "Ten Hands is still running. Exit it from tray to completely quit Ten Hands."
    );
  }
};

export const loadReactDevTools = () => {
  const reactDevToolsFolder = join(
    require("os").homedir(),
    "\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi"
  );

  // Read directory instead of hard-coding version number in path because of new React DevTools releases.
  readdir(reactDevToolsFolder, async (err, files) => {
    if (err || !files?.[0]) {
      console.error("Failed to load react-dev-tools");
      return;
    }
    const reactDevToolsPath = join(reactDevToolsFolder, files[0]);
    await session.defaultSession.loadExtension(reactDevToolsPath);
  });
};
