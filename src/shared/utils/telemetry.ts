import electron from 'electron';

import {machineIdSync} from 'node-machine-id';

import {Event, EventMap} from '@shared/models/telemetry';

import {getSegmentClient} from './segment';
import {isRendererThread} from './thread';

const machineId: string = machineIdSync();

export const trackEvent = <TEvent extends Event>(eventName: TEvent, payload?: EventMap[TEvent]) => {
  if (isRendererThread()) {
    electron.ipcRenderer.send('track-event', {eventName, payload});
  } else {
    const segmentClient = getSegmentClient();
    const properties: any = {appVersion: electron.app.getVersion(), ...payload};
    segmentClient?.track({
      event: eventName,
      properties,
      userId: machineId,
    });
  }
};
