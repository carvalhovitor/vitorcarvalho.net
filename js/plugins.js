// Sticky Kit
// Generated by CoffeeScript 1.9.2

/**
@license Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
 */

(function() {
  var $, win;

  $ = this.jQuery || window.jQuery;

  win = $(window);

  $.fn.stick_in_parent = function(opts) {
    var doc, elm, enable_bottoming, fn, i, inner_scrolling, len, manual_spacer, offset_top, parent_selector, recalc_every, sticky_class;
    if (opts == null) {
      opts = {};
    }
    sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
    if (offset_top == null) {
      offset_top = 0;
    }
    if (parent_selector == null) {
      parent_selector = void 0;
    }
    if (inner_scrolling == null) {
      inner_scrolling = true;
    }
    if (sticky_class == null) {
      sticky_class = "is_stuck";
    }
    doc = $(document);
    if (enable_bottoming == null) {
      enable_bottoming = true;
    }
    fn = function(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
      var bottomed, detach, fixed, last_pos, last_scroll_height, offset, parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;
      if (elm.data("sticky_kit")) {
        return;
      }
      elm.data("sticky_kit", true);
      last_scroll_height = doc.height();
      parent = elm.parent();
      if (parent_selector != null) {
        parent = parent.closest(parent_selector);
      }
      if (!parent.length) {
        throw "failed to find stick parent";
      }
      fixed = false;
      bottomed = false;
      spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
      if (spacer) {
        spacer.css('position', elm.css('position'));
      }
      recalc = function() {
        var border_top, padding_top, restore;
        if (detached) {
          return;
        }
        last_scroll_height = doc.height();
        border_top = parseInt(parent.css("border-top-width"), 10);
        padding_top = parseInt(parent.css("padding-top"), 10);
        padding_bottom = parseInt(parent.css("padding-bottom"), 10);
        parent_top = parent.offset().top + border_top + padding_top;
        parent_height = parent.height();
        if (fixed) {
          fixed = false;
          bottomed = false;
          if (manual_spacer == null) {
            elm.insertAfter(spacer);
            spacer.detach();
          }
          elm.css({
            position: "",
            top: "",
            width: "",
            bottom: ""
          }).removeClass(sticky_class);
          restore = true;
        }
        top = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;
        height = elm.outerHeight(true);
        el_float = elm.css("float");
        if (spacer) {
          spacer.css({
            width: elm.outerWidth(true),
            height: height,
            display: elm.css("display"),
            "vertical-align": elm.css("vertical-align"),
            "float": el_float
          });
        }
        if (restore) {
          return tick();
        }
      };
      recalc();
      if (height === parent_height) {
        return;
      }
      last_pos = void 0;
      offset = offset_top;
      recalc_counter = recalc_every;
      tick = function() {
        var css, delta, recalced, scroll, will_bottom, win_height;
        if (detached) {
          return;
        }
        recalced = false;
        if (recalc_counter != null) {
          recalc_counter -= 1;
          if (recalc_counter <= 0) {
            recalc_counter = recalc_every;
            recalc();
            recalced = true;
          }
        }
        if (!recalced && doc.height() !== last_scroll_height) {
          recalc();
          recalced = true;
        }
        scroll = win.scrollTop();
        if (last_pos != null) {
          delta = scroll - last_pos;
        }
        last_pos = scroll;
        if (fixed) {
          if (enable_bottoming) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
            if (bottomed && !will_bottom) {
              bottomed = false;
              elm.css({
                position: "fixed",
                bottom: "",
                top: offset
              }).trigger("sticky_kit:unbottom");
            }
          }
          if (scroll < top) {
            fixed = false;
            offset = offset_top;
            if (manual_spacer == null) {
              if (el_float === "left" || el_float === "right") {
                elm.insertAfter(spacer);
              }
              spacer.detach();
            }
            css = {
              position: "",
              width: "",
              top: ""
            };
            elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
          }
          if (inner_scrolling) {
            win_height = win.height();
            if (height + offset_top > win_height) {
              if (!bottomed) {
                offset -= delta;
                offset = Math.max(win_height - height, offset);
                offset = Math.min(offset_top, offset);
                if (fixed) {
                  elm.css({
                    top: offset + "px"
                  });
                }
              }
            }
          }
        } else {
          if (scroll > top) {
            fixed = true;
            css = {
              position: "fixed",
              top: offset
            };
            css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
            elm.css(css).addClass(sticky_class);
            if (manual_spacer == null) {
              elm.after(spacer);
              if (el_float === "left" || el_float === "right") {
                spacer.append(elm);
              }
            }
            elm.trigger("sticky_kit:stick");
          }
        }
        if (fixed && enable_bottoming) {
          if (will_bottom == null) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
          }
          if (!bottomed && will_bottom) {
            bottomed = true;
            if (parent.css("position") === "static") {
              parent.css({
                position: "relative"
              });
            }
            return elm.css({
              position: "absolute",
              bottom: padding_bottom,
              top: "auto"
            }).trigger("sticky_kit:bottom");
          }
        }
      };
      recalc_and_tick = function() {
        recalc();
        return tick();
      };
      detach = function() {
        detached = true;
        win.off("touchmove", tick);
        win.off("scroll", tick);
        win.off("resize", recalc_and_tick);
        $(document.body).off("sticky_kit:recalc", recalc_and_tick);
        elm.off("sticky_kit:detach", detach);
        elm.removeData("sticky_kit");
        elm.css({
          position: "",
          bottom: "",
          top: "",
          width: ""
        });
        parent.position("position", "");
        if (fixed) {
          if (manual_spacer == null) {
            if (el_float === "left" || el_float === "right") {
              elm.insertAfter(spacer);
            }
            spacer.remove();
          }
          return elm.removeClass(sticky_class);
        }
      };
      win.on("touchmove", tick);
      win.on("scroll", tick);
      win.on("resize", recalc_and_tick);
      $(document.body).on("sticky_kit:recalc", recalc_and_tick);
      elm.on("sticky_kit:detach", detach);
      return setTimeout(tick, 0);
    };
    for (i = 0, len = this.length; i < len; i++) {
      elm = this[i];
      fn($(elm));
    }
    return this;
  };

}).call(this);


