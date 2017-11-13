# run 
>引入
```
<script src="./js/zChart.js"></script>

```
>容器
```
<div id="root">

</div>

```
>初始化

```
    var data = [
        {date: '2014', value: 10},
        {date: '2015', value: 40},
        {date: '2016', value: 30},
        {date: '2017', value: 90},
        {date: '2018', value: 72},
    ];
    var zChart = new zChart();
    // 初始化图表
    var chart = zChart.init({root: 'root', size: {width: 1000, height: 600}});
    //画线
    chart.line({
        lineColor: '#fb606e',
        data: data,
        xAxis: {name: '日期', unit: '年', color: '#26cab5', dataKey: 'date'},
        yAxis: {name: '值', unit: 'mg', color: '#26cab5', dataKey: 'value'}
    });

```

>效果

 ![image](https://github.com/zlx362211854/zChart/static/examp.png)
