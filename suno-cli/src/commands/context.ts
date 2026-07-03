import { ClerkAuthOptions, getClerkToken } from "../auth/clerk.js";
import { resolvePathConfig } from "../config/paths.js";
import { FeedClient } from "../http/feed.js";
import { LedgerStore } from "../ledger/store.js";

export interface CommandContext {
  ledger: LedgerStore;
  feed: FeedClient;
  dataDir: string;
}

export async function createCommandContext(options: { dataDir?: string; cookieFile?: string; cookie?: string; jwt?: string } = {}): Promise<CommandContext> {
  const pathOptions: { dataDir?: string; cookieFile?: string } = {};
  if (options.dataDir) pathOptions.dataDir = options.dataDir;
  if (options.cookieFile) pathOptions.cookieFile = options.cookieFile;
  const paths = resolvePathConfig(pathOptions);
  const authOptions: ClerkAuthOptions = {};
  if (options.cookie) authOptions.cookie = options.cookie;
  if (options.jwt) authOptions.jwt = options.jwt;
  if (paths.cookieFile) authOptions.cookieFile = paths.cookieFile;
  const token = await getClerkToken(authOptions);
  return {
    ledger: new LedgerStore(paths.ledgerPath),
    feed: new FeedClient({ jwt: token.jwt }),
    dataDir: paths.dataDir
  };
}
