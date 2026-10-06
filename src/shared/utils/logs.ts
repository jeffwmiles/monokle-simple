import electronLog from 'electron-log';

const logFileFormat = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{processType}] [{level}] {text}';
if (electronLog.transports.console) {
	electronLog.transports.console.format = logFileFormat;
}
if (electronLog.transports.file) {
	electronLog.transports.file.format = logFileFormat;
	electronLog.transports.file.maxSize = 2 * 1024 * 1024;
}

// one file in stand of main.log & renderer.log
// electronLog.transports.file.fileName = 'logs.log';

export const logToFile = electronLog;
