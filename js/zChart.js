var zChart = function () {
    this.initSize = {width: '600px', height: '400px'};
    this.rootStyle = {border: '1px solid #d8d8d8', padding: '20px'};
    this.offset = 40;
    this.textAlign = 'center';
    this.textColor = '#333';
    this.lineColor = '#333';
    this.fontStyle = "400 14px Arial";
    this.scaleLength = 10;
    this.root = null;
    this.chart = null;
    this.chartCtx = null;


    this.init = function (options) {
        var size = options.size;
        if (!size) {
            size = this.initSize
        }
        var chart = this.chart;

        chart = document.createElement('canvas'); // 生成canvas标签

        // 设置长宽
        Object.keys(size).forEach(attr => {
            this[attr] = size[attr];
            chart.setAttribute(attr, size[attr]);
        });

        this.chartCtx = chart.getContext("2d");
        this.root = document.getElementById(options.root).appendChild(chart);
        this.style();
        return this;
    };

    this.style = function (style) {
        if (!style) {
            style = this.rootStyle;
        }
        if (style) {
            Object.keys(style).forEach(attr => {
                this.root.style[attr] = style[attr];
            });
        }
        return this;
    };

    this.xAxis = function (options) {
        var w = this.width;
        var h = this.height;

        var offset = this.offset;
        var d1 = [0, h - offset];
        var d2 = [w, h - offset];

        var dataKey = options.dataKey;
        this.xAxisKey = dataKey;
        this.xAxisDot = {d1: d1, d2: d2}; // 构成x轴线的两点坐标
        this.drawLine(d1, d2, options)
    };

    this.yAxis = function (options) {
        var h = this.height;
        var offset = this.offset;
        var d1 = [0 + offset, h];
        var d2 = [0 + offset, 0];

        var dataKey = options.dataKey;
        this.yAxisKey = dataKey;
        this.yAxisDot = {d1: d1, d2: d2}; // 构成y轴线的两点坐标
        this.drawLine(d1, d2, options)
    };

    this.line = function (options) {
        var data = options.data,
            lineColor = options.lineColor,
            xAxis = options.xAxis,
            yAxis = options.yAxis;

        var xAxisKey = xAxis.dataKey; // x坐标轴dataKey
        var yAxisKey = yAxis.dataKey;// y坐标轴dataKey
        this.xAxis(options.xAxis);
        this.yAxis(options.yAxis);
        // 计算y轴
        var computed = this.computeData(data, yAxisKey, 'y');
        if (computed) {
            var dotX = this.dotX;
            var dotY = this.dotY;
            for (var i = 0; i < dotX.length - 1; i++) {
                this.drawLine([dotX[i][0], dotY[i][1]], [dotX[i + 1][0], dotY[i + 1][1]], {color: lineColor})
            }
            // 渲染刻度
            var rendered = this.renderScale(data);
            // 刻度文字
            if (rendered) {
                this.write(data, xAxisKey, yAxisKey);
            }
        }
    }
};

zChart.prototype.drawLine = function (d1, d2, options) {
    var color = this.lineColor;
    if (options && options.color) {
        color = options.color;
    }
    var ctx = this.chartCtx;
    ctx.beginPath(); // 开始路径绘制
    ctx.moveTo(d1[0], d1[1]); // 设置路径起点，坐标为(x,y)
    ctx.lineTo(d2[0], d2[1]); // 绘制一条到(x1,y1)的直线
    ctx.lineWidth = 1; // 设置线宽
    ctx.strokeStyle = color; // 设置线的颜色
    ctx.stroke(); // 进行线的着色
};

zChart.prototype.computeData = function (data, dataKey, axis) {
    var length,
        max = 0,
        sum = 0,
        w = this.width,
        h = this.height,
        offset = this.offset;
    if (data) {
        length = data.length;
        data.forEach(i => {
            max = i[dataKey] > max ? i[dataKey] : max;
            sum += i[dataKey];
        });
        this[`${axis}Max`] = max;
        var len = this.height / this.yMax;
        var skipx = w / (length - 1); // x轴点间距
        var skipy = h / (length - 1); // y轴点间距

        var xAxisDot = this.xAxisDot;
        var yAxisDot = this.yAxisDot;
        var dotX = [[xAxisDot.d1[0] + offset, xAxisDot.d1[1]]];
        var dotY = [[yAxisDot.d1[0], h - len * data[0][dataKey] - offset]];
        for (var i = 1; i < length; i++) {
            dotX.push([xAxisDot.d1[0] + skipx * i, xAxisDot.d1[1]]);
            dotY.push([yAxisDot.d1[0], h - len * data[i][dataKey]]);
        }
        this.skipx = skipx;
        this.skipy = skipy;
        this.dotX = dotX;
        this.dotY = dotY;
        return true;
    }
};

zChart.prototype.renderScale = function (data) {
    var skipx = this.skipx,
        skipy = this.skipy,
        h = this.height,
        offset = this.offset,
        scaleLength = this.scaleLength;

    var scaleDotX = [], scaleDotY = [];
    for (var i = 0; i < data.length; i++) {
        scaleDotY.push([[offset, i === 0 ? h - skipy * i - offset : h - skipy * i], [offset + scaleLength, i === 0 ? h - skipy * i - offset : h - skipy * i]]);
        scaleDotX.push([[i === 0 ? skipx * i + offset : skipx * i, h - offset], [i === 0 ? skipx * i + offset : skipx * i, h - scaleLength - offset]])
    }
    scaleDotX.forEach(i => {
        this.drawLine(i[0], i[1]);
    });
    scaleDotY.forEach(i => {
        this.drawLine(i[0], i[1]);
    });
    this.scaleDotX = scaleDotX;
    this.scaleDotY = scaleDotY;
    return true;
};

zChart.prototype.write = function (data, xAxisKey) {
    var scaleDotX = this.scaleDotX,
        scaleDotY = this.scaleDotY,
        ctx = this.chartCtx,
        scaleLength = this.scaleLength,
        textAlign = this.textAlign,
        fontStyle = this.fontStyle,
        textColor = this.textColor,
        skipy = this.skipy;
    // 设置字体
    ctx.font = fontStyle;
    // 设置对齐方式
    ctx.textAlign = textAlign;
    // 设置填充颜色
    ctx.fillStyle = textColor;
    // 设置字体内容，以及在画布上的位置
    scaleDotX.forEach((i, index) => {
        ctx.fillText(data[index][xAxisKey], i[0][0], i[0][1] + scaleLength * 2);
    });

    scaleDotY.forEach((i, index) => {
        ctx.fillText(`${0 + index * skipy}`, i[0][0] - scaleLength, i[0][1] + scaleLength / 2);
    });
};