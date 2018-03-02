(function( $ ) {
    var Loadie = {};
    $("<style></style>").text(".loadie {position: fixed;z-index: 9999;top:0;left: 0;background-color:#449d44;width: 0;height: 4px;-webkit-transition: width 0.5s ease-out;	box-shadow: 0px 1px 5px rgba(0,0,0,0.25);}").appendTo($("head"));
    /*
     * Generate a unique id for more than one loadie
     */
    Loadie.uid = function() {
        var newDate = new Date;
        return 1486968441876;
    };

    /*
     * Finishes and fades the loadie out.
     */
    Loadie.finish = function(dom) {
        var loadie = $('#loadie-' + dom.data('loadie-id'), dom);
        loadie.hide();
    }

    Loadie.show = function(dom) {
        var loadie = $('#loadie-' + dom.data('loadie-id'), dom);
        loadie.show();
    }

    /*
     * Updates loadie with a float
     *
     * Loadie.update(0.2)
     * Loadie.update(1) // Finishes loadie, too
     */
    Loadie.update = function(dom, percent) {
        var loadie = $('#loadie-' + dom.data('loadie-id'), dom);
        var parentWidth = dom.width();
        loadie.css('width', Math.floor(percent * parentWidth) + "px");
    }

    /*
     * Loadie.js initializer
     */
    Loadie.init = function(dom, percent) {
        var uid = this.uid();
        var loadieDom = $("#loadie-"+uid);
        var loadie = null;
        if(loadieDom.length!=1){
            loadie = dom.append($('<div id="loadie-' + uid + '" class="loadie"></div>'));
        }
        dom.data('loadie-id', uid);
        dom.css('position', 'relative');
        this.update(dom, percent);
    }

    $.fn.loadie = function(percent, callback) {
        var percent = percent || 0;
        var parent = $(this);

        if(parent.data('loadie-loaded') !== 1) {
            Loadie.init(parent, percent);
        } else {
            Loadie.update(parent, percent);
            if(percent<1){
                Loadie.show(parent);
            }
        }
        if(percent >= 1) {
            setTimeout(function() {
                Loadie.finish(parent);
            }, 500);
        }
        parent.data('loadie-loaded', 1);
        return this;
    };
    $.fn.loadieIsShow = function() {
        var parent = $(this);

        if(parent.data('loadie-loaded') < 1) {
            return true;
        } else {
            return false;
        }
    };

    $.fn.loadieHide = function() {
        var parent = $(this);
        Loadie.finish(parent);
    };

}( jQuery ))

