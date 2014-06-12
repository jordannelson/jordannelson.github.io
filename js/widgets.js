// Custom arrowlist widget for JQuery Mobile
(function($) {
	$.widget("mobile.arrowlist", {
		options: {
			theme: false,
		 	clickEvent: 'vclick'
		},
		_create: function() {
			var self = this,
					options = $.extend(
					this.options,
					this.element.jqmData('options')
				),
				display = {
					// The data-role="arrowlist" div
					elem: this.element,

					// The h3 header with the left and right arrows
					header: this.element.prepend('<h3 class="ui-bar-a" class="arrowlist-header"><div class="arrowlist-header-title"></div></h3>')
						.children('h3').first(),

					// The list of content each stored in a span and containing two divs, the title and content
					list: this.element.children('span'),

					// The currently active element in the list
					index: 0
				};

			// The title of the currently active element in the list
			display.title = display.header.children('div').first();

			// Same as "self.display = display;"
			$.extend(self, {
				display: display
			});

			if(options.theme === false) {
				options.theme = $(this).closest('[data-theme]')
					.attr('data-theme');
				if(typeof options.theme === 'undefined') {
					options.theme = 'c';
				}
			}

			self.display.leftArrow = $('<div>')
				.buttonMarkup({
					icon: 'arrow-l',
					theme: options.theme,
					iconpos: 'notext',
					corners: false,
					shadow: true,
					inline: true
				})
				.addClass('ui-corner-left')
				.css({
					'float':'left',
					'margin':'0px'
					// 'paddingLeft':'.4em'
				})
				.prependTo(self.display.header);

		 	self.display.rightArrow = $('<div>')
				.buttonMarkup({
					icon: 'arrow-r',
					theme: options.theme,
					iconpos: 'notext',
					corners: false,
					shadow: true,
					inline: true
				})
				.addClass('ui-corner-right')
				.css({
					'float':'right',
					'margin':'0px'
					// 'paddingRight':'.4em'
				})
				.prependTo(self.display.header);

			$('<div>')
				.css('clear','both')
				.appendTo(self.display.header);

			self.display.leftArrow.on(options.clickEvent, function(e) {
				e.preventDefault();
				var i = self.display.index;
				i = (i-1 < 0) ? self.display.list.length-1 : i-1;
				self._toggleTab(i);
				self.display.index = i;
			});

			self.display.rightArrow.on(options.clickEvent, function(e) {
				e.preventDefault();
				var i = self.display.index;
				i = (i+1 >= self.display.list.length) ? 0 : i+1;
				self._toggleTab(i);
				self.display.index = i;
			});

			self._toggleTab(self.display.index);
		},
		_toggleTab: function(index) {
			var list = this.display.list;

			var currentSpan = list.eq(this.display.index);
			currentSpan.children('div.arrowlist-content').hide();

			var span = list.eq(index);
			span.children('div.arrowlist-content').show();
			this.display.title.html(span.children('div.arrowlist-title').html());
		}
	});
})(jQuery);

function generateJQMDateStr() {
	var today = new Date();
	var dd = today.getDate().toString();
	var mm = (today.getMonth() + 1).toString(); // January is 0
	var yyyy = today.getFullYear().toString();

	if(dd.length <= 1)
		dd = "0" + dd;
	if(mm.length <= 1)
		mm = "0" + mm;

	return yyyy + '-' + mm + '-' + dd;
}