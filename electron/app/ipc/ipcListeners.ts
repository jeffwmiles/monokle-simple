import {app, ipcMain} from 'electron';
import log from 'electron-log';

import asyncLib from 'async';
import {machineIdSync} from 'node-machine-id';
import * as path from 'path';

import {
  DOWNLOAD_PLUGIN,
  DOWNLOAD_PLUGIN_RESULT,
  DOWNLOAD_TEMPLATE,
  DOWNLOAD_TEMPLATE_PACK,
  DOWNLOAD_TEMPLATE_PACK_RESULT,
  DOWNLOAD_TEMPLATE_RESULT,
  UPDATE_EXTENSIONS,
  UPDATE_EXTENSIONS_RESULT,
} from '@shared/constants/ipcEvents';
import type {CommandOptions} from '@shared/models/commands';
import {NewVersionCode} from '@shared/models/config';
import {
  AnyExtension,
  DownloadPluginResult,
  DownloadTemplatePackResult,
  DownloadTemplateResult,
  UpdateExtensionsResult,
} from '@shared/models/extension';
import type {FileExplorerOptions, FileOptions} from '@shared/models/fileExplorer';
import {AnyPlugin} from '@shared/models/plugin';
import {DISABLED_TELEMETRY} from '@shared/models/telemetry';
import {AnyTemplate, InterpolateTemplateOptions, TemplatePack} from '@shared/models/template';
import electronStore from '@shared/utils/electronStore';
import {disableSegment, enableSegment, getSegmentClient} from '@shared/utils/segment';

import autoUpdater from '../autoUpdater';
import {
  checkNewVersion,
  forceLoad as forceReload,
  interpolateTemplate,
  runCommand,
  saveFileDialog,
  selectFileDialog,
} from '../commands';
import {ProjectNameChange, StorePropagation} from '../models';
import '../services/cluster/ipc';
import {downloadPlugin, updatePlugin} from '../services/pluginService';
import {
  downloadTemplate,
  downloadTemplatePack,
  loadTemplatesFromPlugin,
  loadTemplatesFromTemplatePack,
  updateTemplate,
  updateTemplatePack,
} from '../services/templateService';
import {askActionConfirmation, calculateMinutesPassed} from '../utils';
import {dispatchToAllWindows} from './ipcMainRedux';

const userDataDir = app.getPath('userData');
const userTempDir = app.getPath('temp');
const pluginsDir = path.join(userDataDir, 'monoklePlugins');
const templatesDir = path.join(userDataDir, 'monokleTemplates');
const templatePacksDir = path.join(userDataDir, 'monokleTemplatePacks');
const machineId = machineIdSync();

ipcMain.on('track-event', async (event: any, {eventName, payload}: any) => {
  const segmentClient = getSegmentClient();
  if (segmentClient) {
    const firstTimeRunTimestamp = electronStore.get('main.firstTimeRunTimestamp');
    const minutesPassedSinceFirstTimeRun = firstTimeRunTimestamp === undefined
      ? -1
      : calculateMinutesPassed(firstTimeRunTimestamp);

    const properties: any = {appVersion: app.getVersion(), ...payload};

    if (minutesPassedSinceFirstTimeRun >= 0 && minutesPassedSinceFirstTimeRun <= 10) {
      properties['ftu10m'] = 1;
    } else if (minutesPassedSinceFirstTimeRun > 10 && minutesPassedSinceFirstTimeRun <= 30) {
      properties['ftu30m'] = 1;
    } else if (minutesPassedSinceFirstTimeRun > 30 && minutesPassedSinceFirstTimeRun <= 60) {
      properties['ftu60m'] = 1;
    }

    segmentClient.track({
      event: eventName,
      userId: machineId,
      properties,
    });
  } else if (process.env.NODE_ENV === `development`) {
    log.info(`telemetry event ${eventName}`, payload);
  }
});

