(function ($, wangEditor) {
	var gUrl = 'http://127.0.0.1:8081/'; // 后台接口服务地址
	var getMailListUrl = gUrl + 'interface.do?type=get&protocol=imap&action=mail&server='+ getServer() +'&box=INBOX&account='+getAccount(); // 获取邮件列表的接口
	var getBadgeUrl = gUrl + 'interface.do?type=get&protocol=imap&action=badge&server='+ getServer() +'&account='+getAccount(); //获取邮件数目的接口 
	var getBoxListUrl = gUrl + 'interface.do?type=get&protocol=imap&action=mail&server='+ getServer() +'&account='+getAccount()+'&box=';
	var sendMailUrl = gUrl + 'interface.do'; // 发送邮件的接口
	var moveMailUrl = gUrl + 'move.do'; // 移动邮件的接口
	var fromAccount = "1129101102@qq.com";
	var currentBoxType = "INBOX"; // 初始化当前邮件所在文件夹
	var $editor = null; // wangEditor实例
	var PASSWORD = 'vvvxxx'; // 测试邮件的密码， 联网测试时候再填写，不要merge这一行！
	// 样例配置信息
	var CONFIG = {
		PAGE_SIZE : 5, // 每页显示的邮件数
		LIMIT : 5, // 预览
		PREVIEW_COLLAPSE_INDEX : 1, // 邮件概要的收缩起始索引
		demoData : {
			INBOX : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					subject : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题2',
					content : '测试邮件内容2',
					desc : '测试邮件内容描述2'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:25',
					title : '测试邮件标题3',
					content : '测试邮件内容3<br>附件是您的录用OFFER， 请查收，谢谢<br><a href="http://www.baidu.com" target="_blank">点击这里</a><br>祝你好运',
					desc : '测试邮件内容描述3'
				},{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题4',
					content : '测试邮件内容4',
					desc : '测试邮件内容描述4'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题5',
					content : '测试邮件内容5<br>附件是您的录用OFFER， 请查收，谢谢<br><a href="http://www.baidu.com" target="_blank">点击这里</a><br>祝你好运',
					desc : '测试邮件内容描述5'
				}],
			SENDBOX : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					title : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题2',
					content : '测试邮件内容2',
					desc : '测试邮件内容描述2'
				}],
			DRAFT : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					title : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				},
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:22',
					title : '测试邮件标题2',
					content : '测试邮件内容2',
					desc : '测试邮件内容描述2'
				}],
			TRASH : [
				{
					from : "289202839@qq.com",
					to : "289202830@qq.com",
					date : '2016-01-23 23:34:21',
					title : '测试邮件标题1',
					content : '测试邮件内容1',
					desc : '测试邮件内容描述1'
				}]
		}
	};

	// 邮件类型数据结构
	var BOX_TYPE = {
		SENDBOX : 0,
		DRAFT : 1,
		TRASH : 2,
		INBOX : 3
	};

	var BOX_NAME = {
		INBOX : "收件箱",
		SENDBOX : "发件箱",
		DRAFT : "草稿箱",
		TRASH : "垃圾箱"
	}


	function Mail () {};

	// 扩展邮件类的原型方法
	Mail.prototype = {
		constructor : Mail,
		send : function (data) {
			// 发送邮件
			sendMail(data);
		},
		del : function (src, messageSource) {
			// if (isArray(id)) {
			// 	// 批量删除邮件, 也可只为数组传入一个邮件id进行删除
			// } else {
			// 	// 单独删除
			// }
			deleteMail(src, messageSource);
		},
		save : function (src, target, messageSource) {
			// 存入草稿箱，直接调用移动的接口，见moveTo
		},
		moveTo : function (src, target, messageSource) {
			// messageSource 的数据结构为 1:1或者，1:4， 在调用前把messageSource组装好
			// SENDBOX
			// DRAFT
			// TRASH
			moveMail(src, target, messageSource);
		}
	};


	/**
	 * [getAccount 获取当前的帐户参数]
	 * @return {[type]} [description]
	 */
	function getAccount () {
		return getQueryString('account');
	}

	/**
	 * [getServer 获取当前的邮箱服务器]
	 * @return {[type]} [description]
	 */
	function getServer () {
		return getQueryString('server');
	}


	/**
	 * [getMailList 获取当前邮箱下的邮件列表]
	 * @return {[Deffered]} [延迟对象]
	 */
	function getMailList () {
		return $.ajax({
			url : getMailListUrl,
			type : 'GET'
		})
	}

	/**
	 * [decorationMailContents 修饰邮件的概要信息]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	function decorationMailContents (data) {
		for (var i = 0, mail; mail = data[i++];) {
			var content  = '日期：' + mail.date;
				content += '<br>发件人：' + mail.from;
				content += '<br>收件人：' + mail.to;
				content += '<br>主题：'  + mail.subject;

			mail.content = content;
			mail.desc = content;
		}
		return data;
	}


	/**
	 * [MailApp 邮箱客户端类]
	 */
	function MailApp (){};

	// 扩展邮箱客户端类的原型方法
	MailApp.prototype = {
		constructor : MailApp,
		init : function () {
			var that = this;
			this.mailer = new Mail();

			// 初始化邮箱信息时， 给出警示信息
			$('#statusAlert').fadeIn('slow');
			initBadges(function () {
				that.initBox('INBOX', function () {
					that.bindEvents();
					$('#statusAlert').fadeOut('slow');

					initPagination();
				});
			});

			// 初始化富文本编辑器
			$editor = new wangEditor('toolbar');
			$editor.create();
		}, 
		initBox : function (boxName, callback) {
			var boxUrl = getBoxListUrl + boxName;
			$.ajax({
				url : boxUrl,
				cache : false,
				type : 'GET',
				success : function (list) {
					console.log('list', list);
					// 刷新缓存数据
					CONFIG.demoData[boxName] = decorationMailContents(list);

					// 初始化当前的邮件列表
					initMailList(CONFIG.demoData[boxName], BOX_TYPE[boxName], 1, CONFIG.PAGE_SIZE);
					
					// 初始化当前的邮件概要
					initMailPreview(CONFIG.demoData[boxName], BOX_TYPE[boxName], 1, CONFIG.PAGE_SIZE, 3);
				}
			}).done(function () {
				callback && callback();
			});
		},
		initBoxAndPage : function (boxName, json, callback) {
			var pageNo = json['pageno'];
			var pageSize = json['pagesize'];
			var boxUrl = getBoxListUrl + boxName + "&pageno=" + pageNo + '&pagesize=' + pageSize;
			$.ajax({
				url : boxUrl,
				cache : false,
				type : 'GET',
				success : function (list) {
					// 刷新缓存数据
					CONFIG.demoData[boxName] = decorationMailContents(list);

					// 初始化当前的邮件列表
					initMailList(CONFIG.demoData[boxName], BOX_TYPE[boxName], pageNo, pageSize);
					
					// 初始化当前的邮件概要
					initMailPreview(CONFIG.demoData[boxName], BOX_TYPE[boxName], pageNo, pageSize, 3);
				}
			}).done(function () {
				callback && callback();
			});
		},
		bindEvents : function () {
			var that = this;
			
			// 写邮件的按钮事件
			var $writeModal = $('#writeModal');
			$('#writeMail').on('click', function () {
				$writeModal.modal('show');

				// test
				if (!$writeModal.data('send-mail')) {
					$writeModal.data('send-mail', true);

					$('.send-mail').on('click', function () {
						var mailOption = constructMail($writeModal);

						if (!mailOption) {
							alert('请检查您的输入');
						} else {
							APP.getMailInstance().send(mailOption);

							$writeModal.modal('hide');
						}
					});
				}
			});

			// $('#refresh').on('click', function () {
			// 	try {
			// 		window.reload();
			// 	} catch (e) {
			// 		window.location.href = window.location.href;
			// 	}
			// });

			// 刷新、收取邮件的按钮事件
			$('#recvMail').on('click', function () {
				$('#statusAlert').fadeIn('slow');
				$('.main-body').hide();


				initBadges();
				that.initBox('INBOX', function () {
					$('#statusAlert').fadeOut('slow');
					$('.main-body').fadeIn('slow');
				});
			});


			// 删除邮件的按钮事件
			$('#delMail').on('click', function () {
				var srcType = currentBoxType || "INBOX";
				
				if (!$('.list-group-item.active').length) {
					alert('请选择要操作的邮件');
					return;
				}

				if ($('.list-group-item.active').length > 1) {
					alert('测试阶段只支持操作一个邮件，请检查');
					return;
				}

				if (confirm('是否要删除邮件？')) {
					var from = $('.list-group-item.active').attr('data-id');
					var messageSource = from + ':' + from;

					APP.getMailInstance().del(srcType, messageSource);
				}
			});

			$('#logout').on('click', function () {
				if (confirm('确定要退出？')) {
					window.location.href = 'http://127.0.0.1:8080/src/proxy.html';
				}
			});

			// 打开邮件详情的按钮事件
			var $viewModal = $('#viewModal');
			$(document).on('click', '.mail-detail', function (ev) {

				var $current = $(ev.currentTarget);
				var mailId = $current.attr('data-id');
				$viewModal.modal('show');

				var targetMail = fetchMailById(mailId);
				if (targetMail) {
					loadMail(targetMail, $viewModal);
				}
			});

			// 移动邮件的按钮事件
			$(document).on('click', '.dropdown-menu-item', function (ev) {
				var $current = $(ev.currentTarget);
				var targetType = $current.attr('data-target');
				var srcType = currentBoxType || "INBOX";
				
				if (!$('.list-group-item.active').length) {
					alert('请选择要操作的邮件');
					return;
				}

				if ($('.list-group-item.active').length > 1) {
					alert('测试阶段只支持操作一个邮件，请检查');
					return;
				}

				if (confirm('是否要移动邮件？')) {
					var from = $('.list-group-item.active').attr('data-id');
					var messageSource = from + ':' + from;

					if (srcType == targetType) {
						return;
					}
					APP.getMailInstance().moveTo(srcType, targetType, messageSource);
				}
			});

			// 邮件选中状态的切换事件
			$(document).on('click', '.list-group-item', function (ev) {
				
				$(ev.currentTarget).toggleClass('active');
			});

			// 全选当前页的邮件
			$('#selectAll').on('click', function () {
				$('.mail-list').find('.list-group-item').addClass('active');
			});

			// 取消全选当前页的邮件
			$('#cancelAll').on('click', function () {
				$('.mail-list').find('.list-group-item').removeClass('active');
			});

			// 显示不同文件夹内的邮件列表
			$('.badge-list').on('click', 'li', function (ev) {
				var $current = $(ev.currentTarget);
				currentBoxType = $current.find('span').attr('data-type');
				if (!$current.hasClass('active')) {
					$('.badge-list>li').removeClass('active');
					$current.addClass('active');
					$('#statusAlert').fadeIn('slow');
					that.initBox(currentBoxType, function () {
						$('#statusAlert').fadeOut('slow');

						switchCurrentBox();
						initPagination();
					});
				}
			});
		},
		getMailInstance : function () {
			// 获取邮件实例
			return this.mailer;
		}
	};


	// 邮箱客户端实例初始化
	var APP = new MailApp();
	APP.init();


	function switchCurrentBox () {
		$('.current-box').text(BOX_NAME[currentBoxType]);
	}
	/**
	 * [constructMail 构建邮件的数据结构]
	 * @param  {[type]} $ctx [模态窗口上下文]
	 * @return {[type]}      [description]
	 */
	function constructMail ($ctx) {
		var $title = $ctx.find('input[id="subject"]');
		var $to = $ctx.find('input[id="to"]');
		var $content = $('#toolbar');
		var mailTitle = $title.val();
		var mailTo = $to.val();
		var mailContent = $editor.$txt.html(); // 由wangEditor实例返回，可能有特殊字符，过滤下
		
		$('.error').removeClass('error');

		if (!mailTo) {
			$to.addClass('error');
			$to.focus();
			return null;
		}

		if (!mailTitle) {
			$title.addClass('error');
			$title.focus();
			return null;
		}

		if (!$editor.$txt.text()) {
			$('.wangEditor-container').addClass('error');
			$content.focus();
			return null;
		}
		// 组装最终的数据结构
		var mailOption = {
			action : "SEND",
			account : getAccount(),
			server : getServer(),
			subject : mailTitle,
			from : fromAccount,
			to : mailTo,
			content : mailContent,
			date : new Date()
		};
		return mailOption;
	}

	/**
	 * [fetchMailList 获取邮件列表]
	 * @return {[type]} [description]
	 */
	function fetchMailList () {
		// 这里要连接服务器取得邮件信息，连接会因为网络的原因搞得太麻烦
		// 后台先用node接口/或静态数据模拟，最后拼装
		
		return badgeListJson
	}


	/**
	 * [initBadges 初始化各个文件夹内的邮件数]
	 * @return {[type]} [description]
	 */
	function initBadges (callback) {
		$.ajax({
			url : getBadgeUrl,
			type : "GET",
			cache : false,
			success : function (data) {
				var $badgeList = $('.badge-list');
				$badgeList.find('.badge[data-type="INBOX"]').text(data.INBOX.total);
				$badgeList.find('.badge[data-type="SENDBOX"]').text(data.SENDBOX.total);
				$badgeList.find('.badge[data-type="TRASH"]').text(data.TRASH.total);
				$badgeList.find('.badge[data-type="DRAFT"]').text(data.DRAFT.total);

				callback && callback();
			}
		});
	}


	/**
	 * [initMailList 分页显示邮件列表]
	 * @param  {[type]} list     [邮件列表]
	 * @param  {[type]} boxType  [邮件类型]
	 * @param  {[type]} pageNo   [当前页数]
	 * @param  {[type]} pageSize [显示条数]
	 * @return {[type]}          [description]
	 */
	function initMailList (list, boxType, pageNo, pageSize) {
		var $container = $('.mail-list');
		var tpl = '';
		for (var i = 0, mail; mail = list[i++];) {
			var str = mailTpl();
			var subject = mail.subject;
			subject = !!subject ? mail.subject : 'Unknown mail';

			subject = subject.length < 20 ? subject : subject.substring(0, 20) + '...';
			str = str.replace(/{{FROM}}/g, mail.from ? mail.from : "Unknown");
			str = str.replace(/{{SUBJECT}}/g, subject);
			str = str.replace(/{{UID}}/g, mail.id);
			tpl += str;
		}
		$container.html(tpl).removeClass('hidden');
	}


	/**
	 * [initMailPreview 邮件预览列表，这里只显示3个，不过接口预留出来]
	 * @param  {[type]} boxType  [邮件类型]
	 * @param  {[type]} pageNo   [当前页数]
	 * @param  {[type]} pageSize [显示条数]
	 * @param  {[type]} limit    [限制条数]
	 * @return {[type]}          [description]
	 */
	function initMailPreview (list, boxType, pageNo, pageSize, limit) {
		var $container = $('.mail-preview');
		var tpl = '';
		for (var i = 0, mail; i < CONFIG.LIMIT && (mail = list[i++]);) {
			var str = mailPreviewTpl();
			var subject = !!mail.subject ? mail.subject : 'Unknown mail';
			subject = subject.length < 20 ? subject : subject.substring(0, 20) + '...';
			str = str.replace(/{{SUBJECT}}/g, subject);
			str = str.replace(/{{CONTENT}}/g, mail.content);
			str = str.replace(/{{UID}}/g, mail.id);
			tpl += str;
		}
		$container.html(tpl).removeClass('hidden');

		bindTogglePrivew($container)
	}

	function bindTogglePrivew ($ctx) {
		$ctx.off('click').on('click', '.panel-heading', function (ev) {
			var $target = $(ev.currentTarget);
			var $panel = $target.closest('.panel');
			var $body = $panel.find('.panel-body');
			$body.slideToggle(300);
		})

		if ($ctx.find('.panel').length > CONFIG.PREVIEW_COLLAPSE_INDEX) {
			$ctx.find('.panel-heading').filter(function (index) {
				return index >= CONFIG.PREVIEW_COLLAPSE_INDEX;
			}).trigger('click');
		}
	}


	/**
	 * [fetchMailById 根据邮件ID获取缓存数据]
	 * @param  {[type]} mailId [给定的邮件ID]
	 * @return {[type]}        [description]
	 */
	function fetchMailById (mailId) {
		var data = CONFIG.demoData;
		var ret;
		for (var attr in data) {
			var typeGroup = data[attr];
			var found = false;
			for (var i = 0, mail; mail = typeGroup[i++];) {
				if (mail.id == mailId) {
					found = true;
					ret = mail;
					break;
				}
			}
			if (found) break;
		}

		return ret;
	}

	/**
	 * [loadMail 在预览模态窗口中装载邮件]
	 * @return {[type]} [description]
	 */
	function loadMail (mail, $context) {
		$context.find('.mail-subject').text(mail.subject);
		$context.find('.mail-sender').text(mail.from);
		$context.find('.mail-date').text(mail.date);

		var $iframe = $('<iframe>').attr({
			src: 'http://127.0.0.1:8080/' + mail.path,
			frameBorder : '0',
			marginWidth : 0,
			marginHeight : 0,
			width: '100%',
			height: '100%',
			style: 'width: 100%; height: 100%;'
		}).css({
			width: '100%',
			height: '100%'
		});
		$context.find('.mail-content').html($iframe);
	}

	/**
	 * [moveMail 移动邮件]
	 * @param  {[type]} srcBoxName       [源文件夹名称]
	 * @param  {[type]} targetBoxName    [目标文件夹名称]
	 * @param  {[type]} messageSource [邮件资源]
	 * @return {[type]}               [description]
	 */
	function moveMail (srcBoxName, targetBoxName, messageSource) {
		$.ajax({
			url : sendMailUrl,
			type : "POST",
			cache : false,
			data : {
				action : "MOVE",
				account : getAccount(),
				server : getServer(),
				srcBoxName : srcBoxName,
				targetBoxName : targetBoxName,
				messageSource : messageSource
			},
			success : function (info) {
				if (isResultSuccessful(info)) {
					if (info.success == true || info.success == 'true') {
						alert('邮件已经成功移动！');
						$('#recvMail').trigger('click');
					} else {
						alert('邮件发送失败！');
					}
				}
			}
		});
	}


	/**
	 * [deleteMail 删除给定文件夹下的邮件]
	 * @param  {[type]} srcBoxName    [源文件夹名]
	 * @param  {[type]} messageSource [邮件的信息源描述对象， 如1:3]
	 * @return {[type]}               [description]
	 */
	function deleteMail (srcBoxName, messageSource) {
		$.ajax({
			url : sendMailUrl,
			type : "POST",
			cache : false,
			data : {
				action : "DELETE",
				account : getAccount(),
				server : getServer(),
				srcBoxName : srcBoxName || 'INBOX',
				messageSource : messageSource
			},
			success : function (info) {
				if (isResultSuccessful(info)) {
					if (info.success == true || info.success == 'true') {
						alert('邮件已经成功删除！');
						$('#recvMail').trigger('click');
					} else {
						alert('邮件发送失败！');
					}
				}
			}
		});
	}

	/**
	 * [sendMail 发送邮件]
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	function sendMail (data) {
		$.ajax({
			url : sendMailUrl,
			type : 'POST',
			data : data,
			success : function (info) {
				if (isResultSuccessful(info)) {
					alert('邮件已经成功发送！\r\n'+info.message);
					$('#recvMail').trigger('click');
				} else {
					alert('邮件发送失败！\r\n错误原因：'+info.message);
				}
			}
		});
	}

	/**
	 * [initPagination 分页插件初始化]
	 * @return {[type]} [description]
	 */
	function initPagination () {
		var mailBox = currentBoxType;
		var total = $('.badge[data-type="'+ mailBox +'"]').text();
		var pageSize = CONFIG['PAGE_SIZE'];
		var totalPages = Math.ceil(total/pageSize);
		var $pager = $('.pagination');


		fixPagerRange(1, totalPages, $pager);

		setActivePage(1, $pager);

		$pager.off('click').on('click', 'li', function (ev) {
			var $target = $(ev.currentTarget);
			var pageNo = $target.text();
			
			if (isNaN(pageNo)) {
				// 上一页或下一页
				var currentNo = parseInt($pager.find('li.active').text());
				if ($target.hasClass('prev')) {
					if (currentNo != 1) {
						$pager.find('li.active').prev().trigger('click');
					}
				} else if ($target.hasClass('next')) {
					if (currentNo != totalPages) {
						$pager.find('li.active').next().trigger('click');
					}
				}
			} else {
				var $aLi = $pager.find('li');
				var start = parseInt($aLi.eq(1).text());
				var end = parseInt($aLi.eq($aLi.length-2).text());
				var half = Math.floor((end - start + 1) / 2) + 1;
				var newStart = pageNo - 5;

				APP.initBoxAndPage(mailBox, {
					pageno : pageNo,
					pagesize : CONFIG.PAGE_SIZE
				}, function () {
					if (start < total - 10) {
						if (pageNo > half) {
							if (newStart <= total - 5) {
								newStart = Math.max(1, newStart);
								fixPagerRange(newStart, totalPages, $pager);
							}
						} else if (pageNo <= half){
							if (newStart >= 1) {
								fixPagerRange(newStart, totalPages, $pager);
							}
						}
					}
					
					setActivePage(pageNo, $pager);
				});
			}
			
		})
	}

	function setActivePage (pageNo, $pager) {
		$pager.removeClass('hidden');
		$pager.find('li').removeClass('active');
		$pager.find('li').filter(function () {
			return $(this).text() == pageNo;
		}).addClass('active');
	}


	function fixPagerRange (start, total, $pager) {
		var pageHtml = [],
			end = (10 + start) <= total ? (10 + start) : total;

		if (total == 1) {
			$pager.hide();
		} else {
			$pager.show();
		}

		pageHtml.push('<li class="prev"><a href="#">&laquo;</a></li>');
		console.log(start, end);
		for (var i = start; i <= end; i++) {
			pageHtml.push('<li><a href="#">'+ i +'</a></li>');
		}
		pageHtml.push('<li class="next"><a href="#">&raquo;</a></li>');
		$pager.html(pageHtml.join(''));
	}


	/*==================================== 模板函数开始 ==============================================*/
	/**
     * [mailTpl 构建邮件预览列表的模板函数]
     * @return {[type]} [description]
     */
	function mailPreviewTpl () {
		var tpl = '<div class="panel panel-info"> \
                    <div class="panel-heading"> \
                        {{SUBJECT}} \
                    </div> \
                    <div class="panel-body"> \
                        {{CONTENT}} \
                        <a href="#" class="btn btn-primary btn-xs pull-right mail-detail" data-id="{{UID}}">详细</a> \
                    </div> \
                </div>';
        return tpl;
	}
    
    /**
     * [mailTpl 构建邮件列表的模板函数]
     * @return {[type]} [description]
     */
	function mailTpl () {
		var tpl = '<div class="list-group"> \
                        <a href="#" class="list-group-item" data-id="{{UID}}"> \
                            <h4 class="list-group-item-heading">{{FROM}}</h4> \
                            <p class="list-group-item-text">{{SUBJECT}}</p> \
                        </a> \
                    </div>';
        return tpl;
	}
	/*==================================== 模板函数结束 ==============================================*/


	/*==================================== 工具类开始 ===============================================*/

	/**
	 * [isArray 是否为数组]
	 * @param  {[type]}  array [description]
	 * @return {Boolean}       [description]
	 */
	function isArray (array) {
		var protostr = Object.prototype.toString;
		return protostr.call(array) === '[object Array]';
	}

	/**
	 * [clone 对象的深拷贝]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	function clone (obj) {
		if (typeof obj !== 'object' || obj === undefined || obj === null) {
			return obj;
		}

		var ret = obj.constructor == 'Array' ? [] : {};
		for (var attr in obj) {
			ret[attr] = clone(obj[attr]);
		}

		return ret;
	}

	/**
	 * [isResultSuccessful 判断返回结果是否成功]
	 * @param  {[type]}  info [description]
	 * @return {Boolean}      [description]
	 */
	function isResultSuccessful (info) {
		return info.success == true || info.success == 'true';
	}

	/**
	 * [getQueryString 获取地址栏内的查询参数]
	 * @param  {[type]} name [查询的参数键]
	 * @return {[type]}      [description]
	 */
	function getQueryString(name) {  
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
	    var r = window.location.search.substr(1).match(reg);  //获取url中"?"符后的字符串并正则匹配
	    var context = "";  
	    if (r != null)  
	         context = r[2];  
	    reg = null;  
	    r = null;  
	    return context == null || context == "" || context == "undefined" ? "" : context;  
	}

	/*==================================== 工具类结束 ===============================================*/

	return MailApp;
})(jQuery, wangEditor);