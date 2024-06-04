// async handle with promise
const asyncHandlerWP = (fn) => {
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).reject( (err) => next(err))
    }
};

// asycn handle with tryCatch
const asyncHandlerWT = async (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 5000).json({
            success: false,
            message: error.message
        })
    }
};