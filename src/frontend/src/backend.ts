// Stub backend - this app uses localStorage only, no canister backend
import type { Identity } from "@icp-sdk/core/agent";

export type backendInterface = Record<string, never>;

export interface CreateActorOptions {
  agentOptions?: { identity?: Identity };
  agent?: unknown;
  processError?: unknown;
}

export class ExternalBlob {
  constructor(
    public data: Uint8Array,
    public mimeType: string,
    public onProgress?: (progress: number) => void,
  ) {}

  async getBytes(): Promise<Uint8Array> {
    return this.data;
  }

  static fromURL(_url: string): ExternalBlob {
    return new ExternalBlob(new Uint8Array(), "application/octet-stream");
  }
}

export function createActor(
  _canisterId: string,
  _uploadFile?: unknown,
  _downloadFile?: unknown,
  _options?: CreateActorOptions,
): backendInterface {
  return {};
}
