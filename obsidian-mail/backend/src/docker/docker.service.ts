import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dockerode from 'dockerode';
import { Writable } from 'stream';

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
   * Run `setup.sh <args>` inside the docker-mailserver container.
   */
  async runSetup(args: string[]): Promise<ExecResult> {
    return this.exec(['/bin/sh', '/usr/local/bin/setup.sh', ...args]);
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
