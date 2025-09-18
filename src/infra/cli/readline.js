import { createInterface } from 'readline';
export class ReadlineUtils {
  async readAllLines() {
    const lines = [];
    
    const readlineInterface = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    return new Promise((resolve, reject) => {
      readlineInterface.on('line', (line) => {
        const trimmed = line.trim();
        if (trimmed !== '') {
          lines.push(trimmed);
        }
      });

      readlineInterface.on('close', () => {
        resolve(lines);
      });

      readlineInterface.on('error', (error) => {
        reject(error);
      });

      process.stdin.on('end', () => {
        readlineInterface.close();
      });
    });
  }

  async readLinesWithCallback(onLine) {
    const readlineInterface = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    return new Promise((resolve, reject) => {
      readlineInterface.on('line', (line) => {
        const trimmed = line.trim();
        if (trimmed !== '') {
          try {
            onLine(trimmed);
          } catch (error) {
            readlineInterface.close();
            reject(error);
            return;
          }
        }
      });

      readlineInterface.on('close', () => {
        resolve();
      });

      readlineInterface.on('error', (error) => {
        reject(error);
      });

      process.stdin.on('end', () => {
        readlineInterface.close();
      });
    });
  }

  hasInputAvailable() {
    return !process.stdin.isTTY || process.stdin.readableLength > 0;
  }

  async readSingleLine(prompt = '') {
    const readlineInterface = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    return new Promise((resolve) => {
      readlineInterface.question(prompt, (line) => {
        readlineInterface.close();
        resolve(line.trim());
      });
    });
  }

  async waitForInput(timeoutMs = 1000) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, timeoutMs);

      const checkInput = () => {
        if (this.hasInputAvailable()) {
          clearTimeout(timeout);
          resolve(true);
        } else {
          setTimeout(checkInput, 10);
        }
      };

      checkInput();
    });
  }
}
