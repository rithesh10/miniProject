const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const File = require('../models/File');

router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find().sort({ createdAt: -1 });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = new Workspace({ name: name || 'My Workspace' });
    await workspace.save();

    const defaultFile = new File({
      name: 'main.js',
      language: 'javascript',
      workspaceId: workspace._id,
      content: `console.log("Hello, World!");`,
    });
    await defaultFile.save();

    workspace.activeFileId = defaultFile._id;
    await workspace.save();

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, activeFileId } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (activeFileId !== undefined) updateData.activeFileId = activeFileId;

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
