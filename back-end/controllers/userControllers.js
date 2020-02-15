
exports.getMe = (req, res) => {
    res.status(200).json({
        status: 'success',
        state: req.user.status
    })
}