ipcMain.on(DOWNLOAD_PLUGIN, async (event: any, pluginUrl: string) => {
  try {
    const pluginExtension = await downloadPlugin(pluginUrl, pluginsDir);
    const templateExtensions = await loadTemplatesFromPlugin(pluginExtension.extension);
    const downloadPluginResult: DownloadPluginResult = {pluginExtension, templateExtensions};
    event.sender.send(DOWNLOAD_PLUGIN_RESULT, downloadPluginResult);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_PLUGIN_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

ipcMain.on(DOWNLOAD_TEMPLATE, async (event: any, templateUrl: string) => {
  try {
    const templateExtension = await downloadTemplate(templateUrl, templatesDir);
    const downloadTemplateResult: DownloadTemplateResult = {templateExtension};
    event.sender.send(DOWNLOAD_TEMPLATE_RESULT, downloadTemplateResult);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_TEMPLATE_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

ipcMain.on(DOWNLOAD_TEMPLATE_PACK, async (event: any, templatePackUrl: string) => {
  try {
    const templatePackExtension = await downloadTemplatePack(templatePackUrl, templatePacksDir);
    const templateExtensions = await loadTemplatesFromTemplatePack(templatePackExtension.extension);
    const downloadTemplatePackResult: DownloadTemplatePackResult = {templatePackExtension, templateExtensions};
    event.sender.send(DOWNLOAD_TEMPLATE_PACK_RESULT, downloadTemplatePackResult);
  } catch (err) {
    if (err instanceof Error) {
      event.sender.send(DOWNLOAD_TEMPLATE_PACK_RESULT, err);
    } else {
      log.warn(err);
    }
  }
});

type UpdateExtensionsPayload = {
  templateMap: Record<string, AnyTemplate>;
  templatePackMap: Record<string, TemplatePack>;
  pluginMap: Record<string, AnyPlugin>;
};

ipcMain.on(UPDATE_EXTENSIONS, async (event: any, payload: UpdateExtensionsPayload) => {
  const {templateMap, pluginMap, templatePackMap} = payload;
  let errorMessage = '';

  const standaloneTemplates = Object.entries(templateMap)
    .filter(([key]) => key.startsWith(templatesDir))
    .map(([_, value]) => value);

  const updatedStandaloneTemplateExtensions: (AnyExtension<AnyTemplate> | undefined)[] = await asyncLib.map(
    standaloneTemplates,
    async (template: AnyTemplate) => {
      try {
        const templateExtension = await updateTemplate(template, templatesDir, userTempDir);
        return templateExtension;
      } catch (e) {
        if (e instanceof Error) {
          errorMessage += `${e.message}\n`;
        }
      }
    }
  );

  const updatedPluginExtensions: (AnyExtension<AnyPlugin> | undefined)[] = await asyncLib.map(
    Object.values(pluginMap),
    async (plugin: AnyPlugin) => {
      try {
        const pluginExtension = await updatePlugin(plugin, pluginsDir, userTempDir);
        return pluginExtension;
      } catch (e) {
        if (e instanceof Error) {
          errorMessage += `${e.message}\n`;
        }
      }
    }
  );

  const updatedTemplatePackExtensions: (AnyExtension<TemplatePack> | undefined)[] = await asyncLib.map(
    Object.values(templatePackMap),
    async (templatePack: TemplatePack) => {
      try {
        const templatePackExtension = await updateTemplatePack(templatePack, templatePacksDir, userTempDir);
        return templatePackExtension;
      } catch (e) {
        if (e instanceof Error) {
          errorMessage += `${e.message}\n`;
        }
      }
    }
  );

  if (errorMessage.trim().length > 0) {
    log.warn('[Update Extensions]:', errorMessage);
  }

  const updateExtensionsResult: UpdateExtensionsResult = {
    pluginExtensions: updatedPluginExtensions.filter((x): x is AnyExtension<AnyPlugin> => x != null),
    templateExtensions: updatedStandaloneTemplateExtensions.filter((x): x is AnyExtension<AnyTemplate> => x != null),
    templatePackExtensions: updatedTemplatePackExtensions.filter((x): x is AnyExtension<TemplatePack> => x != null),
  };

  const updatedTemplateExtensionsFromPlugins: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    updateExtensionsResult.pluginExtensions,
    async (pluginExtension: AnyExtension<AnyPlugin>) => {
      const templateExtensions = await loadTemplatesFromPlugin(pluginExtension.extension);
      return templateExtensions;
    }
  );

  const updatedTemplateExtensionsFromTemplatePacks: AnyExtension<AnyTemplate>[][] = await asyncLib.map(
    updateExtensionsResult.templatePackExtensions,
    async (templatePackExtension: AnyExtension<TemplatePack>) => {
      const templateExtensions = await loadTemplatesFromTemplatePack(templatePackExtension.extension);
      return templateExtensions;
    }
  );

  updateExtensionsResult.templateExtensions.push(
    ...updatedTemplateExtensionsFromPlugins.flat(),
    ...updatedTemplateExtensionsFromTemplatePacks.flat()
  );

  event.sender.send(UPDATE_EXTENSIONS_RESULT, updateExtensionsResult);
});

ipcMain.on('interpolate-vanilla-template', (event: any, args: InterpolateTemplateOptions) => {
  interpolateTemplate(args, event);
});

ipcMain.handle('select-file', async (event, options: FileExplorerOptions) => {
  return selectFileDialog(event, options);
});

ipcMain.handle('save-file', async (event: any, options: FileOptions) => {
  return saveFileDialog(event, options);
});

ipcMain.on('run-command', (event, args: CommandOptions) => {
  runCommand(args, event);
});

ipcMain.on('app-version', event => {
  event.sender.send('app-version', {version: app.getVersion()});
});

ipcMain.on('check-update-available', async () => {
  await checkNewVersion(dispatchToAllWindows);
});

ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
  dispatchToAllWindows({type: 'config/updateNewVersion', payload: {code: NewVersionCode.Idle, data: null}});
});

ipcMain.on('force-reload', async (event: any) => {
  forceReload(event);
});

ipcMain.on('confirm-action', (event: any, args) => {
  event.returnValue = askActionConfirmation(args);
});

ipcMain.on('global-electron-store-update', (event, args: any) => {
  if (args.eventType === StorePropagation.ChangeProjectName) {
    const payload: ProjectNameChange = args.payload;
    dispatchToAllWindows({type: 'config/changeCurrentProjectName', payload: payload.newName});
  } else {
    log.warn(`received invalid event type for global electron store update ${args.eventType}`);
  }
});

ipcMain.handle('analytics:toggleTracking', async (_event, {disableEventTracking}) => {
  const segmentClient = getSegmentClient();

  if (disableEventTracking) {
    segmentClient?.track({
      userId: machineId,
      event: DISABLED_TELEMETRY,
    });
    disableSegment();
  } else {
    enableSegment();
  }
});
