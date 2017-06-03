$('div[class="widget-box widget-color-blue"]').each(function(index,item){
    if(parseInt($(item).data('index'))>2){
        $(item).html('Testimonial '+(index+1)+' by each loop');
    }
});