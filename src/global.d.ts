import * as winston from 'winston';

declare global {
  var logger: winston.Logger;
}
