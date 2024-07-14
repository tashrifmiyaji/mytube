// async handle with promise
const asyncHandlerWP = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };
};

// async handle with tryCatch
const asyncHandlerWT = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 5000).json({
            success: false,
            message: error.message,
        });
    }
};

export { asyncHandlerWP, asyncHandlerWT };
