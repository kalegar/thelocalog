require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: true,
    url: process.env.DATABASE_URL,
  },    
  test: {
    use_env_variable: true,    
  },    
  production: {
    use_env_variable: true,    
  }
};