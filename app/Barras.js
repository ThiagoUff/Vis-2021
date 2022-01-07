class Barras {
    constructor(config) {
        this.config = config;

        this.svg = null;
        this.margins = null;

        this.xScale = null;
        this.yScale = null;

        this.bars = [];
        this.total = 0;
        this.dataUnits = 0

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
    async loadCSV(file, quantity) {
        let temp = await d3.csv(file, (d) => {
            return {
                x: d[this.config.xValue],
                y: +d[this.config.yValue],
            }
        });
        this.dataUnits = quantity;
        this.total = temp.length;
        temp = temp.slice(0, quantity);

        let xValues = []
        temp.reduce(function (res, value) {
            if (!res[value.x]) {
                res[value.x] = { x: value.x, y: value.y }
                xValues.push(res[value.x])
            }
            res[value.x].y += value.y;
            return res;
        }, {})

        this.bars = xValues.sort((a, b) => {
            return a.y >= b.y ? 1 : -1
        })
    }

    getTotal() {
        return this.total;
    }


    position(rect, x, y) {
        return rect
            .attr("x", x)
            .attr("y", y)
            .attr("height", yScale(0) - y)
            .attr("width", xScale.bandwidth());
    }

    createScales() {
        let xExtent = this.bars.map(function (d) { return d.x; })

        let yExtent = [0, Math.max.apply(Math, this.bars.map((o) => { return o.y }))]

        this.xScale = d3.scaleBand().domain(xExtent).range([0, this.config.width]).padding(0.2);;
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

    renderBars() {
        this.margins.selectAll("rect")
            .data(this.bars)
            .join("rect")
            .attr("x", d => this.xScale(d.x))
            .attr("y", d => this.yScale(d.y))
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => this.config.height - this.yScale(d.y))
            .attr("fill", "steelblue")
    }

    async load(filename, quantity) {
        await this.loadCSV(filename, quantity);
        this.UpdateLabels();
        this.createScales();
        this.UpdateAxis();
        this.renderBars();

    }
}


async function main() {

    let xSelect = document.getElementById("Barraslabel")
    let ySelect = document.getElementById("BarrasValue")
    await PlotBarra(xSelect, ySelect)

    const BarraslabelElement = document.querySelector('#Barraslabel');
    BarraslabelElement.addEventListener('change', async (event) => {
        let xSelect = document.getElementById("Barraslabel")
        let ySelect = document.getElementById("BarrasValue")
        document.getElementById("Barras").innerHTML = "";
        await PlotBarra(xSelect, ySelect)
       
    });


    const BarrasValueElement = document.querySelector('#BarrasValue');
    BarrasValueElement.addEventListener('change', async (event) => {
        let xSelect = document.getElementById("Barraslabel")
        let ySelect = document.getElementById("BarrasValue")
        document.getElementById("Barras").innerHTML = "";
        await PlotBarra(xSelect, ySelect)
    });
}

async function PlotBarra(xSelect, ySelect) {
    let c = { div: '#Barras', width: 800, height: 600, top: 30, left: 50, bottom: 30, right: 30, xValue: xSelect.value, yValue: ySelect.value };

    let plotter = new Barras(c);
    let filename = 'superstore.csv'
    let counter = 1000
    await plotter.load(filename, counter);
    plotter.createScales();
    plotter.createAxis();
    plotter.renderBars();
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
