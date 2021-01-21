module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "planck32",
    DB: "merchantproto",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}