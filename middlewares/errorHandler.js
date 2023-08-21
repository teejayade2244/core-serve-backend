//not found
const notFound = (req, res, next) => {
    const error = new Error(`Not Found : ${req.originalUrl}`)
    res.status(404)
    next(error)
}

//error handler
const errorhandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
        message: err.message,
        stack: err?.stack,
    })
}

module.exports = { errorhandler, notFound }
//Not found
//This middleware is crucial to handle routes that are not
//matched by any defined routes in your application.If a client
//makes a request to a route that doesn't exist, the notFound
// middleware will be invoked, and it will respond with a 404 status code and an error
// message indicating that the requested route is not found.

//error handler
//The errorhandler middleware ensures that any unhandled
//errors in your application will be caught, and an appropriate error response with 
//the correct status code will be sent to the client.
