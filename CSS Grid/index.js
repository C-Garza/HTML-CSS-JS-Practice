window.onload = function() {
  let button = document.getElementById("toggle-demo");
  let demo = document.getElementById("demo-grid");
  button.addEventListener("click", function(e) {
    demo.classList.toggle("hidden");
  });
};