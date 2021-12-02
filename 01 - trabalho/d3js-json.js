class Eixos {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margins = null;

    this.xScale = null;
    this.yScale = null;
    this.colNum = null;
    this.squares = [];

    this.gerenateData();
    this.createSvg();
    this.createMargins();
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



  createScales() {
    let xExtent = d3.extent(this.squares, d => {
      return d.x;
    });
    let yExtent = d3.extent(this.squares, d => {
      return d.y;
    });
    let colExtent = d3.extent(this.squares, d => {
      return d.l;
    });

    this.xScale = d3.scaleLinear().domain(xExtent).nice().range([0, this.config.width]);
    this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);

    this.colScale = d3.scaleSequential(d3.interpolateOrRd).domain(colExtent);
   }

  createAxis() {
    let xAxis = d3.axisBottom(this.xScale)
      .ticks(15);

    let yAxis = d3.axisLeft(this.yScale)
      .ticks(15);

    this.margins
      .append("g")
      .attr("transform", `translate(0,${this.config.height})`)
      .call(xAxis);

    this.margins
      .append("g")
      .call(yAxis);
  }

  createSquares() {

  this.margins.selectAll('rect')
      .data(this.squares)
      .join(
        // enter
        en => en.append('rect')
        .style('fill', 'RoyalBlue'),
        
        // update
        up => up.style('fill', 'RoyalBlue'),
      )
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width' , d => d.l)
      .attr('height', d => d.y)
  }

  gerenateData(){
    this.colNum = Math.floor(Math.random() * 50);
    
    for (let s=0; s < this.colNum; s++) {
      const square = {
        x: this.config.left + (s * 50),
        y: this.config.top + (Math.random()*600),
        l: 20
      }
      this.squares.push(square);
    }

  }
}


async function main() {
  let c = {div: '#main', width: 800, height: 600, top: 30, left: 50, bottom: 30, right: 30};
  
  let a = new Eixos(c);
  let filename = '../00 - datasets/superstore.csv'

  //await a.loadCSV(filename);
  
  a.createScales();
  a.createAxis();
  a.createSquares();
}

main();
