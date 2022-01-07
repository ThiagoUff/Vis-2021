class scatterplots {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;

    this.xScale = null;
    this.yScale = null;

    this.circles = []
    this.total = 0
    this.dataUnits = 0

    this.createSvg();
    this.createMargins();

  }
  async loadCSV(file, quantity) {
    this.circles = await d3.csv(file, d => {
      return {
        cx: +d[this.config.xValue],
        cy: +d[this.config.yValue],
        col: d.Discount,
        cat: d.Category,
        r: 4
      }
    });
    this.dataUnits = quantity;
    this.total = this.circles.length;
    this.circles = this.circles.slice(0, quantity);
  }

  getTotal() {
    return this.total;
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

  position(rect, x, y) {
    return rect
      .attr("x", x)
      .attr("y", y)
      .attr("height", yScale(0) - y)
      .attr("width", xScale.bandwidth());
  }

  createScales() {
    let xExtent = d3.extent(this.circles, d => {
      return d.cx;
    });
    let yExtent = d3.extent(this.circles, d => {
      return d.cy;
    });
    let colExtent = d3.extent(this.circles, d => {
      return d.col;
    });

    const cats = this.circles.map(d => {
      return d.cat;
    });
    let catExtent = d3.union(cats);

    this.xScale = d3.scaleLinear().domain(xExtent).nice().range([0, this.config.width]);
    this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);

    this.colScale = d3.scaleSequential(d3.interpolateOrRd).domain(colExtent);
    this.catScale = d3.scaleOrdinal().domain(catExtent).range(d3.schemeTableau10);
  }

  createAxis() {
    let xAxis = d3.axisBottom(this.xScale)
      .ticks(15);

    let yAxis = d3.axisLeft(this.yScale)
      .ticks(15);

    this.margins
      .append("g")
      .attr("class", "x axisScatter")
      .attr("transform", `translate(0,${this.config.height})`)
      .call(xAxis);

    this.margins
      .append("g")
      .attr("class", "y axisScatter")
      .call(yAxis);
  }
  UpdateAxis() {
    let xAxis = d3.axisBottom(this.xScale)
      .ticks(15);

    let yAxis = d3.axisLeft(this.yScale)
      .ticks(15);

    this.margins
      .selectAll("g.y.axisScatter")
      .call(xAxis);

    this.margins
      .selectAll("g.y.axisScatter")
      .call(yAxis);
  }

  renderCircles() {
    this.margins.selectAll('circle')
      .data(this.circles)
      .join('circle')
      .attr('cx', d => this.xScale(d.cx))
      .attr('cy', d => this.yScale(d.cy))
      .attr('r', d => d.r)
      .attr('fill', d => this.colScale(d.col))
      .attr('fill', d => this.catScale(d.cat));
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

    this.margins.append("text")
      .attr("text-anchor", "end")
      .attr("class", "dataUnits")
      .attr("x", this.config.width - 200)
      .attr("y", this.config.height + this.config.top + 10)
      .text("data units: " + this.dataUnits);
  }

  UpdateLabels() {
    this.margins.select("text.dataUnits")
      .attr("text-anchor", "end")
      .attr("x", this.config.width - 200)
      .attr("y", this.config.height + this.config.top + 10)
      .text("data units: " + this.dataUnits);
  }

  async load(filename, quantity) {
    await this.loadCSV(filename, quantity);
    this.createScales();
    this.UpdateAxis();
    this.UpdateLabels();
    this.renderCircles();
  }
}


async function main() {

  let xSelect = document.getElementById("ScatterPlotslabel")
  let ySelect = document.getElementById("ScatterPlotsValue")
  await PlotScatter(xSelect, ySelect)

  const ScatterPlotslabelElement = document.querySelector('#ScatterPlotslabel');
  ScatterPlotslabelElement.addEventListener('change', async (event) => {
    let xSelect = document.getElementById("ScatterPlotslabel")
    let ySelect = document.getElementById("ScatterPlotsValue")
    document.getElementById("ScatterPlots").innerHTML = "";
    await PlotScatter(xSelect, ySelect)

  });


  const ScatterPlotsValueElement = document.querySelector('#ScatterPlotsValue');
  ScatterPlotsValueElement.addEventListener('change', async (event) => {
    let xSelect = document.getElementById("ScatterPlotslabel")
    let ySelect = document.getElementById("ScatterPlotsValue")
    document.getElementById("ScatterPlots").innerHTML = "";
    await PlotScatter(xSelect, ySelect)
  });
}

async function PlotScatter(xSelect, ySelect) {
  let c = { div: '#ScatterPlots', width: 800, height: 600, top: 30, left: 50, bottom: 30, right: 30, xValue: xSelect.value, yValue: ySelect.value };

  let plotter = new scatterplots(c);
  let filename = 'superstore.csv'
  let counter = 1000
  await plotter.load(filename, counter);
  plotter.createScales();
  plotter.createAxis();
  plotter.renderCircles();
  plotter.renderLabels();
  let limit = plotter.getTotal();

  const interval = async function runner(plot) {
    if (counter > limit)
      clearInterval(refreshId)
    else
      counter += 1000
    await plot.load(filename, counter);
  }

  var refreshId = setInterval(async () => { await interval(plotter) }, 500)

}

main();
