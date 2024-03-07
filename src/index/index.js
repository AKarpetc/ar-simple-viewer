window.onload = (event) => {
  var ul = document.getElementById("list");
  async function GetModels() {
    const response = await fetch("https://api-gw.dev.homeoutside.com/armodels");
    const models = await response.json();

    for (var i = 0; i < models.length; i++) {
      var li = document.createElement("li");

      var block = document.createElement("span");
      var a = document.createElement("a");
      a.href = "viewer.html?src=" + models[i].androidUrl + "&ios-src=" + models[i].iosUrl + "&name=" + models[i].name.trim()
      a.innerText = " | viewer ";

      var conf = document.createElement("a");
      conf.href = "arconfigurator.html?android=" + models[i].androidUrl + "&ios=" + models[i].iosUrl + "&name=" + models[i].name.trim()
      conf.innerText = models[i].name;

      block.append(conf)
      block.append(a)

      li.append(block);
      ul.append(li);
    }
  }
  GetModels();
}
