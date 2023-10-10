import type { Logger, LoggerNamespace, LogContext, LoggerOptions } from './logger';
import { colors } from './loggerColor';

export class DefaultLogger implements Logger {
    public debugMode: boolean | LoggerNamespace[];
    readonly writer;
    private readonly usesReplicas;
    private readonly highlighter;
  
    constructor(private readonly options: LoggerOptions) {
      this.debugMode = this.options.debugMode ?? false;
      this.writer = this.options.writer;
      this.usesReplicas = this.options.usesReplicas;
      this.highlighter = this.options.highlighter;
    }

  /**
   * @inheritDoc
   */
  log(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    if (!this.isEnabled(namespace)) {
      return;
    }

    // clean up the whitespace
    message = message.replace(/\n/g, '').replace(/ +/g, ' ').trim();

    // use red for error levels
    if (context?.level === 'error') {
      message = colors.red(message);
    }

    // use yellow for warning levels
    if (context?.level === 'warning') {
      message = colors.yellow(message);
    }

    this.writer(colors.grey(`[${namespace}] `) + message);
  }

  /**
   * @inheritDoc
   */
  error(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.log(namespace, message, { ...context, level: 'error' });
  }

  /**
   * @inheritDoc
   */
  warn(namespace: LoggerNamespace, message: string, context?: LogContext): void {
    this.log(namespace, message, { ...context, level: 'warning' });
  }

  /**
   * @inheritDoc
   */
  setDebugMode(debugMode: boolean | LoggerNamespace[]): void {
    this.debugMode = debugMode;
  }

  isEnabled(namespace: LoggerNamespace): boolean {
    return !!this.debugMode && (!Array.isArray(this.debugMode) || this.debugMode.includes(namespace));
  }

  /**
   * @inheritDoc
   */
  logQuery(context: { query: string } & LogContext): void {
    if (!this.isEnabled('query')) {
      return;
    }

    /* istanbul ignore next */
    let msg = this.highlighter?.highlight(context.query) ?? context.query;

    if (context.took != null) {
      if (context.results != null) {
        msg += colors.grey(` [took ${context.took} ms, ${context.results} result${context.results > 1 ? 's' : ''}]`);
      } else {
        msg += colors.grey(` [took ${context.took} ms]`);
      }
    }

    if (this.usesReplicas && context.connection) {
      msg += colors.cyan(` (via ${context.connection.type} connection '${context.connection.name}')`);
    }

    return this.log('query', msg, context);
  }

}