/*! lazysizes - v4.0.0-rc1 */
!function(a,b){var c=b(a,a.document);a.lazySizes=c,"object"==typeof module&&module.exports&&(module.exports=c)}(window,function(a,b){"use strict";if(b.getElementsByClassName){var c,d,e=b.documentElement,f=a.Date,g=a.HTMLPictureElement,h="addEventListener",i="getAttribute",j=a[h],k=a.setTimeout,l=a.requestAnimationFrame||k,m=a.requestIdleCallback,n=/^picture$/i,o=["load","error","lazyincluded","_lazyloaded"],p={},q=Array.prototype.forEach,r=function(a,b){return p[b]||(p[b]=new RegExp("(\\s|^)"+b+"(\\s|$)")),p[b].test(a[i]("class")||"")&&p[b]},s=function(a,b){r(a,b)||a.setAttribute("class",(a[i]("class")||"").trim()+" "+b)},t=function(a,b){var c;(c=r(a,b))&&a.setAttribute("class",(a[i]("class")||"").replace(c," "))},u=function(a,b,c){var d=c?h:"removeEventListener";c&&u(a,b),o.forEach(function(c){a[d](c,b)})},v=function(a,d,e,f,g){var h=b.createEvent("CustomEvent");return e||(e={}),e.instance=c,h.initCustomEvent(d,!f,!g,e),a.dispatchEvent(h),h},w=function(b,c){var e;!g&&(e=a.picturefill||d.pf)?e({reevaluate:!0,elements:[b]}):c&&c.src&&(b.src=c.src)},x=function(a,b){return(getComputedStyle(a,null)||{})[b]},y=function(a,b,c){for(c=c||a.offsetWidth;c<d.minSize&&b&&!a._lazysizesWidth;)c=b.offsetWidth,b=b.parentNode;return c},z=function(){var a,c,d=[],e=[],f=d,g=function(){var b=f;for(f=d.length?e:d,a=!0,c=!1;b.length;)b.shift()();a=!1},h=function(d,e){a&&!e?d.apply(this,arguments):(f.push(d),c||(c=!0,(b.hidden?k:l)(g)))};return h._lsFlush=g,h}(),A=function(a,b){return b?function(){z(a)}:function(){var b=this,c=arguments;z(function(){a.apply(b,c)})}},B=function(a){var b,c=0,d=125,e=666,g=e,h=function(){b=!1,c=f.now(),a()},i=m?function(){m(h,{timeout:g}),g!==e&&(g=e)}:A(function(){k(h)},!0);return function(a){var e;(a=a===!0)&&(g=44),b||(b=!0,e=d-(f.now()-c),0>e&&(e=0),a||9>e&&m?i():k(i,e))}},C=function(a){var b,c,d=99,e=function(){b=null,a()},g=function(){var a=f.now()-c;d>a?k(g,d-a):(m||e)(e)};return function(){c=f.now(),b||(b=k(g,d))}},D=function(){var c,g,l,m,o,p,y,D,F,G,H,I,J,K,L,M=/^img$/i,N=/^iframe$/i,O="onscroll"in a&&!/glebot/.test(navigator.userAgent),P=0,Q=0,R=0,S=-1,T=function(a){R--,a&&a.target&&u(a.target,T),(!a||0>R||!a.target)&&(R=0)},U=function(a,c){var d,f=a,g="hidden"==x(b.body,"visibility")||"hidden"!=x(a,"visibility");for(F-=c,I+=c,G-=c,H+=c;g&&(f=f.offsetParent)&&f!=b.body&&f!=e;)g=(x(f,"opacity")||1)>0,g&&"visible"!=x(f,"overflow")&&(d=f.getBoundingClientRect(),g=H>d.left&&G<d.right&&I>d.top-1&&F<d.bottom+1);return g},V=function(){var a,f,h,j,k,m,n,p,q;if((o=d.loadMode)&&8>R&&(a=c.length)){f=0,S++,null==K&&("expand"in d||(d.expand=e.clientHeight>500&&e.clientWidth>500?500:370),J=d.expand,K=J*d.expFactor),K>Q&&1>R&&S>2&&o>2&&!b.hidden?(Q=K,S=0):Q=o>1&&S>1&&6>R?J:P;for(;a>f;f++)if(c[f]&&!c[f]._lazyRace)if(O)if((p=c[f][i]("data-expand"))&&(m=1*p)||(m=Q),q!==m&&(y=innerWidth+m*L,D=innerHeight+m,n=-1*m,q=m),h=c[f].getBoundingClientRect(),(I=h.bottom)>=n&&(F=h.top)<=D&&(H=h.right)>=n*L&&(G=h.left)<=y&&(I||H||G||F)&&(d.loadHidden||"hidden"!=x(c[f],"visibility"))&&(l&&3>R&&!p&&(3>o||4>S)||U(c[f],m))){if(ba(c[f]),k=!0,R>9)break}else!k&&l&&!j&&4>R&&4>S&&o>2&&(g[0]||d.preloadAfterLoad)&&(g[0]||!p&&(I||H||G||F||"auto"!=c[f][i](d.sizesAttr)))&&(j=g[0]||c[f]);else ba(c[f]);j&&!k&&ba(j)}},W=B(V),X=function(a){s(a.target,d.loadedClass),t(a.target,d.loadingClass),u(a.target,Z)},Y=A(X),Z=function(a){Y({target:a.target})},$=function(a,b){try{a.contentWindow.location.replace(b)}catch(c){a.src=b}},_=function(a){var b,c=a[i](d.srcsetAttr);(b=d.customMedia[a[i]("data-media")||a[i]("media")])&&a.setAttribute("media",b),c&&a.setAttribute("srcset",c)},aa=A(function(a,b,c,e,f){var g,h,j,l,o,p;(o=v(a,"lazybeforeunveil",b)).defaultPrevented||(e&&(c?s(a,d.autosizesClass):a.setAttribute("sizes",e)),h=a[i](d.srcsetAttr),g=a[i](d.srcAttr),f&&(j=a.parentNode,l=j&&n.test(j.nodeName||"")),p=b.firesLoad||"src"in a&&(h||g||l),o={target:a},p&&(u(a,T,!0),clearTimeout(m),m=k(T,2500),s(a,d.loadingClass),u(a,Z,!0)),l&&q.call(j.getElementsByTagName("source"),_),h?a.setAttribute("srcset",h):g&&!l&&(N.test(a.nodeName)?$(a,g):a.src=g),f&&(h||l)&&w(a,{src:g})),a._lazyRace&&delete a._lazyRace,t(a,d.lazyClass),z(function(){(!p||a.complete&&a.naturalWidth>1)&&(p?T(o):R--,X(o))},!0)}),ba=function(a){var b,c=M.test(a.nodeName),e=c&&(a[i](d.sizesAttr)||a[i]("sizes")),f="auto"==e;(!f&&l||!c||!a.src&&!a.srcset||a.complete||r(a,d.errorClass))&&(b=v(a,"lazyunveilread").detail,f&&E.updateElem(a,!0,a.offsetWidth),a._lazyRace=!0,R++,aa(a,b,f,e,c))},ca=function(){if(!l){if(f.now()-p<999)return void k(ca,999);var a=C(function(){d.loadMode=3,W()});l=!0,d.loadMode=3,W(),j("scroll",function(){3==d.loadMode&&(d.loadMode=2),a()},!0)}};return{_:function(){p=f.now(),c=b.getElementsByClassName(d.lazyClass),g=b.getElementsByClassName(d.lazyClass+" "+d.preloadClass),L=d.hFac,j("scroll",W,!0),j("resize",W,!0),a.MutationObserver?new MutationObserver(W).observe(e,{childList:!0,subtree:!0,attributes:!0}):(e[h]("DOMNodeInserted",W,!0),e[h]("DOMAttrModified",W,!0),setInterval(W,999)),j("hashchange",W,!0),["focus","mouseover","click","load","transitionend","animationend","webkitAnimationEnd"].forEach(function(a){b[h](a,W,!0)}),/d$|^c/.test(b.readyState)?ca():(j("load",ca),b[h]("DOMContentLoaded",W),k(ca,2e4)),c.length?(V(),z._lsFlush()):W()},checkElems:W,unveil:ba}}(),E=function(){var a,c=A(function(a,b,c,d){var e,f,g;if(a._lazysizesWidth=d,d+="px",a.setAttribute("sizes",d),n.test(b.nodeName||""))for(e=b.getElementsByTagName("source"),f=0,g=e.length;g>f;f++)e[f].setAttribute("sizes",d);c.detail.dataAttr||w(a,c.detail)}),e=function(a,b,d){var e,f=a.parentNode;f&&(d=y(a,f,d),e=v(a,"lazybeforesizes",{width:d,dataAttr:!!b}),e.defaultPrevented||(d=e.detail.width,d&&d!==a._lazysizesWidth&&c(a,f,e,d)))},f=function(){var b,c=a.length;if(c)for(b=0;c>b;b++)e(a[b])},g=C(f);return{_:function(){a=b.getElementsByClassName(d.autosizesClass),j("resize",g)},checkElems:g,updateElem:e}}(),F=function(){F.i||(F.i=!0,E._(),D._())};return function(){var b,c={lazyClass:"lazyload",loadedClass:"lazyloaded",loadingClass:"lazyloading",preloadClass:"lazypreload",errorClass:"lazyerror",autosizesClass:"lazyautosizes",srcAttr:"data-src",srcsetAttr:"data-srcset",sizesAttr:"data-sizes",minSize:40,customMedia:{},init:!0,expFactor:1.5,hFac:.8,loadMode:2,loadHidden:!0};d=a.lazySizesConfig||a.lazysizesConfig||{};for(b in c)b in d||(d[b]=c[b]);a.lazySizesConfig=d,k(function(){d.init&&F()})}(),c={cfg:d,autoSizer:E,loader:D,init:F,uP:w,aC:s,rC:t,hC:r,fire:v,gW:y,rAF:z}}});