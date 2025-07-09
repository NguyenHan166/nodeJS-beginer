const app = require("./src/app");

const PORT = process.env.PORT || 3305;

const server = app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
})  


// process.on("SIGINT" , () => {
//     server.close( () => console.log("Server is shutting down..."));
// }) // when we press ctrl + c, the server will close gracefully