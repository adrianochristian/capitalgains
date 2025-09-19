import { spawn } from 'child_process';
import { join } from 'path';

const runCLI = (input) => new Promise((resolve, reject) => {
  const node = process.execPath; // current Node binary
  const cliPath = join(process.cwd(), 'bin', 'capital-gains');
  const child = spawn(node, [cliPath], { stdio: ['pipe', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0 && stderr) {
      reject(new Error(`CLI exited with code ${code}: ${stderr}`));
    } else {
      resolve({ code, stdout, stderr });
    }
  });

  child.stdin.write(input);
  child.stdin.end();
});

describe('CapitalGains CLI', () => {
  test('processes input lines and prints outputs', async () => {
    const line1 = '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]\n';
    const line2 = '[{"operation":"buy","unit-cost":10.00,"quantity":10000},{"operation":"sell","unit-cost":20.00,"quantity":5000}]\n';

    const { stdout } = await runCLI(line1 + line2);
    const outLines = stdout.trim().split('\n');
    expect(outLines).toEqual([
      '[{"tax":0}]',
      '[{"tax":0},{"tax":10000}]'
    ]);
  });

  test('processes full cases/operations.txt as expected', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const casesPath = path.join(process.cwd(), 'cases', 'operations.txt');
    const input = fs.readFileSync(casesPath, 'utf8');
    const { stdout } = await runCLI(input);
    const outLines = stdout.trim().split('\n');
    expect(outLines).toEqual([
      '[{"tax":0},{"tax":0},{"tax":0}]',
      '[{"tax":0},{"tax":10000},{"tax":0}]',
      '[{"tax":0},{"tax":0},{"tax":1000}]',
      '[{"tax":0},{"tax":0},{"tax":0}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":10000}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":3000}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":3000},{"tax":0},{"tax":0},{"tax":3700},{"tax":0}]',
      '[{"tax":0},{"tax":80000},{"tax":0},{"tax":60000}]',
      '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":1000},{"tax":2400}]'
    ]);
  });

  test('empty input yields no output and exit code 0', async () => {
    const { stdout, code } = await runCLI('');
    expect(code).toBe(0);
    expect(stdout).toBe('');
  });

  test('invalid JSON causes non-zero exit and error on stderr', async () => {
    const badLine = '[{ invalid json }]\n';
    await expect(runCLI(badLine)).rejects.toThrow(/CLI exited with code/);
  });
});

