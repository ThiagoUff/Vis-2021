class Linhas {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;

    this.xScale = null;
    this.yScale = null;

    this.lines = [];

    this.createSvg();
    this.createMargins();

  }

  createSvg() {
    this.svg = d3.select(this.config.div)
      .append("svg")
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', this.config.width + this.config.left + this.config.right + 20)
      .attr('height', this.config.height + this.config.top + this.config.bottom + 20);
  }

  createMargins() {
    this.margins = this.svg
      .append('g')
      .attr("transform", `translate(${this.config.left},${this.config.top})`)
  }
  async loadCSV(file) {
    let temp = await d3.csv(file, (d) => {
      return {
        x1: +d[this.config.xValue],
        y1: +d[this.config.yValue],
      }
    });

    var xPosition = [];
    temp.reduce(function (res, value) {
      if (!res[value.x1]) {
        res[value.x1] = { x1: value.x1, y1: value.y1, qtd: 1, total: value.y1 }
        xPosition.push(res[value.x1])
      }
      res[value.x1].x1 = value.x1;
      res[value.x1].total += value.y1;
      res[value.x1].qtd += 1;
      res[value.x1].y1 = res[value.x1].total / res[value.x1].qtd;
      return res;
    }, {})

    this.lines = [];
    xPosition = xPosition.sort((a, b) => {
      return a.x1 >= b.x1 ? 1 : -1
    })
   
    xPosition.forEach((element, index) => {
     if (index > 0 && index < xPosition.length-1)
        this.lines.push(
          {
            x1: xPosition[index - 1].x1,
            y1: xPosition[index - 1].y1,
            x2: xPosition[index].x1,
            y2: xPosition[index].y1
          })
    });
  }

  position(rect, x, y) {
    return rect
      .attr("x", x)
      .attr("y", y)
      .attr("height", yScale(0) - y)
      .attr("width", xScale.bandwidth());
  }

  createScales() {


    let xExtent = [0, Math.max.apply(Math, this.lines.map((o) => { return o.x1 }))]
    let yExtent = d3.extent(this.lines, d => {
      return d.y1;
    });

    this.xScale = d3.scaleLinear().domain(xExtent).range([0, this.config.width]);
    this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);
  }

  createAxis() {
    let xAxis = d3.axisBottom(this.xScale)
      .ticks(15);

    let yAxis = d3.axisLeft(this.yScale)
      .ticks(15);

    this.margins
      .append("g")
      .attr("class", "x axisLine")
      .attr("transform", `translate(0,${this.config.height})`)
      .call(xAxis);

    this.margins
      .append("g")
      .attr("class", "y axisLine")
      .call(yAxis);
  }
  UpdateAxis() {
    let xAxis = d3.axisBottom(this.xScale)
      .ticks(15);

    let yAxis = d3.axisLeft(this.yScale)
      .ticks(15);

    this.margins
      .selectAll("g.y.axisLine")
      .call(xAxis);

    this.margins
      .selectAll("g.y.axisLine")
      .call(yAxis);
  }

  renderLabels() {
    this.margins.append("text")
        .attr("class", "labelx")
        .attr("text-anchor", "end")
        .attr("x", this.config.width)
        .attr("y", this.config.height + this.config.top + 10)
        .text(this.config.xValue);

    this.margins.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -this.config.left + 11)
        .attr("x", -this.config.top)
        .text(this.config.yValue)
}



  renderLines() {
    this.svg
    .selectAll('line')
    .data(this.lines)
    .enter()  
    .append('line')
    .attr("stroke", "steelblue")
    .style("stroke-width", 1.5)
    .attr("x1", d => this.xScale(d.x1)+50)
    .attr("y1", d => this.yScale(d.y1))
    .attr("x2", d => this.xScale(d.x2)+50)
    .attr("y2", d => this.yScale(d.y2));
  }

}


async function main() {

  let xSelect = document.getElementById("Linhaslabel")
  let ySelect = document.getElementById("LinhasValue")
  await PlotLinha(xSelect, ySelect)

  const LinhaslabelElement = document.querySelector('#Linhaslabel');
  LinhaslabelElement.addEventListener('change', async (event) => {
      let xSelect = document.getElementById("Linhaslabel")
      let ySelect = document.getElementById("LinhasValue")
      document.getElementById("Linhas").innerHTML = "";
      await PlotLinha(xSelect, ySelect)
  });

  const LinhasValueElement = document.querySelector('#LinhasValue');
  LinhasValueElement.addEventListener('change', async (event) => {
      let xSelect = document.getElementById("Linhaslabel")
      let ySelect = document.getElementById("LinhasValue")
      document.getElementById("Linhas").innerHTML = "";
      await PlotLinha(xSelect, ySelect)
  });
}

async function PlotLinha(xSelect, ySelect){
  let c = { div: '#Linhas', width: 800, height: 600, top: 30, left: 50, bottom: 30, right: 30, xValue: xSelect.value, yValue: ySelect.value };

  let plotter = new Linhas(c);
  let filename = 'superstore.csv'
  await plotter.loadCSV(filename);
  plotter.createScales();
  plotter.createAxis();
  plotter.renderLines();
  plotter.renderLabels();
}

main();
