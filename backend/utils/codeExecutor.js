const { VM } = require('vm2');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function executeJavaScript(code) {
  try {
    const vm = new VM({
      timeout: 1000,
      sandbox: {
        console: {
          log: (...args) => {
            return args.join(' ');
          }
        }
      }
    });

    let output = '';
    const consoleOutput = [];

    const sandboxedCode = `
      const console = {
        log: (...args) => {
          __output__.push(args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        }
      };
      const __output__ = [];
      ${code}
      __output__.join('\\n');
    `;

    output = vm.run(sandboxedCode);
    return { success: true, output: output || 'Code executed successfully' };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

async function executePython(code) {
  const tempFile = path.join('/tmp', `code_${Date.now()}.py`);

  try {
    await fs.writeFile(tempFile, code);

    return new Promise((resolve) => {
      exec(`python3 ${tempFile}`, { timeout: 5000 }, async (error, stdout, stderr) => {
        await fs.unlink(tempFile).catch(() => {});

        if (error) {
          if (error.killed) {
            resolve({ success: false, output: 'Execution timeout (5 seconds limit)' });
          } else {
            resolve({ success: false, output: stderr || error.message });
          }
        } else {
          resolve({ success: true, output: stdout || 'Code executed successfully' });
        }
      });
    });
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    return { success: false, output: error.message };
  }
}

async function executeJava(code) {
  const className = extractJavaClassName(code);
  if (!className) {
    return { success: false, output: 'Error: Could not find public class name. Make sure your code contains a public class.' };
  }

  const tempDir = path.join('/tmp', `java_${Date.now()}`);
  const javaFile = path.join(tempDir, `${className}.java`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(javaFile, code);

    const compileResult = await new Promise((resolve) => {
      exec(`javac ${javaFile}`, { timeout: 5000, cwd: tempDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, output: stderr || error.message });
        } else {
          resolve({ success: true });
        }
      });
    });

    if (!compileResult.success) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      return compileResult;
    }

    return new Promise((resolve) => {
      exec(`java ${className}`, { timeout: 5000, cwd: tempDir }, async (error, stdout, stderr) => {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

        if (error) {
          if (error.killed) {
            resolve({ success: false, output: 'Execution timeout (5 seconds limit)' });
          } else {
            resolve({ success: false, output: stderr || error.message });
          }
        } else {
          resolve({ success: true, output: stdout || 'Code executed successfully' });
        }
      });
    });
  } catch (error) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    return { success: false, output: error.message };
  }
}

function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

module.exports = {
  executeJavaScript,
  executePython,
  executeJava,
};
