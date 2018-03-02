(function (exports) {
'use strict';

var AISEvents = {
  CHOOSE_PROVIDER: "chooseprovider",
  AUTHENTICATED: "authenticated",
  AUTHENTICATION_FAILED: "authenticationfailed",
  AUTHORIZED: "authorized",
  AUTHORIZATION_FAILED: "authorizationfailed"
};

var Chooser = function Chooser(plugin, response) {
  babelHelpers.classCallCheck(this, Chooser);

  var create = akamai.amp.Utils.createElement;
  var chooser = create("amp-ais-chooser", chooser);
  var title = create("amp-ais-chooser-title", chooser, "Choose your provider");
  var grid = create("amp-ais-chooser-grid", chooser);
  var menu = create("amp-ais-chooser-menu", chooser);
  var label = create("amp-ais-chooser-label", menu, "Providers: ");
  var select = create("amp-ais-chooser-select", menu, null, "select");
  var login = create("amp-ais-chooser-login", menu, "Login", "button");
  login.onclick = function (event) {
    var idpId = select.options[select.selectedIndex].value;
    plugin.login(idpId);
  };

  // create thumbnail grid
  var idps = response.possible_idps;
  var groups = response.grouped_idps;
  var logos = plugin.config.logos || {};
  var base = logos.base || "";

  if (groups != null && logos.group != null) {
    var featuredGroup = groups.filter(function (group) {
      return group.name === logos.group;
    })[0];
    if (featuredGroup != null) {
      featuredGroup.members.forEach(function (member) {
        var idp = idps[member];
        var div = create("amp-ais-chooser-grid-item", grid);
        div.onclick = plugin.login.bind(plugin, member);

        if (idps[member].logos && idps[member].logos[logos.key]) {
          var img = create("amp-ais-chooser-grid-cell-img", div, null, "img");
          var src = idp.logos[logos.key];
          img.src = src.indexOf("http") === -1 ? base + src : src;
          img.alt = idp.display_name;
        }

        var span = create("amp-ais-chooser-grid-cell-label", div, idp.display_name, "span");
      });
    }
  }

  if (grid.innerHTML) {
    chooser.classList.add("amp-ais-chooser-featured");
    label.textContent = "Other ";
  }

  // populate select menu
  var options = select.options;
  var footprints = response.footprints || [];

  footprints.forEach(function (key) {
    select.add(new Option("" + idps[key].display_name, key));
  });

  for (var key in idps) {
    select.add(new Option("" + idps[key].display_name, key));
  }

  // add the chooser to the player's UI
  plugin.player.container.appendChild(chooser);
};

var AIS = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(AIS, _akamai$amp$Plugin);

  function AIS(player, config) {
    babelHelpers.classCallCheck(this, AIS);

    var _this = babelHelpers.possibleConstructorReturn(this, (AIS.__proto__ || Object.getPrototypeOf(AIS)).call(this, player, config));

    _this.feature = "auth";
    _this.client = window.ais_client;
    _this.client.setLogging(_this.debug); // Enable AIS logging, log to console.log
    _this.client.setPlatformId(_this.config.platformId); // Set AIS platform_id
    _this.client.setUseCache(_this.config.useCache === true);

    // setup media transform
    if (_this.config.transform !== false) {
      _this.player.addTransform(akamai.amp.TransformType.MEDIA, { transform: _this.mediaTransform.bind(_this), priority: 1 });
    }
    return _this;
  }

  babelHelpers.createClass(AIS, [{
    key: "mediaTransform",
    value: function mediaTransform(media) {
      var _this2 = this;

      var status = media.status;
      if (this.player.security.authorized === true) return media;

      this.player.busy = true;

      return this.authenticate().then(function () {
        _this2.logger.log("[AMP AIS] Authenticated");
        return _this2.authorize();
      }).then(function (authorization) {
        _this2.logger.log("[AMP AIS] Authorized");
        media.authorization = authorization;
        _this2.player.busy = false;
        return media;
      });
    }
  }, {
    key: "request",
    value: function request(type) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var _this3 = this;

      var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : type;

      return new Promise(function (resolve, reject) {
        try {
          _this3.client.assignhandler(event, function (type, resp) {
            resolve(resp);
          });
          _this3.client[type].apply(_this3.client, args);
        } catch (error) {
          reject(error);
        }
      });
    }
  }, {
    key: "bounce",
    value: function bounce() {
      return this.request("bounce");
    }
  }, {
    key: "init",
    value: function init() {
      return this.request("init");
    }
  }, {
    key: "chooser",
    value: function chooser() {
      var _this4 = this;

      return this.request("chooser").then(function (response) {
        _this4.idps = response.possible_idps = _this4.sort(response.possible_idps, "value", "display_name");
        _this4.player.busy = false;
        return new Promise(function (resolve, reject) {
          _this4.chooser = new Chooser(_this4, response);
          _this4.dispatch(AISEvents.CHOOSE_PROVIDER, response);
        });
      });
    }
  }, {
    key: "identity",
    value: function identity() {
      return this.request("identity");
    }
  }, {
    key: "resourceAccess",
    value: function resourceAccess(resourceId) {
      return this.request("resourceAccess", "authz_query", resourceId);
    }
  }, {
    key: "canPreview",
    value: function canPreview() {
      var preview = this.data.preview;
      return preview && typeof preview.duration == "number";
    }
  }, {
    key: "preview",
    value: function preview() {
      return Promise.reject();
    }
  }, {
    key: "fail",
    value: function fail() {
      if (this.canPreview()) {
        return this.preview();
      } else {
        return this.chooser();
      }
    }
  }, {
    key: "authenticate",
    value: function authenticate() {
      var _this5 = this;

      return this.bounce().then(function (response) {
        if (response.authenticated === true) {
          return _this5.init().then(function (response) {
            var key = Object.keys(response.idps)[0];
            _this5.idps = Object.assign({ key: key }, response.idps[key]);
            if (_this5.config.logos && _this5.idps.logos) {
              _this5.idps.logo = _this5.config.logos.base + _this5.idps.logos[_this5.config.logos.key];
            }

            // logout can be triggered by the server, so add the
            // listener here instead of waiting for the logout API call
            _this5.client.assignhandler('logout_result', function () {
              // Reload experience to restart workflow, could be returned in AuthZ
              top.location.href = top.location.href;
            });

            _this5.dispatch(AISEvents.AUTHENTICATED, _this5.idps);
          });
        } else {
          _this5.dispatch(AISEvents.AUTHENTICATION_FAILED, response);
          return _this5.fail();
        }
      });
    }
  }, {
    key: "authorize",
    value: function authorize() {
      var _this6 = this;

      var resourceId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.config.resourceId;

      return this.resourceAccess(resourceId).then(function (response) {
        if (response.authorization === true) {
          _this6.viewerId = _this6.client.aisuid;
          var auth = { key: _this6.config.query || "hdnts", token: response.security_token };
          _this6.dispatch(AISEvents.AUTHORIZED, auth);
          return auth;
        } else {
          _this6.dispatch(AISEvents.AUTHORIZATION_FAILED, response);
          return _this6.fail();
        }
      });
    }
  }, {
    key: "sort",
    value: function sort(obj, sortType, valueName) {
      // Object sorter, used for chooser data
      var returnObj = {};
      var data = [];
      var index = 0;

      for (var key in obj) {
        data[index] = {
          key: key,
          value: obj[key][valueName] || ""
        };
        index++;
      }

      data.sort(function (a, b) {
        var valueA = sortType === "value" ? a.value.toLowerCase() : a.key.toLowercase();
        var valueB = sortType === "value" ? b.value.toLowerCase() : b.key.toLowercase();

        if (valueA < valueB) {
          // sort string ascending
          return -1;
        } else if (valueA > valueB) {
          return 1;
        } else {
          return 0; // default return value (no sorting)
        }
      });

      // Build new object based on sorted array
      return data.reduce(function (map, item) {
        map[item.key] = obj[item.key];
        return map;
      }, {});
    }
  }, {
    key: "getTarget",
    value: function getTarget() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "redirect";

      return this.config.responseTargets[method];
    }
  }, {
    key: "setRedirect",
    value: function setRedirect(method) {
      try {
        var devToken = /\/dev\./;
        var loc = window.top.location.href || window.top.location;
        var domain = devToken.test(loc) ? loc.replace(devToken, "/") : null;
        akamai.amp.Cookies.setCookie(this.getTarget(method), loc, 1, "/", domain);
      } catch (error) {}
    }
  }, {
    key: "launchIdp",
    value: function launchIdp(idp_platform_id) {
      var idp = idp_platform_id != null ? this.idps[idp_platform_id] : this.idps;
      var display = idp.window_display || {};
      var method = display.method != null ? display.method : "redirect";
      var target = this.getTarget(method);
      var format = idp_platform_id != null ? this.client.loginFormat(idp_platform_id, target) : this.client.logoutFormat(target);

      this.setRedirect(method);

      switch (method) {
        case "redirect":
          window.open(format, "_top"); // Full page redirect
          break;
        case "popup":
          //method = display.method || "popup"
          var width = display.width || 320;
          var height = display.height || 240;
          window.open(format, "ais_popup", "width=" + width + ",height=" + height);
      }
    }
  }, {
    key: "login",
    value: function login(idp_platform_id) {
      this.launchIdp(idp_platform_id);
    }
  }, {
    key: "logout",
    value: function logout() {
      this.launchIdp();
    }
  }]);
  return AIS;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("ais", akamai.amp.Plugin.createFactory(AIS));

exports.AIS = AIS;
exports.AISEvents = AISEvents;

}((this.akamai.amp.ais = this.akamai.amp.ais || {})));
//# sourceMappingURL=Ais.js.map
