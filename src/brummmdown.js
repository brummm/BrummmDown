/* 
 * TODO: 
 *  1. block elements must select the entire line to put its markdowns
 *  2. Popups to open the fields to fill the links
 */
(function ( $ ) {
	$.fn.brummmDown = function(options) {
    if(!this.get(0).selectionStart && this.get(0).selectionStart !== 0) {
      console.log("This browser isn't supported.");
      return this;
    }
    var settings = $.extend({
            bundle: 'complete',
            toolBarAditionalCssClass: '',
            tags: []
        }, options );

    settings.tags = $.fn.brummmDown.parseTags(settings);
    var toolBar = $.fn.brummmDown.createToolBar(this, settings);
    toolBar.prependTo(this.parent());
	};

  $.fn.brummmDown.parseTags = function(settings) {
    if(settings.tags.length===0) {
      switch(settings.bundle) {
        case 'complete':
          settings.tags = ['h1', 'h2', 'h3', 
            'h4', 'h5', 'h6', 'em', 'strong', 
            'blockquote', 'ul', 'ol', 'link', 'img'];
          break;
        case 'simple':
          settings.tags = ['h1', 'h2', 'em', 'strong', 
            'blockquote', 'ul', 'ol', 'link', 'img']
          break;
      }
    }
    return settings.tags;

  };

  $.fn.brummmDown.createToolBar = function(target, settings) {
    var toolBarClass = 'brummmdown-toolbar';
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
            element = $.fn.brummmDown.createTargetedButtonH1(innerTarget);
            break;
          case 'h2':
            element = $.fn.brummmDown.createTargetedButtonH2(innerTarget);
            break;
          case 'h3':
            element = $.fn.brummmDown.createTargetedButtonH3(innerTarget);
            break;
          case 'h4':
            element = $.fn.brummmDown.createTargetedButtonH4(innerTarget);
            break;
          case 'h5':
            element = $.fn.brummmDown.createTargetedButtonH5(innerTarget);
            break;
          case 'h6':
            element = $.fn.brummmDown.createTargetedButtonH6(innerTarget);
            break;
          case 'em':
            element = $.fn.brummmDown.createTargetedButtonEm(innerTarget);
            break;
          case 'strong':
            element = $.fn.brummmDown.createTargetedButtonStrong(innerTarget);
            break;
          case 'blockquote':
            element = $.fn.brummmDown.createTargetedButtonBlockquote(innerTarget);
            break;
          case 'ul':
            element = $.fn.brummmDown.createTargetedButtonUl(innerTarget);
            break;
          case 'ol':
            element = $.fn.brummmDown.createTargetedButtonOl(innerTarget);
            break;
          case 'link':
            element = $.fn.brummmDown.createTargetedButtonLink(innerTarget);
            break;
        }
        if(element!==null) {
          element.appendTo(toolBarContainer);
        }
      })
    });
    
    return toolBarContainer;
  };

  $.fn.brummmDown.insertMarkdown = function(target, prefix, suffix, defaultText) {
    var selectionFrom = target.selectionStart;
    var selectionTo = target.selectionEnd;
    var selectionPrefix = target.value.substring(0, selectionFrom);
    var selectionSuffix = target.value.substring(selectionTo, target.value.length);
    var selectedText= target.value.substring(selectionFrom, selectionTo);

    
    var noSelection = selectionFrom === selectionTo;
    var content = (noSelection) 
      ? defaultText
      : selectedText;

    // if the last char was a line break, does not add another
    var prefixStartWithLineBreak = prefix.substring(0, 1) === "\n";
    if((selectionFrom === 0 && prefixStartWithLineBreak)
      || (target.value.substring(selectionFrom-1, selectionFrom) === "\n") && prefixStartWithLineBreak) {
      prefix = prefix.substring(1);
    }

    // updating target value
    target.value = selectionPrefix + prefix + content + 
                    suffix + selectionSuffix;
    target.focus();

    // do highlight text
    target.selectionStart = selectionFrom + prefix.length;
    target.selectionEnd   = target.selectionStart + content.length;

    if (selectionFrom != selectionTo) {
      window.getSelection().collapseToEnd();
    }
  };

  $.fn.brummmDown.createTargetedButtonH1 = function(target) {
    return $.fn.brummmDown.createTargetedButtonH(target, 1);
  };

  $.fn.brummmDown.createTargetedButtonH2 = function(target) {
    return $.fn.brummmDown.createTargetedButtonH(target, 2);
  };

  $.fn.brummmDown.createTargetedButtonH3 = function(target) {
    return $.fn.brummmDown.createTargetedButtonH(target, 3);
  };

  $.fn.brummmDown.createTargetedButtonH4 = function(target) {
    return $.fn.brummmDown.createTargetedButtonH(target, 4);
  };

  $.fn.brummmDown.createTargetedButtonH5 = function(target) {
    return $.fn.brummmDown.createTargetedButtonH(target, 5);
  };

  $.fn.brummmDown.createTargetedButtonH6 = function(target) {
    return $.fn.brummmDown.createTargetedButtonH(target, 6);
  };

  $.fn.brummmDown.createTargetedButtonH = function(target, number) {
    var s = '', n = number; 
    while (n-- > 0) s += '#';
    var prefix = "\n" + s + " "
    return $('<button type=button>h' + number.toString() + '</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, prefix, "\n", 'Título');
      });
  };

  $.fn.brummmDown.createTargetedButtonEm = function(target) {
    return $('<button type=button>em</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, "*", "*", 'em');
      });
  };

  $.fn.brummmDown.createTargetedButtonStrong = function(target) {
    return $('<button type=button>strong</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, "**", "**", 'strong');
      });
  };

  $.fn.brummmDown.createTargetedButtonBlockquote = function(target) {
    return $('<button type=button>blockquote</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, "\n> ", "\n", 'blockquote');
      });
  };

  // TODO: continue the lists on line breaks
  $.fn.brummmDown.createTargetedButtonUl = function(target) {
    return $('<button type=button>ul</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, "\n* ", "\n", 'ul');
      });
  };

  $.fn.brummmDown.createTargetedButtonOl = function(target) {
    return $('<button type=button>ol</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, "\n1. ", "\n", 'ol');
      });
  };

  // TODO: open window to fill this parms
  $.fn.brummmDown.createTargetedButtonLink = function(target) {
    return $('<button type=button>link</button>')
      .click(function(e){
        e.preventDefault();
        $.fn.brummmDown.insertMarkdown(target, "[", "](http://link_address)", 'link');
      });
  };
}( jQuery ));