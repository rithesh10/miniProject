const express = require('express');
const router = express.Router();
const { executeJavaScript, executePython, executeJava } = require('../utils/codeExecutor');

router.post('/', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        output: 'Code and language are required'
      });
    }

    let result;

    switch (language) {
      case 'javascript':
        result = await executeJavaScript(code);
        break;
      case 'python':
        result = await executePython(code);
        break;
      case 'java':
        result = await executeJava(code);
        break;
      default:
        return res.status(400).json({
          success: false,
          output: `Unsupported language: ${language}`
        });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      output: `Server error: ${error.message}`
    });
  }
});

module.exports = router;
