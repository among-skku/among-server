$('#logoutBtn').click(function(e) {
	$.get('/user/logout', function(res) {
		if (res) {
			if (res.err) {
				alert(res.err);
			} else {
				alert(res.result);
				location.href = '/login';
			}
		} else {
			alert('네트워크 에러. 로그아웃에 실패했습니다.');
		}
	});
});
if (typeof moment !== 'undefined') {
	moment.locale('ko');
}