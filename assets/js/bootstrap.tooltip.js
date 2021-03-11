$(function () {
  $('[data-toggle="tooltip"]').tooltip({
    title: "<h3>Info</h3><p>Legend of the visualization</p><img src='images/legend.jpg' alt='legend' width='180'>",
    html: true,
    placement: 'left',
    animation: true,
    delay:{
      show:100,
      hide:100
    },
    color: 'white',

  })
})

