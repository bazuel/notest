import { BLSessionEvent } from '@notest/common';

export abstract class SessionExecutor {
  private session: BLSessionEvent[];
  private config: { [k:string]:any}

  /**
   * Execute all session events
   */
  async run(session: BLSessionEvent[], config) {
    this.config = config;
    this.session = session;
    await this.init(this.config, this.session);
    await this.executeSession().catch((e)=>console.log(`Execution error on event: ${e}`));
    return await this.end();
  }

  /**
   *  Init configuration
   */
  async init(config: { [k:string]:any} , session: BLSessionEvent[]) {}

  /**
   * Execute the Session operations
   */
  async executeSession() {
    for (let i = 0; i < this.session.length; i++) {
      await this.executeEvent(i, this.session, this.session[i]);
    }
  }

  /**
   * Action to execute for each event
   * @param index of current event in session
   * @param session current session
   * @param event current event
   */
  abstract executeEvent(index: number, session: BLSessionEvent[], event: BLSessionEvent);

  /**
   * End the operation
   */
  async end(): Promise<any> {}
}
