sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History"],function(n,o){"use strict";return n.extend("frontend.bbs.controller.notFound",{onInit:function(){},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(n){var t,e;t=o.getInstance();e=t.getPreviousHash();if(e!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}}})});