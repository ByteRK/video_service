import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const commands = [
  {
    name: 'api',
    color: '\u001b[34m',
    cwd: join(rootDir, 'apps', 'api'),
    entry: join(rootDir, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js'),
    args: ['start', '--watch']
  },
  {
    name: 'web',
    color: '\u001b[32m',
    cwd: join(rootDir, 'apps', 'web'),
    entry: join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js'),
    args: []
  }
];

const children = new Set();
let stopping = false;
let exitCode = 0;

for (const command of commands) {
  const child = spawn(process.execPath, [command.entry, ...command.args], {
    cwd: command.cwd,
    env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR || '1' },
    stdio: ['inherit', 'pipe', 'pipe'],
    windowsHide: true
  });
  children.add(child);
  pipeLines(child.stdout, command, process.stdout);
  pipeLines(child.stderr, command, process.stderr);
  child.on('error', error => {
    process.stderr.write(`${label(command)} 启动失败：${error.message}\n`);
    exitCode = 1;
    shutdown();
  });
  child.on('close', code => {
    children.delete(child);
    if (!stopping) {
      exitCode = code || 0;
      process.stdout.write(`${label(command)} 已退出${code ? `，退出码 ${code}` : ''}\n`);
      shutdown();
    }
    if (children.size === 0) process.exit(exitCode);
  });
}

process.once('SIGINT', () => shutdown(0));
process.once('SIGTERM', () => shutdown(0));

function shutdown(code = exitCode) {
  if (stopping) return;
  stopping = true;
  exitCode = code;
  for (const child of children) {
    if (!child.killed) child.kill('SIGINT');
  }
  const forceTimer = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    }
  }, 3000);
  forceTimer.unref();
  if (children.size === 0) process.exit(exitCode);
}

function pipeLines(stream, command, output) {
  stream.setEncoding('utf8');
  let buffer = '';
  stream.on('data', chunk => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) output.write(`${label(command)} ${line}\n`);
  });
  stream.on('end', () => {
    if (buffer) output.write(`${label(command)} ${buffer}\n`);
  });
}

function label(command) {
  return `${command.color}[${command.name}]\u001b[0m`;
}
