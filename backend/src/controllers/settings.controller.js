const Settings = require('../models/settings.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne();
  res.status(200).json({ success: true, data: settings });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = catchAsync(async (req, res, next) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({ success: true, data: settings });
}); 