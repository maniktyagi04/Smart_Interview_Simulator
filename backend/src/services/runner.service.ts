import vm from 'vm';
import { spawn } from 'child_process';
import { AppError } from '../middleware/error.middleware';

export class RunnerService {
  static async execute(language: string, code: string): Promise<string> {
    if (language === 'javascript') {
      return this.executeJavaScript(code);
    } else if (language === 'python') {
      return this.executePython(code);
    } else {
      throw new AppError(400, `Unsupported language: ${language}`);
    }
  }

  private static executeJavaScript(code: string): Promise<string> {
    return new Promise((resolve) => {
      const logs: string[] = [];
      const sandbox = {
        console: {
          log: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(' ')),
          error: (...args: unknown[]) => logs.push('ERROR: ' + args.map(a => String(a)).join(' ')),
        },
        setTimeout,
        clearTimeout,
      };

      try {
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox, { timeout: 5000 }); // 5s timeout
        resolve(logs.length ? logs.join('\n') : 'Code executed successfully. No output.');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        resolve((logs.length ? logs.join('\n') + '\n\n' : '') + 'Runtime Error: ' + errorMessage);
      }
    });
  }

  private static executePython(code: string): Promise<string> {
    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', ['-c', code]);

      let output = '';
      let error = '';

      const timeout = setTimeout(() => {
        pythonProcess.kill();
        resolve(output + '\nError: Execution timed out (5s limit).');
      }, 5000);

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output || 'Code executed successfully. No output.');
        } else {
          resolve(output + '\n' + error);
        }
      });

      pythonProcess.on('error', (err) => {
        clearTimeout(timeout);
        resolve('Failed to start Python execution. Is python3 installed?\n' + err.message);
      });
    });
  }
}
