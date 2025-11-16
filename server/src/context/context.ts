import type Redis from "ioredis";
import type { NamespaceType, ServerType } from "../realtime/types";
import {
  BoardStateService,
  CursorService,
  MemberService,
  MessageService,
  PresenceService,
  RedisLock,
  UserService,
} from "../services";

const NSP_ROOMS = "/rooms";

export type AppContext = {
  io: ServerType;
  nsp: NamespaceType;
  redis: Redis;
  services: {
    user: UserService;
    board: BoardStateService;
    cursor: CursorService;
    member: MemberService;
    message: MessageService;
    presence: PresenceService;
  };
};

export function buildContext(io: ServerType, redis: Redis): AppContext {
  const nsp = io.of(NSP_ROOMS);
  const locker = new RedisLock(redis);

  const ctx: AppContext = {
    io,
    nsp,
    redis,
    services: {
      user: new UserService(redis),
      board: new BoardStateService(redis, locker),
      cursor: new CursorService(redis),
      member: new MemberService(redis),
      message: new MessageService(redis),
      presence: new PresenceService(redis),
    },
  };

  return Object.freeze(ctx);
}
