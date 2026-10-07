import express from 'express';
import { Timetable } from '../models/Timetable.js';

const router = express.Router();

// GET /api/timetable - Get all timetables or filter by batch
router.get('/', async (req, res) => {
  try {
    const { batch } = req.query;
    const query = {};
    if (batch) {
      query.batch = batch.toUpperCase();
    }
    const timetables = await Timetable.find(query);
    res.json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/timetable/:batch - Get timetable for specific batch (e.g. CP1, CP2, CP3)
router.get('/:batch', async (req, res) => {
  try {
    const batchUpper = req.params.batch.toUpperCase();
    const timetable = await Timetable.findOne({ batch: batchUpper });
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: `Timetable not found for batch ${batchUpper}`
      });
    }
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/timetable - Create or replace timetable for a batch
router.post('/', async (req, res) => {
  try {
    const { batch } = req.body;
    if (!batch) {
      return res.status(400).json({ success: false, message: 'Batch is required' });
    }

    const batchUpper = batch.toUpperCase();
    const updated = await Timetable.findOneAndUpdate(
      { batch: batchUpper },
      { ...req.body, batch: batchUpper },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Timetable for batch ${batchUpper} saved successfully`,
      data: updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/timetable/:batch - Update batch timetable
router.put('/:batch', async (req, res) => {
  try {
    const batchUpper = req.params.batch.toUpperCase();
    const updated = await Timetable.findOneAndUpdate(
      { batch: batchUpper },
      { ...req.body, batch: batchUpper },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Timetable not found for batch ${batchUpper}`
      });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/timetable/:batch - Delete batch timetable
router.delete('/:batch', async (req, res) => {
  try {
    const batchUpper = req.params.batch.toUpperCase();
    const deleted = await Timetable.findOneAndDelete({ batch: batchUpper });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Timetable not found for batch ${batchUpper}`
      });
    }
    res.json({ success: true, message: `Timetable for ${batchUpper} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
