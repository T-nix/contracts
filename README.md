# tlogger-pack

Logger package for NestJS services.

## Features

- **Three logger types:**
  - **Console Logger:** Outputs logs to the console.
  - **File Logger:** Writes logs to a file.
  - **Messages Logger:** Sends logs as messages (e.g., to a message queue or external service).

## Installation

```bash
npm install tlogger-pack
```

## Usage

Import and configure the logger in your NestJS service:

```typescript
import { LoggerService, LoggerType } from 'tlogger-pack';

const logger = new LoggerService({
  type: LoggerType.CONSOLE, // or FILE, or MESSAGES
  // additional config options
});

logger.log('This is a log message');
```

## Logger Types

- **Console:** For development and debugging.
- **File:** For persistent log storage.
- **Messages:** For integration with external systems.
