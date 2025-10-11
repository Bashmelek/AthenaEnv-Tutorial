/*
  This is from the readme from the AthenaEnv Github

  https://github.com/DanielSant0s/AthenaEnv/tree/main

  It is Hello World, and you should start here


*/


const font = new Font("default");

os.setInterval(() => { // Basically creates an infinite loop, similar to while true(you can use it too).
  Screen.clear(); // Clear screen for the next frame.
  font.print(0, 0, "Hello World!"); // x, y, text
  Screen.flip(); // Updates the screen.
}, 0);