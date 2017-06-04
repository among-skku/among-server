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

	///@definition
	var init_calendar = function(calendar_events) {
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
			events: calendar_events,
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
			// ,

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
			timezone: 'Asia/Seoul',
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
													mutable: true,
													id: team_schedule_id,
													title: title,
													start: moment(start_date_obj),
													end: moment(end_date_obj),
													contents: contents,
													place: place,
													tag: tag,
													className: 'label-info'
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
			},
			eventClick: function(calEvent, jsEvent, view) {

				console.log(calEvent); //여기 데이터있음
				if (calEvent && calEvent.mutable) {
					bootbox.dialog({
						title: '이벤트 상세 보기',
						message: [
								   '<div class="bootbox-form">',
									  '<label for="event_title">제목</label>',
									  '<input id="event_title" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" value="' + calEvent.title + '" /><br />',
									'<label for="event_tag">태그</label>',
									  '<input id="event_tag" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" value="' + calEvent.tag + '" /><br />',
									'<label for="event_place">장소</label>',
									  '<input id="event_place" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" value="' + calEvent.place + '" /><br />',
									  '<label for="event_contents">내용</label>',
									  '<textarea class="bootbox-input bootbox-input-text form-control" rows="5" id="event_contents">' + calEvent.contents + '</textarea>',
									'<input type="hidden" value="' + calEvent.id + '">',
								   '</div>',
							].join(''),
						size: 'large',
						closeButton: false,
						onEscape: false,
						buttons: {
							confirm: {
								label: '변경',
								className: 'btn-success',
								callback: function(result) {
									calEvent.title = $("#event_title").val();
									calEvent.tag = $("#event_tag").val();
									calEvent.place = $("#event_place").val();
									calEvent.contents = $("#event_contents").val();

									$.post('/team/schedule/' + window.team_id, {
										team_schedule_id: calEvent.id,
										title: calEvent.title,
										tag: calEvent.tag,
										place: calEvent.place,
										contents: calEvent.contents
									}, function(res) {
										if (res) {
											if (res.err) {
												alert(res.err);
												return false;
											} else {
												alert(res.result);
												calendar.fullCalendar('updateEvent', calEvent);
												return true;
												//modal.modal("hide");
											}
										} else {
											alert('네트워크 에러! 일정 변경에 실패하였습니다.');
											return false;
										}
									});
								}
							},
							delete: {
								label: '삭제',
								className: 'btn-danger',
								callback: function() {
									var schedule_id = calEvent.id;
									$.delete('/team/schedule/' + window.team_id, {
										team_schedule_id: schedule_id
									}, function(res) {
										if (res) {
											if (res.err) {
												alert(res.err);
												return false;
											} else {
												alert(res.result);
												calendar.fullCalendar('removeEvents' , function(ev){
													return (ev._id == calEvent._id);
												});
												return true;
											}
										} else {
											alert('네트워크 에러! 일정 삭제에 실패하였습니다.');
											return false;
										}
									});
								}
							},
							cancel: {
								label: '취소',
								className: 'btn-default'
							}
						}
					});
				} else {
					bootbox.dialog({
						title: '이벤트 상세 보기',
						message: [
								   '<div class="bootbox-form">',
									  '<label for="event_title">제목</label>',
									  '<input id="event_title" class="bootbox-input bootbox-input-text form-control" readonly="true" autocomplete="off" type="text" value="' + calEvent.title + '" /><br />',
		    							'<label for="evt_week_day">요일</label>',
									  '<input id="evt_week_day" class="bootbox-input bootbox-input-text form-control" readonly="true" autocomplete="off" type="text" value="' + new moment().weekday(calEvent.week_day).format('dddd') + '" /><br />',
									'<label for="evt_start_time">시작 시간</label>',
									  '<input id="evt_start_time" class="bootbox-input bootbox-input-text form-control" readonly="true" autocomplete="off" type="time" value="' + calEvent.start.format('HH:mm') + '" /><br />',
									'<label for="evt_end_time">종료 시간</label>',
						    			'<input id="evt_end_time" class="bootbox-input bootbox-input-text form-control" readonly="true" autocomplete="off" type="time" value="' + calEvent.end.format('HH:mm') + '" /><br />',
									'<label for="event_place">장소</label>',
									  '<input id="event_place" class="bootbox-input bootbox-input-text form-control" readonly="true" autocomplete="off" type="text" value="' + calEvent.place + '" /><br />',
									  '<label for="event_contents">내용</label>',
									  '<textarea class="bootbox-input bootbox-input-text form-control" readonly="true" rows="5" id="event_contents">' + calEvent.contents + '</textarea>',
									'<input type="hidden" value="' + calEvent.id + '">',
								   '</div>',
							].join(''),
						size: 'large',
						closeButton: false,
						onEscape: false,
						buttons: {
							cancel: {
								label: '닫기',
								className: 'btn-default'
							}
						}
					});
				}
				
				// //////////////////////////////////////
				// //display a modal
				// var modal_html = [
				// 	'<div class="modal fade">',
				//   '<div class="modal-dialog">',
				//    '<div class="modal-content">',
				// 	'<div class="modal-header">',
				// 		'<button type="button" class="close" data-dismiss="modal">&times;</button>',
				// 		'<h4 class="modal-title">이벤트 상세 보기</h4>',
				// 	'</div>',
				// 	 '<div class="modal-body">',
				// 	   '<div class="">',
				// 		  '<label for="event_title">제목</label>',
				// 		  '<input id="event_title" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" value="' + calEvent.title + '" /><br />',
				// 		'<label for="event_tag">태그</label>',
				// 		  '<input id="event_tag" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" value="' + calEvent.tag + '" /><br />',
				// 		'<label for="event_place">제목</label>',
				// 		  '<input id="event_place" class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" value="' + calEvent.place + '" /><br />',
				// 		  '<label for="event_contents">내용</label>',
				// 		  '<textarea class="bootbox-input bootbox-input-text form-control" rows="5" id="event_contents">' + calEvent.contents + '</textarea>',
				// 		'<input type="hidden" value="' + calEvent.id + '">',
				// 	   '</div>',
				// 	 '</div>',
				// 	 '<div class="modal-footer">',
				// 		 '<button id="modifyBtn" class="btn btn-sm btn-success"><i class="ace-icon fa fa-check"></i> 변경</button>',
				// 		'<button class="btn btn-sm btn-danger" data-action="delete"><i class="ace-icon fa fa-trash-o"></i> 삭제</button>',
				// 		'<button class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> 닫기</button>',
				// 	 '</div>',
				//   '</div>',
				//  '</div>',
				// '</div>'
				// ].join('');


				// var modal = $(modal_html).appendTo('body');
				// modal.find('[id=modifyBtn]').click(function(ev){
				// 	ev.preventDefault();

				// 	calEvent.title = $("#event_title").val();
				// 	calEvent.tag = $("#event_tag").val();
				// 	calEvent.place = $("#event_place").val();
				// 	calEvent.contents = $("#event_contents").val();

				// 	// console.log(calEvent.title);
				// 	// console.log(calEvent.tag);
				// 	// console.log(calEvent.place);
				// 	// console.log(calEvent.contents);

				// 	$.post('/team/schedule/' + window.team_id, {
				// 		team_schedule_id: calEvent.id,
				// 		title: calEvent.title,
				// 		tag: calEvent.tag,
				// 		place: calEvent.place,
				// 		contents: calEvent.contents
				// 	}, function(res) {
				// 		if (res) {
				// 			if (res.err) {
				// 				alert(res.err);
				// 			} else {
				// 				alert(res.result);
				// 				calendar.fullCalendar('updateEvent', calEvent);
				// 				modal.modal("hide");
				// 			}
				// 		} else {
				// 			alert('네트워크 에러! 일정 변경에 실패하였습니다.');
				// 		}
				// 	});
				// });
				// modal.find('button[data-action=delete]').on('click', function() {
				// 	var schedule_id = calEvent.id;

				// 	$.delete('/team/schedule/' + window.team_id, {
				// 		team_schedule_id: schedule_id
				// 	}, function(res) {
				// 		if (res) {
				// 			if (res.err) {
				// 				alert(res.err);
				// 			} else {
				// 				alert(res.result);
				// 				calendar.fullCalendar('removeEvents' , function(ev){
				// 					return (ev._id == calEvent._id);
				// 				});
				// 				modal.modal("hide");
				// 			}
				// 		} else {
				// 			alert('네트워크 에러! 일정 삭제에 실패하였습니다.');
				// 		}
				// 	});
				// });

				// modal.modal('show', function() {
				// 	console.log('왜 내눈앞에 나타나~');
				// });
				// modal.modal('show').on('hidden', function(){
				// // modal.on('hidden', function(){
				// 	console.log('modal 지움!');
				// 	modal.remove();
				// });


				//console.log(calEvent.id);
				//console.log(jsEvent);
				//console.log(view);

				// change the border color just for fun
				//$(this).css('border-color', 'red');

			}

		});
	};
	
	///@definition
	var weekly_event_source = function(start, end, timezone, callback) {
		// When requested, dynamically generate virtual
		// events for every monday and wednesday.
		
		var events = [];

		for (loop = start._d.getTime();
			 loop <= end._d.getTime();
			 loop = loop + (24 * 60 * 60 * 1000)) {

			var test_date = moment(new Date(loop));

			if (window.user_sc) {
				window.user_sc.map(function(user_sc_item) {
					// console.log(user_sc_item);
					var user_id = user_sc_item.user_id;
					var user_name = user_sc_item.user_name;
					user_sc_item.regular_schedule.map(function(sc_data) {
						if (typeof sc_data.day === 'string') {
							var start_hour = sc_data.start_time.split(':')[0];
							var start_min = sc_data.start_time.split(':')[1];
							var end_hour = sc_data.end_time.split(':')[0];
							var end_min = sc_data.end_time.split(':')[1];
							
							var start_moment = new moment(test_date).hour(start_hour).minute(start_min);
							var end_moment = new moment(test_date).hour(end_hour).minute(end_min);
							var day = sc_data.day;
							if (test_date.weekday() == day) {
								events.push({
									mutable: false,
									id: sc_data.schedule_id,
									week_day: day,
									title: user_name + '의 ' + sc_data.title,
									start: start_moment,
									end: end_moment,
									contents: sc_data.contents,
									place: sc_data.place,
									tag: sc_data.tag
								});
							}
						}
					});
					
				});
			}
		} // for loop

		// return events generated
		callback( events );
	};
	
	async.parallel({
		team_schedule: function(cb) {
			$.get('/team/schedule/' + window.team_id, function(res) {
				cb(null, res);
			});
		},
		user_schedule: function(cb) {
			$.get('/team/user_schedule/' + window.team_id, function(res) {
				cb(null, res);
			});
		}
	}, function(err, result) {
		window.team_sc = [];
		result.team_schedule.result.map(function(item) {
			window.team_sc.push({
				mutable: true,
				id: item.team_schedule_id,
				title: item.title,
				start: new Date(item.start_date),
				end: new Date(item.end_date),
				contents: item.contents,
				place: item.place,
				tag: item.tag,
				className: 'label-info'
			});
		});
		window.user_sc = result.user_schedule.result;
		init_calendar(window.team_sc);
		
		window.show_member_schedule = $('#show_member_schedule');
		
		if (show_member_schedule.is(':checked')) {
			$('#calendar').fullCalendar('addEventSource', weekly_event_source);
		}
		
		show_member_schedule.change(function(e) {
			if (this.checked) {
				$('#calendar').fullCalendar('addEventSource', weekly_event_source);
			} else {
				$('#calendar').fullCalendar('removeEventSource', weekly_event_source);
			}
		});
	});
	/*
	$.get('/team/schedule/' + window.team_id, function(res) {

		if (res && res.result) {
			var result = res.result;
			var events = [];
			result.map(function(item) {
				events.push({
					id: item.team_schedule_id,
					title: item.title,
					start: new Date(item.start_date),
					end: new Date(item.end_date),
					contents: item.contents,
					place: item.place,
					tag: item.tag,
					className: 'label-info'
				});
			});
						
			init_calendar(events);
			/////////////////////
			
			window.a = function() {
			$('#calendar').fullCalendar('addEventSource', weekly_event_source);
				
			};
			window.b = function() {
				
			$('#calendar').fullCalendar('removeEventSource', weekly_event_source);
			};
			//////
		}
	});
	*/

	//typeahead.js
	//example taken from plugin's page at: https://twitter.github.io/typeahead.js/examples/
	var invite_btn = $('#invite_btn');
	var invite_user_form = $('#invite_user_form');
	 invite_user_form.typeahead({
		 hint: true,
		 highlight: true,
		 minLength: 1
	 }, {
		 name: 'states',
		 displayKey: 'value',
		 source: function(query, syncResults, asyncResults) {
			 $.get('/user', {
			 	user_id: query
			 }, function(res) {
				 if (res && !res.err && res.result) {
					 asyncResults([res.result]);
				 } else {
					 asyncResults([]);
				 }
			 });
		 },
		 display: function(data) {
			 invite_btn.removeClass('disabled');
			 return data.user_id;
		 },
		 templates: {
			 notFound: function() {
				 invite_btn.addClass('disabled');
				return '일치하는 유저 없음'; 
			 },
			 pendng: '찾는 중',
			empty: [
			  '<div class="empty-message">',
				'unable to find any Best Picture winners that match the current query',
			  '</div>'
			].join('\n'),
			suggestion: function(data) {
				return '<p><strong>' + data.user_name + '</strong> – ' + data.user_id + '<br /><small>(' + data.email + ')</small></p>';
			}
		 },
		 limit: 10
	 });
	
	invite_btn.click(function(e) {
		var dom = $(this);
		if (dom.hasClass('disabled')) {
			//Disabled되었을 경우 동작안함
			return;
		} else {
			var user_id = invite_user_form.val();
			// console.log(user_id);
			$.put('/team/invitations/' + window.team_id, {
				user_id: user_id
			}, function(res) {
				if (res) {
					if (res.err) {
						alert(res.err);
					} else {
						alert(res.result);
						invite_btn.addClass('disabled');
					}
				} else {
					alert('네트워크 에러! 팀원 초대가 실패했습니다.');
				}
			});
		}
	});
});
