jQuery(function($) {

/* initialize the external events
	-----------------------------------------------------------------*/

	$('#external-events div.external-event').each(function() {

		// create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
		// it doesn't need to have a start or end
		var eventObject = {
			title: $.trim($(this).text()) // use the element's text as the event title
		};

		// store the Event Object in the DOM element so we can get to it later
		$(this).data('eventObject', eventObject);

		// make the event draggable using jQuery UI
		$(this).draggable({
			zIndex: 999,
			revert: true,      // will cause the event to go back to its
			revertDuration: 0  //  original position after the drag
		});
		
	});




	/* initialize the calendar
	-----------------------------------------------------------------*/

	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
	var y = date.getFullYear();

	$.get('/team/schedule/' + window.team_id, function(res) {

		if (res && res.result && res.result.length > 0) {
			var result = res.result;
			var calendar_events = [];
			result.map(function(item) {
				calendar_events.push({
					id: item.team_schedule_id,
					title: item.title,
					start: new Date(item.start_date),
					end: new Date(item.end_date),
					contents: item.contents,
					place: item.place,
					tag: item.tag
				});
			});
						
			window.calendar = $('#calendar').fullCalendar({
				//isRTL: true,
				//firstDay: 1,// >> change first day of week 
				lang: 'ko',
				buttonHtml: {
					prev: '<i class="ace-icon fa fa-chevron-left"></i>',
					next: '<i class="ace-icon fa fa-chevron-right"></i>'
				},

				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay'
				},
				events: calendar_events
				// events: [
				//   {
				// 	title: 'All Day Event',
				// 	start: new Date(y, m, 1),
				// 	className: 'label-important'
				//   },
				//   {
				// 	title: 'Long Event',
				// 	start: moment().subtract(5, 'days').format('YYYY-MM-DD'),
				// 	end: moment().subtract(1, 'days').format('YYYY-MM-DD'),
				// 	className: 'label-success'
				//   },
				//   {
				// 	title: 'Some Event',
				// 	start: new Date(y, m, d-3, 16, 0),
				// 	allDay: false,
				// 	className: 'label-info'
				//   }
				// ]
				,

				/**eventResize: function(event, delta, revertFunc) {

					alert(event.title + " end is now " + event.end.format());

					if (!confirm("is this okay?")) {
						revertFunc();
					}

				},*/

				editable: true,
				droppable: true, // this allows things to be dropped onto the calendar !!!
				drop: function(date) { // this function is called when something is dropped

					console.log(this);
					// retrieve the dropped element's stored Event Object
					var originalEventObject = $(this).data('eventObject');
					var $extraEventClass = $(this).attr('data-class');


					// we need to copy it, so that multiple events don't have a reference to the same object
					var copiedEventObject = $.extend({}, originalEventObject);

					// assign it the date that was reported
					copiedEventObject.start = date;
					copiedEventObject.allDay = false;
					if($extraEventClass) copiedEventObject['className'] = [$extraEventClass];

					// render the event on the calendar
					// the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
					$('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

					// is the "remove after drop" checkbox checked?
					if ($('#drop-remove').is(':checked')) {
						// if so, remove the element from the "Draggable Events" list
						$(this).remove();
					}

				}
				,
				selectable: true,
				selectHelper: true,
				select: function(start, end, allDay) {
					
					var dialog = bootbox.dialog({
						title: '새 일정 추가',
						message: [
							'<form class="bootbox-form">',
								'제목',
								'<input id="schedule_title" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text">',
								'태그',
								'<input id="schedule_tag" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text">',
								'시작 날짜',
								'<input id="schedule_start_date" class="bootbox-input bootbox-input-date form-control" autocomplete="off" type="date" value="' + start.format('YYYY-MM-DD') +'">',
								'시작 시간',
								'<input id="schedule_start_time" class="bootbox-input bootbox-input-time form-control" autocomplete="off" type="time">',
								'종료 날짜',
								'<input id="schedule_end_date" class="bootbox-input bootbox-input-date form-control" autocomplete="off" type="date" value="' + end.subtract(1, 'days').format('YYYY-MM-DD') + '">',
								'종료 시간',
								'<input id="schedule_end_time" class="bootbox-input bootbox-input-time form-control" autocomplete="off" type="time">',
								'장소',
								'<input id="schedule_place" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text">',
								'일정 내용',
								'<textarea id="schedule_contents" class="bootbox-input bootbox-input-textarea form-control"></textarea>',
							'</form>'
								 ].join(''),
						size: 'large',
						closeButton: false,
						onEscape: false,
						inpuType: 'date',
						buttons: {
							confirm: {
								label: '저장',
								className: 'btn-success',
								callback: function(result) {
									var title = $('#schedule_title').val();
									var tag = $('#schedule_tag').val();
									var start_date = $('#schedule_start_date').val();
									var start_time = $('#schedule_start_time').val();
									var end_date = $('#schedule_end_date').val();
									var end_time = $('#schedule_end_time').val();
									var place = $('#schedule_place').val();
									var contents = $('#schedule_contents').val();
									
									if (!title || !tag || !start_date || !start_time || !end_date || !end_time || !place || !contents) {
										alert('모든 값을 기입해주세요');
										return false;
									}
									var start_date_obj = new Date(start_date + " " + start_time);
									var end_date_obj = new Date(end_date + " " + end_time);

									$.put('/team/schedule/' + team_id, {
										tag: tag, 
										place: place,
										title: title,
										contents: contents,
										start_date: start_date_obj.getTime(),
										end_date: end_date_obj.getTime()
									}, function(res) {
										if (res) {
											if (res.err) {
												alert(res.err);
												return false;
											} else {
												alert(res.result);
												var team_schedule_id = res.team_schedule_id;

												calendar.fullCalendar('renderEvent',
													{
														id: team_schedule_id,
														title: title,
														start: start_date_obj.toString(),
														end: end_date_obj.toString(),
														contents: contents,
														place: place,
														tag: tag,
														// className: 'label-info'
													},
													true // make the event "stick"
												);
												calendar.fullCalendar('unselect');
												return true;
											}
										} else {
											alert('네트워크 에러! 정상적으로 팀 일정을 추가하지 못했습니다.');
											return false;
										}
									});
								}
							},
							cancel: {
								label: '취소',
								className: 'btn-danger'
							}
						}
					});
					
					///// 날짜 선택해서 추가할거임
					// bootbox.prompt("New Event Title:", function(title) {
					// 	if (title !== null) {
					// 		calendar.fullCalendar('renderEvent',
					// 			{
					// 				title: title,
					// 				start: start,
					// 				end: end,
					// 				allDay: allDay,
					// 				className: 'label-info'
					// 			},
					// 			true // make the event "stick"
					// 		);
					// 	}
					// });


					// calendar.fullCalendar('unselect');
				}
				,
				eventClick: function(calEvent, jsEvent, view) {

					console.log(calEvent);
					console.log(jsEvent);
					console.log(view);
					//display a modal
					var modal = 
					'<div class="modal fade">\
					  <div class="modal-dialog">\
					   <div class="modal-content">\
						 <div class="modal-body">\
						   <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
						   <form class="no-margin">\
							  <label>Change event name &nbsp;</label>\
							  <input class="middle" autocomplete="off" type="text" value="' + calEvent.title + '" />\
							 <button type="submit" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> Save</button>\
						   </form>\
						 </div>\
						 <div class="modal-footer">\
							<button type="button" class="btn btn-sm btn-danger" data-action="delete"><i class="ace-icon fa fa-trash-o"></i> Delete Event</button>\
							<button type="button" class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
						 </div>\
					  </div>\
					 </div>\
					</div>';


					var modal = $(modal).appendTo('body');
					modal.find('form').on('submit', function(ev){
						ev.preventDefault();

						calEvent.title = $(this).find("input[type=text]").val();
						calendar.fullCalendar('updateEvent', calEvent);
						modal.modal("hide");
					});
					modal.find('button[data-action=delete]').on('click', function() {
						calendar.fullCalendar('removeEvents' , function(ev){
							return (ev._id == calEvent._id);
						})
						modal.modal("hide");
					});

					modal.modal('show').on('hidden', function(){
						modal.remove();
					});


					//console.log(calEvent.id);
					//console.log(jsEvent);
					//console.log(view);

					// change the border color just for fun
					//$(this).css('border-color', 'red');

				}

			});
		}
	});



})