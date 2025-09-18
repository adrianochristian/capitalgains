import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
const binPath = join(projectRoot, 'bin', 'capital-gains');
const fixturesPath = join(__dirname, 'fixtures');

describe('CLI E2E Tests', () => {
  async function runCLI(input) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [binPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: projectRoot
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          code,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.stdin.write(input);
      child.stdin.end();
    });
  }

  async function loadFixture(filename) {
    const filePath = join(fixturesPath, filename);
    return await readFile(filePath, 'utf-8');
  }

  describe('basic operations', () => {
    it('should handle basic input/output correctly', async () => {
      const input = await loadFixture('input_basic.txt');
      const expected = await loadFixture('expected_basic.txt');

      const result = await runCLI(input);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toBe(expected.trim());
    }, 10000);

    it('should handle case 1 correctly', async () => {
      const input = await loadFixture('input_case1.txt');
      const expected = await loadFixture('expected_case1.txt');

      const result = await runCLI(input);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toBe(expected.trim());
    }, 10000);
  });

  describe('error handling', () => {
    it('should handle various input errors', async () => {
      const input = await loadFixture('input_errors.txt');
      const expected = await loadFixture('expected_errors.txt');

      const result = await runCLI(input);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      
      const outputLines = result.stdout.split('\n');
      const expectedLines = expected.trim().split('\n');

      expect(outputLines).toHaveLength(expectedLines.length);

      for (let i = 0; i < outputLines.length; i++) {
        const output = JSON.parse(outputLines[i]);
        const expectedOutput = JSON.parse(expectedLines[i]);
        expect(output).toEqual(expectedOutput);
      }
    }, 10000);

    it('should handle empty input gracefully', async () => {
      const result = await runCLI('');

      expect(result.code).toBe(0);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
    }, 5000);

    it('should handle invalid JSON gracefully', async () => {
      const result = await runCLI('invalid json\n');

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      
      const output = JSON.parse(result.stdout);
      expect(output).toHaveLength(1);
      expect(output[0].error).toBeTruthy();
      expect(output[0].error.code).toBe('INVALID_JSON');
    }, 5000);
  });

  describe('single line operations', () => {
    it('should handle single buy operation', async () => {
      const input = '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]\n';
      
      const result = await runCLI(input);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      
      const output = JSON.parse(result.stdout);
      expect(output).toEqual([{ tax: 0 }]);
    }, 5000);

    it('should handle profitable sell above threshold', async () => {
      const input = '[{"operation":"buy","unit-cost":10.00,"quantity":1000},{"operation":"sell","unit-cost":25.00,"quantity":1000}]\n';
      
      const result = await runCLI(input);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      
      const output = JSON.parse(result.stdout);
      expect(output).toEqual([
        { tax: 0 },
        { tax: 3000 }
      ]);
    }, 5000);
  });

  describe('CLI behavior', () => {
    it('should exit successfully with valid input', async () => {
      const input = '[{"operation":"buy","unit-cost":10.00,"quantity":1000}]\n';
      
      const result = await runCLI(input);

      expect(result.code).toBe(0);
    }, 5000);

    it('should not crash with malformed input', async () => {
      const input = 'completely invalid input\n';
      
      const result = await runCLI(input);

      expect(result.code).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output[0].error).toBeTruthy();
    }, 5000);
  });

  describe('multiple simulations', () => {
    it('should handle independent simulations correctly', async () => {
      const input = `[{"operation":"buy","unit-cost":10.00,"quantity":1000}]
[{"operation":"buy","unit-cost":20.00,"quantity":500}]
[{"operation":"sell","unit-cost":15.00,"quantity":100}]`;

      const result = await runCLI(input);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe('');
      
      const lines = result.stdout.split('\n');
      expect(lines).toHaveLength(3);
      
      expect(JSON.parse(lines[0])).toEqual([{ tax: 0 }]);
      expect(JSON.parse(lines[1])).toEqual([{ tax: 0 }]);
      
      const thirdResult = JSON.parse(lines[2]);
      expect(thirdResult[0].error).toBeTruthy();
      expect(thirdResult[0].error.code).toBe('SELL_EXCEEDS_POSITION');
    }, 5000);
  });
});
