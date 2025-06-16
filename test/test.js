const autocannon = require("autocannon");
const url = "http://localhost:3000/";

const duration = 10000; // 10 seconds

const instance = autocannon(
  {
    url: url,
    connections: 100,
  },
  (err, result) => {
    if (err) {
      console.log("Error :", err);
    } else {
      console.log("Result :", result);
    }
  }
);


autocannon.track(instance);