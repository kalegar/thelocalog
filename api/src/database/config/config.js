require('dotenv').config();

module.exports = {
  development: {
    use_env_variable: true,
  },    
  test: {
    use_env_variable: true,    
  },    
  production: {
    use_env_variable: true,    
  }
};