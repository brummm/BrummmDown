/*
 * TODO:
 *  1. block elements must select the entire line to put its markdowns
 *  2. Popups to open the fields to fill the links
 *  3. Add preview button
 *  4. If the current line is a list and the user press enter, add a new list element on the new line
 *     4.1 Ordened lists have to have a special treatment
 *  5. Do not allow a user to 'format a url'
 *  6. Strip of tags
 *  7. Lists have to insert itens on all of its lines
 *  8. Blockquotes must be multilined
 */
(function ( $ ) {
	'use strict';
	$.bDown = {};

	$.bDown.messages = {};

	$.bDown.setMessages = function(language) {
		var jsFileLocation = $('script[src*=bDown]').attr('src');  // the js file path
		jsFileLocation = jsFileLocation.replace('bDown.js', '');   // the js folder path
		var url = jsFileLocation + 'i18n/' + language + '.js';
		var messages = null;
		return $.ajax({
			dataType: "script",
			cache: true,
			url: url,
			error: function(jqXHR, textStatus, errorThrown ){
				console.log('Error when loading messages. Error: ' + errorThrown);
			}
		});
	};

	$.bDown.parseTags = function(settings) {
		if(settings.tags.length===0) {
		  switch(settings.bundle) {
			case 'complete':
			  settings.tags = ['h1', 'h2', 'h3',
				'h4', 'h5', 'h6', 'i', 'b',
				'blockquote', 'ul', 'ol', 'link', 'img'];
			  break;
			case 'simple':
			  settings.tags = ['h1', 'h2', 'i', 'b',
				'blockquote', 'ul', 'ol', 'link', 'img'];
				break;
			case 'minimal':
				settings.tags = ['b', 'i', 'link'];
				break;
		  }
		}
		return settings.tags;
	};

	$.bDown.createAndAddToolBar = function(target, settings) {
		var toolBarClass = 'bDown-toolbar';
		if(settings.toolBarAditionalCssClass !== '') {
		  toolBarClass += ' ' + toolBarAditionalCssClass;
		}
		var toolBarContainer = $('<div class="' + toolBarClass + '"></div>');

		target.each(function(){
		  var innerTarget = this;
		  $.each(settings.tags, function(i, tag) {
			var element = null;
			switch(tag) {
			  case 'h1':
				element = $.bDown.createTargetedButtonH1(innerTarget);
				break;
			  case 'h2':
				element = $.bDown.createTargetedButtonH2(innerTarget);
				break;
			  case 'h3':
				element = $.bDown.createTargetedButtonH3(innerTarget);
				break;
			  case 'h4':
				element = $.bDown.createTargetedButtonH4(innerTarget);
				break;
			  case 'h5':
				element = $.bDown.createTargetedButtonH5(innerTarget);
				break;
			  case 'h6':
				element = $.bDown.createTargetedButtonH6(innerTarget);
				break;
			  case 'i':
				element = $.bDown.createTargetedButtonI(innerTarget);
				break;
			  case 'b':
				element = $.bDown.createTargetedButtonB(innerTarget);
				break;
			  case 'blockquote':
				element = $.bDown.createTargetedButtonBlockquote(innerTarget);
				break;
			  case 'ul':
				element = $.bDown.createTargetedButtonUl(innerTarget);
				break;
			  case 'ol':
				element = $.bDown.createTargetedButtonOl(innerTarget);
				break;
			  case 'link':
				element = $.bDown.createTargetedButtonLink(innerTarget);
				break;
			}
			if(element!==null) {
			  element.appendTo(toolBarContainer);
			}
		  })
		});

		toolBarContainer.insertBefore(target);
	};

	$.bDown.insertMarkdown = function(target, options) {
		var s = $.extend({
			prefix: '',
			suffix: '',
			default: '',
			block: false,
		}, options );

		var selectionFrom = target.selectionStart;
		var selectionTo = target.selectionEnd;
		var val = target.value;
		var total = val.length;

		var noSelection = selectionFrom === selectionTo;
		var hasSelection = !noSelection; // clarity


		if(s.block) {
			// if it is a block element and nothing was selected,
			// it must select the entire line
			if(noSelection) {
				noSelection = false;
				var line = $.bDown.selectLine(val, selectionFrom, selectionTo);
				selectionFrom = line.selectionFrom;
				var isPrefixAdded = val.substring(0, prefix.length) === prefix;
				if(isPrefixAdded) selectionFrom += prefix.length;

				selectionTo = line.selectionTo;
				var isPrefixAdded = val.substring(0, prefix.length) === prefix;
				if(isPrefixAdded) selectionFrom += prefix.length;
			} else {
				// if the last char was a line break, does not add another
				if(selectionFrom !== 0
					&& val.substring(selectionFrom-1, selectionFrom) !== "\n") {
				  s.prefix = "\n" + s.prefix;
				}

				// only adds a line break if it has a selection and the next char is not a line break
				if(selectionTo !== total
					&& val.substring(selectionTo, selectionTo+1) !== "\n") {
				  s.suffix = s.suffix + "\n";
				}
			}
		}


		var selectedText= val.substring(selectionFrom, selectionTo);

		if($.bDown.isSelectedTextSorroundedByMarkDown(val, s.block, selectionFrom, selectionTo, s.prefix, s.suffix)) {
			// strip out the current markdown
			selectionFrom -= s.prefix.length;
			selectionTo += s.suffix.length;
			s.prefix = s.suffix = '';
			console.log('is');

		}

		var selectionPrefix = val.substring(0, selectionFrom);
		var selectionSuffix = val.substring(selectionTo, val.length);


		var content = (noSelection)
		  ? s.default
		  : selectedText;


		// updating target value
		target.value = selectionPrefix + s.prefix + content +
						s.suffix + selectionSuffix;
		target.focus();

		// do highlight text
		target.selectionStart = selectionFrom + s.prefix.length;
		target.selectionEnd   = target.selectionStart + content.length;

		if (selectionFrom != selectionTo) {
		  window.getSelection().collapseToEnd();
		}
	};

	$.bDown.selectLine = function(val, selectionFrom, selectionTo) {
		// line start
		var n = parseInt(selectionFrom);
		while(n > 0) {
			n--;
			if(val.substring(n, n+1)=="\n") {
				selectionFrom = n+1;
				break;
			}
		}
		if(n === 0) {
			selectionFrom = 0;
		}

		// line end
		var n = selectionTo - 1;
		while(n++ < val.length) {
			if(val.substring(n, n+1)=="\n") {
				selectionTo = n;
				break;
			}
		}
		if(n === val.length) {
			selectionTo = n;
		}

		return {
			selectionFrom: selectionFrom,
			selectionTo: selectionTo,
			text: val.substring(selectionFrom, selectionTo)
		};
	};

	$.bDown.isSelectedTextSorroundedByMarkDown = function(val, block, selectionFrom, selectionTo, prefix, suffix) {
		if(val.length === 0) return false;
		var start, end;

		var prefixFound = false;
		start = end = selectionFrom;
		if(block===true) {
			end += prefix.length;
		} else {
			start -= prefix.length;
		}
		if(val.substring(start, end) === prefix) {
			console.log('sim');
			prefixFound = true;
		}

		var suffixFound = false;
		start = selectionTo;
		end = selectionTo + suffix.length;
		if(val.substring(start, end) === suffix) {
			suffixFound = true;
		}

		return (prefixFound && suffixFound);
	};

	$.bDown.createTargetedButtonH1 = function(target) {
		return $.bDown.createTargetedButtonH(target, 1);
	};

	$.bDown.createTargetedButtonH2 = function(target) {
		return $.bDown.createTargetedButtonH(target, 2);
	};

	$.bDown.createTargetedButtonH3 = function(target) {
		return $.bDown.createTargetedButtonH(target, 3);
	};

	$.bDown.createTargetedButtonH4 = function(target) {
		return $.bDown.createTargetedButtonH(target, 4);
	};

	$.bDown.createTargetedButtonH5 = function(target) {
		return $.bDown.createTargetedButtonH(target, 5);
	};

	$.bDown.createTargetedButtonH6 = function(target) {
		return $.bDown.createTargetedButtonH(target, 6);
	};

	$.bDown.createTargetedButtonH = function(target, number) {
		var s = '', n = number;
		while (n-- > 0) s += '#';
		var prefix = s + " ";
		return $($.bDown.buttonHtml('h' + number.toString()))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: prefix, default: 'Título', block: true });
		  });
	};

	$.bDown.createTargetedButtonI = function(target) {
		return $($.bDown.buttonHtml('i'))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: "*", suffix: "*", default: 'i' });
		  });
	};

	$.bDown.createTargetedButtonB = function(target) {
		return $($.bDown.buttonHtml('b'))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: "**", suffix: "**", default: 'b' });
		  });
	};

	$.bDown.createTargetedButtonBlockquote = function(target) {
		return $($.bDown.buttonHtml('blockquote'))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: "> ", default: 'blockquote', block: true });
		  });
	};

	$.bDown.createTargetedButtonUl = function(target) {
		return $($.bDown.buttonHtml('ul'))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: "* ", default: 'ul', block: true });
		  });
	};

	$.bDown.createTargetedButtonOl = function(target) {
		return $($.bDown.buttonHtml('ol'))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: "1. ", suffix: "\n", default: 'ol', block: true });
		  });
	};

	$.bDown.createTargetedButtonLink = function(target) {
		return $($.bDown.buttonHtml('link'))
		  .click(function(e){
			e.preventDefault();
			$.bDown.insertMarkdown(target, { prefix: "[", suffix: "](http://link_address)", default: 'link' });
		  });
	};

	$.bDown.buttonHtml = function(what) {
		var text = $.bDown.messages[what];
		var css = what;
		return '<button type=button class="bDown-' + css + '">' + text + '</button>';
	};


	$.fn.bDown = function(options) {
		if(!this.get(0).selectionStart && this.get(0).selectionStart !== 0) {
		  console.log("This browser isn't supported.");
		  return this;
		}
		var settings = $.extend({
				bundle: 'complete',
				language: 'pt-br',
				toolBarAditionalCssClass: '',
				tags: [],
			}, options );

		settings.tags = $.bDown.parseTags(settings);

		if($.isEmptyObject($.bDown.messages)) {
			var target = this;
			$.bDown.setMessages(settings.language)
				.done(function(script, textStatus) {
					$.bDown.createAndAddToolBar(target, settings);
				});
		} else {
			$.bDown.createAndAddToolBar(this, settings);
		}
    };
}( jQuery ));