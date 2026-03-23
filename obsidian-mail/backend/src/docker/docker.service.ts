import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dockerode from 'dockerode';
import { Writable, PassThrough } from 'stream';
import { Observable } from 'rxjs';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

@Injectable()
export class DockerService implements OnModuleInit {
  private readonly logger = new Logger(DockerService.name);
  private docker: Dockerode;
  private readonly containerName: string;

  constructor(private readonly config: ConfigService) {
    this.containerName = this.config.get<string>('MAILSERVER_CONTAINER', 'mailserver');
    this.docker = new Dockerode({
      socketPath: process.platform === 'win32'
        ? '//./pipe/docker_engine'
        : '/var/run/docker.sock',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.docker.ping();
      this.logger.log('Docker socket connected');
    } catch {
      this.logger.warn('Docker socket not available — some features will be unavailable');
    }
  }

  /**
   * Run `setup <args>` inside the docker-mailserver container.
   */
  async runSetup(args: string[]): Promise<ExecResult> {
    return this.exec(['setup', ...args]);
  }

  /**
   * Run an arbitrary command inside the container.
   */
  async exec(cmd: string[]): Promise<ExecResult> {
    const container = this.docker.getContainer(this.containerName);

    const exec = await container.exec({
      Cmd: cmd,
      AttachStdout: true,
      AttachStderr: true,
    });

    return new Promise((resolve, reject) => {
      exec.start({ hijack: true, stdin: false }, (err, stream) => {
        if (err) return reject(err);

        let stdout = '';
        let stderr = '';

        const stdoutStream = new Writable({
          write(chunk, enc, cb) { stdout += chunk.toString(); cb(); }
        });
        const stderrStream = new Writable({
          write(chunk, enc, cb) { stderr += chunk.toString(); cb(); }
        });

        this.docker.modem.demuxStream(stream!, stdoutStream, stderrStream);

        stream!.on('end', async () => {
          const inspect = await exec.inspect();
          resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: inspect.ExitCode ?? 0 });
        });
        stream!.on('error', reject);
      });
    });
  }

  /**
   * Exec a long-running command (e.g. `tail -f`) inside the container and
   * emit each stdout line as an Observable item. Unsubscribing destroys the stream.
   */
  execStream(cmd: string[]): Observable<string> {
    return new Observable<string>(subscriber => {
      let activeStream: any = null;

      const container = this.docker.getContainer(this.containerName);
      container
        .exec({ Cmd: cmd, AttachStdout: true, AttachStderr: false })
        .then(exec => {
          exec.start({ hijack: true, stdin: false }, (err: Error | null, stream: any) => {
            if (err) { subscriber.error(err); return; }
            activeStream = stream;

            const stdout = new PassThrough();
            this.docker.modem.demuxStream(stream, stdout, new PassThrough());

            let buffer = '';
            stdout.on('data', (chunk: Buffer) => {
              buffer += chunk.toString();
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';
              for (const line of lines) {
                if (line.trim()) subscriber.next(line);
              }
            });
            stdout.on('end', () => subscriber.complete());
            stream.on('error', (e: Error) => subscriber.error(e));
          });
        })
        .catch(err => subscriber.error(err));

      return () => {
        if (activeStream) {
          try { activeStream.destroy(); } catch { /* ignore */ }
        }
      };
    });
  }

  /** Get container inspect info */
  async getContainerInfo() {
    try {
      const container = this.docker.getContainer(this.containerName);
      return await container.inspect();
    } catch {
      return null;
    }
  }
}
