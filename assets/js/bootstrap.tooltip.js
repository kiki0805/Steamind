$(function () {
  $('#steamid-info').tooltip({
    title: "<h3>Warning</h3><p>It takes 15~60s.</p><p> You will fire the crawling process for the first time. Go back to fetch the data again after 2 minutes.</p>",
    html: true,
    placement: 'right',
    animation: true,
    delay:{
      show:100,
      hide:100
    },
    color: 'white',
  })
})

