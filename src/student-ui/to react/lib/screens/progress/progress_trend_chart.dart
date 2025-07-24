import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class ProgressTrendChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;
  final String title;
  final String valueLabel;
  const ProgressTrendChart(
      {Key? key,
      required this.data,
      required this.title,
      this.valueLabel = 'Value'})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const SizedBox.shrink();
    }
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: true),
                  titlesData: FlTitlesData(
                    leftTitles: const AxisTitles(
                      sideTitles: const SideTitles(showTitles: true),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            final index = value.toInt();
                            if (index < 0 || index >= data.length)
                              return const SizedBox.shrink();
                            return Text(data[index]['date'] ?? '',
                                style: const TextStyle(fontSize: 10));
                          }),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: [
                        for (int i = 0; i < data.length; i++)
                          FlSpot(i.toDouble(),
                              (data[i]['value'] as num?)?.toDouble() ?? 0),
                      ],
                      isCurved: true,
                      color: Theme.of(context).primaryColor,
                      barWidth: 3,
                      dotData: const FlDotData(show: false),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(valueLabel, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
