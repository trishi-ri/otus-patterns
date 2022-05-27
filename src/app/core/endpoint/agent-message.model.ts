export interface IAgentMessage {
  gameId: number;
  objectId: number;
  commandId: number;
  args?: string;
}
