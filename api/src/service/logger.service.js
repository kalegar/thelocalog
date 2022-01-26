import winston from "winston";

const filter = level => winston.format((info) => {
    if (info.level === level) {
        return info;
    }
})();

const levels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    http: 5
}

const transports = [
    new winston.transports.File({
        filename: 'error.log',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(),winston.format.json())
    }),
    // create a logging target for logs of different levels
    new winston.transports.File({
        filename: "combined.log",
        level: "info",
        // use simple form
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple()
        )
    }),
    // create a logging target for HTTP logs
    new winston.transports.File({
        filename: "http.log",
        level: "http",
        // process only HTTP logs
        format: filter("http"),
    }),
    // create a logging target for debug logs
    new winston.transports.Console({
        level: "debug",
        // specify format for the target
        format: winston.format.combine(
        // process only debug logs
        filter("debug"),
        // colorize the output
        winston.format.colorize(),
        // add a timestamp
        winston.format.timestamp(),
        // use simple form
        winston.format.simple()
        )
    })
]

const logger = winston.createLogger({
    levels,
    transports
});

export default logger;