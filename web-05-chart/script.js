const ctx = document.getElementById('chart');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      label: 'サンプル',
      data: [10, 20, 15]
    }]
  },
  options: {
    responsive: true
  }
});