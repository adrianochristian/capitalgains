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
}
