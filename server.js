const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// uncaught exception
process.on("uncaughtException",err=>{
    console.log(`error ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);
    process.exit(1);
})

// config
dotenv.config({
    path:"config/config.env"
});

// connecting to database
connectDatabase();

const server = app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})

// unhandled Promise rejection
process.on("unhandledRejection",err=>{
    console.log(`Error:${err.message}`);
    console.log(`Shuttinh down the server due to unhandled Promise Rejection`);

   server.close(()=>{
    process.exit(1);
   })
})