class Linhas {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;

    this.xScale = null;
    this.yScale = null;

    this.lines = []
    this.total = 0

    this.createSvg();
    this.createMargins();
    
  }
  async loadCSV(file, quantity) {
    let temp = await d3.csv(file, (d) => {
      return {
        x1: +d.Quantity,
        y1: +d.Profit,
      }
    });

    var result = [];
    temp.reduce(function(res, value){
      if(!res[value.x1]){
        res[value.x1] = { x1: value.x1, y1: value.y1, qtd: 1, total: value.y1}
        result.push(res[value.x1])
      }
      res[value.x1].total += value.y1;
      res[value.x1].qtd += 1;
      res[value.x1].y1 += res[value.x1].total / res[value.x1].qtd;
      return res;
    }, {})

    this.lines = [];
    this.total = this.lines.length;
    
    result.forEach((element, index) => {
      if(index > 0)
        this.lines.push(
          {
            x1: result[index-1].x1, 
            y1: result[index-1].y1, 
            x2: result[index].x1, 
            y2: result[index].y1 
          })
    });
    this.lines = this.lines.slice(0, quantity);
  }
  getTotal(){
    return this.total;
  }

  createSvg() {
    this.svg = d3.select(this.config.div)
      .append("svg")
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', this.config.width + this.config.left + this.config.right)
      .attr('height', this.config.height + this.config.top + this.config.bottom);
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
    let xExtent = d3.extent(this.lines, d => {
      return d.x1;
    });
    let yExtent = d3.extent(this.lines, d => {
      return d.y1;
    });

    this.xScale = d3.scaleLinear().domain(xExtent).nice().range([0, this.config.width]);
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

  renderLabels(){
    this.margins.append("text")
    .attr("text-anchor", "end")
    .attr("x", this.config.width)
    .attr("y", this.config.height + this.config.top + 10)
    .text(this.config.labelX);
    
    this.margins.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -this.config.left + 11)
    .attr("x", -this.config.top)
    .text(this.config.labelY)
  }

  renderLines(){
    this.margins.selectAll('line')
          .data(this.lines)
          .join('line')
          .style("stroke", "Black")
          .style("stroke-width", 3)
          .attr("x1", d => this.xScale(d.x1))
          .attr("y1", d => this.yScale(d.y1))
          .attr("x2", d => this.xScale(d.x2))
          .attr("y2", d => this.yScale(d.y2))

  }

  async load(filename, quantity){
    await this.loadCSV(filename, quantity);
    this.createScales();
    this.createAxis();
    this.renderLines();
  }
}


async function main() {
  let c = {div: '#Linhas', width: 800, height: 600, top: 30, left: 50, bottom: 30, right: 30, labelX: "Quantity", labelY:"Profit"};
  
  let plotter = new Linhas(c);
  let filename = 'superstore.csv'
  await plotter.load(filename, 10000);
  plotter.createScales();
  plotter.createAxis();
  plotter.renderLines();
  plotter.renderLabels();
  let limit = plotter.getTotal();

  async function runner(plot){
    for(i=10000; i < limit; i=i+10000){
      await plot.load(filename, i);
    }
  }
  setInterval(await runner(plotter) ,1000)
  


  
}

main();
